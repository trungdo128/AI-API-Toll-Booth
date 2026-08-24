import { BadRequestException, Controller, Get, Header, Headers, HttpException, Inject } from "@nestjs/common";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";
import { CatalogService } from "./catalog/catalog.service.js";
import type { StellarSettings } from "./config/stellar.config.js";
import { STELLAR_SETTINGS } from "./config/stellar.tokens.js";

/** The advertised price is the cheapest published plan, matching what the site lists. */
function entryPlan(product: { plans: Array<{ asset: string; amount: string }> }) {
  return [...product.plans]
    .filter((plan) => /^\d+$/.test(plan.amount))
    .sort((left, right) => (BigInt(left.amount) < BigInt(right.amount) ? -1 : 1))[0];
}

@Controller()
export class AppController {
  constructor(
    private readonly challenges: PaymentChallengeService,
    @Inject(ReceiptRegistry) private readonly receipts: Pick<ReceiptRegistry, "has">,
    @Inject(STELLAR_SETTINGS) private readonly stellar: StellarSettings,
    @Inject(CatalogService) private readonly catalog: Pick<CatalogService, "bySlug">,
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
    @Headers("x-api-id") apiId = "text-summarizer",
  ) {
    if (receipt && await this.receipts.has(receipt)) {
      return { summary: "Access granted", deterministic: true };
    }

    // Price the call from the product's own plan. Quoting a figure fixed in source
    // makes the challenge unissuable the moment a provider republishes its price.
    const product = await this.catalog.bySlug(apiId).catch(() => null);
    const plan = product ? entryPlan(product) : undefined;
    if (!plan) throw new BadRequestException(`No published plan for API "${apiId}"`);

    const challenge = await this.challenges.issue({
      apiId,
      requestHash,
      network: this.stellar.network,
      asset: plan.asset,
      recipient: this.stellar.paymentRecipient,
      amount: plan.amount,
    });
    throw new HttpException({ paymentRequired: true, ...challenge }, 402);
  }
}
