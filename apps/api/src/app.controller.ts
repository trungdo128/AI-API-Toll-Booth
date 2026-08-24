import { Controller, Get, Header, Headers, HttpException, Inject } from "@nestjs/common";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";
import type { StellarSettings } from "./config/stellar.config.js";
import { STELLAR_SETTINGS } from "./config/stellar.tokens.js";

@Controller()
export class AppController {
  constructor(
    private readonly challenges: PaymentChallengeService,
    @Inject(ReceiptRegistry) private readonly receipts: Pick<ReceiptRegistry, "has">,
    @Inject(STELLAR_SETTINGS) private readonly stellar: StellarSettings,
  ) {}

  @Get("health")
  health() {
    return { status: "ok", service: "ai-api-toll-booth", network: this.stellar.network };
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
      network: this.stellar.network,
      asset: this.stellar.paymentAsset,
      recipient: this.stellar.paymentRecipient,
      amount: "300000",
    });
    throw new HttpException({ paymentRequired: true, ...challenge }, 402);
  }
}
