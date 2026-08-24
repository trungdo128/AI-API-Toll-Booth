import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AuthController } from "./auth/auth.controller.js";
import { ALLOWED_ORIGINS, WalletAuthService } from "./auth/wallet-auth.service.js";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { HorizonTransactionLookup } from "./payment/horizon-transaction.lookup.js";
import { PAYMENT_VERIFIER, PaymentController } from "./payment/payment.controller.js";
import { PaymentVerifierService } from "./payment/payment-verifier.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";
import { PrismaService } from "./database/prisma.service.js";
import { CatalogController } from "./catalog/catalog.controller.js";
import { CatalogService } from "./catalog/catalog.service.js";
import { readStellarSettings, type StellarSettings } from "./config/stellar.config.js";
import { STELLAR_SETTINGS } from "./config/stellar.tokens.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, AuthController, PaymentController, CatalogController],
  providers: [
    PaymentChallengeService,
    ReceiptRegistry,
    WalletAuthService,
    PrismaService,
    CatalogService,
    {
      provide: STELLAR_SETTINGS,
      useFactory: () => readStellarSettings(),
    },
    {
      provide: PAYMENT_VERIFIER,
      inject: [STELLAR_SETTINGS],
      useFactory: (settings: StellarSettings) => new PaymentVerifierService(
        new HorizonTransactionLookup(settings.horizonUrl),
        settings.network,
      ),
    },
    {
      provide: ALLOWED_ORIGINS,
      useFactory: () => (process.env.PUBLIC_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim()),
    },
  ],
})
export class AppModule {}
