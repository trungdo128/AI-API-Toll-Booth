import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Inject, Injectable, Optional } from "@nestjs/common";
import { PrismaService } from "../database/prisma.service.js";

export type PaymentRequirement = {
  apiId: string;
  requestHash: string;
  network: "TESTNET";
  asset: string;
  recipient: string;
  amount: string;
};

export type PaymentChallenge = PaymentRequirement & {
  id: string;
  nonce: string;
  expiresAt: string;
  transactionHash?: string;
};

export const CHALLENGE_CLOCK = Symbol("CHALLENGE_CLOCK");

@Injectable()
export class PaymentChallengeService {
  private readonly challenges = new Map<string, PaymentChallenge>();

  constructor(
    @Optional() @Inject(CHALLENGE_CLOCK) private readonly now: () => Date = () => new Date(),
    @Optional() private readonly prisma?: PrismaService,
  ) {}

  async issue(requirement: PaymentRequirement): Promise<PaymentChallenge> {
    const challenge = {
      ...requirement,
      id: randomUUID(),
      nonce: randomBytes(32).toString("hex"),
      expiresAt: new Date(this.now().getTime() + 5 * 60_000).toISOString(),
    };
    this.challenges.set(challenge.id, challenge);
    if (this.prisma) {
      const product = await this.prisma.apiProduct.findFirst({
        where: {
          slug: requirement.apiId,
          active: true,
          plans: { some: { asset: requirement.asset, amount: BigInt(requirement.amount) } },
        },
      });
      if (!product) throw new Error("Active API plan not found");
      await this.prisma.paymentChallenge.create({
        data: {
          id: challenge.id,
          apiProductId: product.id,
          requestHash: requirement.requestHash,
          nonceHash: createHash("sha256").update(challenge.nonce).digest("hex"),
          network: requirement.network,
          asset: requirement.asset,
          recipient: requirement.recipient,
          amount: BigInt(requirement.amount),
          expiresAt: new Date(challenge.expiresAt),
        },
      });
    }
    return challenge;
  }

  async get(id: string): Promise<PaymentChallenge> {
    let challenge = this.challenges.get(id);
    if (!challenge && this.prisma) {
      const stored = await this.prisma.paymentChallenge.findUnique({
        where: { id },
        include: { apiProduct: { select: { slug: true } }, receipt: true },
      });
      if (stored) {
        challenge = {
          id: stored.id,
          apiId: stored.apiProduct.slug,
          requestHash: stored.requestHash,
          network: "TESTNET",
          asset: stored.asset,
          recipient: stored.recipient,
          amount: stored.amount.toString(),
          nonce: "",
          expiresAt: stored.expiresAt.toISOString(),
          transactionHash: stored.receipt?.transactionHash,
        };
      }
    }
    if (!challenge) throw new Error("Payment challenge not found");
    if (challenge.transactionHash) throw new Error("Payment challenge already used");
    if (new Date(challenge.expiresAt) <= this.now()) throw new Error("Payment challenge expired");
    return challenge;
  }

  async consume(
    id: string,
    transactionHash: string,
    verification?: { ledger: number; payerAddress: string; confirmedAt: string },
  ): Promise<PaymentChallenge> {
    const challenge = await this.get(id);
    if (this.prisma && verification) {
      await this.prisma.$transaction(async (database) => {
        const consumed = await database.paymentChallenge.updateMany({
          where: { id, status: "PENDING", consumedAt: null },
          data: { status: "CONFIRMED", consumedAt: this.now() },
        });
        if (consumed.count !== 1) throw new Error("Payment challenge already used");
        await database.paymentReceipt.create({
          data: {
            challengeId: id,
            transactionHash,
            ledger: verification.ledger,
            payerAddress: verification.payerAddress,
            confirmedAt: new Date(verification.confirmedAt),
          },
        });
      });
    }
    challenge.transactionHash = transactionHash;
    return challenge;
  }
}
