import { randomBytes, randomUUID } from "node:crypto";
import { Inject, Injectable, Optional } from "@nestjs/common";

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
  ) {}

  issue(requirement: PaymentRequirement): PaymentChallenge {
    const challenge = {
      ...requirement,
      id: randomUUID(),
      nonce: randomBytes(32).toString("hex"),
      expiresAt: new Date(this.now().getTime() + 5 * 60_000).toISOString(),
    };
    this.challenges.set(challenge.id, challenge);
    return challenge;
  }

  consume(id: string, transactionHash: string): PaymentChallenge {
    const challenge = this.challenges.get(id);
    if (!challenge) throw new Error("Payment challenge not found");
    if (challenge.transactionHash) throw new Error("Payment challenge already used");
    if (new Date(challenge.expiresAt) <= this.now()) throw new Error("Payment challenge expired");
    challenge.transactionHash = transactionHash;
    return challenge;
  }
}
