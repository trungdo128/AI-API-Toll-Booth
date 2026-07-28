import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { PaymentChallengeService } from "./payment/payment-challenge.service.js";
import { ReceiptRegistry } from "./receipt-registry.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController],
  providers: [PaymentChallengeService, ReceiptRegistry],
})
export class AppModule {}
