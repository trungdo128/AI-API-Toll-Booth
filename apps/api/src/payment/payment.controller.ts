import { BadRequestException, Body, Controller, Inject, Post, UnprocessableEntityException } from "@nestjs/common";
import { z } from "zod";
import { ReceiptRegistry } from "../receipt-registry.js";
import { PaymentChallengeService } from "./payment-challenge.service.js";
import { PaymentVerifierService } from "./payment-verifier.service.js";

const verificationInput = z.object({
  challengeId: z.uuid(),
  transactionHash: z.string().regex(/^[a-f0-9]{64}$/i),
}).strict();

export const PAYMENT_VERIFIER = Symbol("PAYMENT_VERIFIER");

@Controller("api/payments")
export class PaymentController {
  constructor(
    private readonly challenges: PaymentChallengeService,
    @Inject(PAYMENT_VERIFIER) private readonly verifier: Pick<PaymentVerifierService, "verify">,
    private readonly receipts: ReceiptRegistry,
  ) {}

  @Post("verify")
  async verify(@Body() body: unknown) {
    const input = verificationInput.safeParse(body);
    if (!input.success) throw new BadRequestException("Invalid payment verification request");
    try {
      const challenge = this.challenges.get(input.data.challengeId);
      const verification = await this.verifier.verify(input.data.transactionHash, challenge);
      this.challenges.consume(challenge.id, input.data.transactionHash);
      this.receipts.add(input.data.transactionHash);
      return {
        receipt: input.data.transactionHash,
        network: challenge.network,
        apiId: challenge.apiId,
        requestHash: challenge.requestHash,
        ...verification,
      };
    } catch (error) {
      throw new UnprocessableEntityException(
        error instanceof Error ? error.message : "Payment verification failed",
      );
    }
  }
}
