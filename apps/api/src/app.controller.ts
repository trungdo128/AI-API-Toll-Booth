import { Controller, Get, Header, Headers, HttpException, Inject } from "@nestjs/common";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";

@Controller()
export class AppController {
  constructor(
    private readonly challenges: PaymentChallengeService,
    @Inject(ReceiptRegistry) private readonly receipts: Pick<ReceiptRegistry, "has">,
  ) {}

  @Get("health")
  health() {
    return { status: "ok", service: "ai-api-toll-booth", network: "PUBLIC" };
  }

  @Get("api/protected")
  @Header("Cache-Control", "no-store")
  async protectedApi(
    @Headers("x-payment-receipt") receipt?: string,
    @Headers("x-request-hash") requestHash = "sha256:demo-request",
  ) {
    if (receipt && await this.receipts.has(receipt)) {
      return { summary: "Access granted", deterministic: true };
    }

    const challenge = await this.challenges.issue({
      apiId: "text-summarizer",
      requestHash,
      network: "PUBLIC",
      asset: process.env.PAYMENT_ASSET || "native",
      recipient: "GCKJEORLGORT3BOUME2DQJQPKRSKST55BIZOSDZTNJ7FIGIV4KQMDDPX",
      amount: "300000",
    });
    throw new HttpException({ paymentRequired: true, ...challenge }, 402);
  }
}
