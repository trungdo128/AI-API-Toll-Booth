import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { AuthController } from "./auth/auth.controller.js";
import { ALLOWED_ORIGINS, WalletAuthService } from "./auth/wallet-auth.service.js";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, AuthController],
  providers: [
    PaymentChallengeService,
    ReceiptRegistry,
    WalletAuthService,
    {
      provide: ALLOWED_ORIGINS,
      useFactory: () => (process.env.PUBLIC_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim()),
    },
  ],
})
export class AppModule {}
