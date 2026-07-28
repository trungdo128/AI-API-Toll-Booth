import { describe, expect, it } from "vitest";
import { PaymentController } from "../src/payment/payment.controller.js";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";
import { ReceiptRegistry } from "../src/receipt-registry.js";

describe("PaymentController", () => {
  it("verifies before consuming a challenge and exposes the resulting receipt", async () => {
    const challenges = new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z"));
    const challenge = challenges.issue({
      apiId: "summarizer",
      requestHash: "sha256:paid",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    const receipts = new ReceiptRegistry();
    const txHash = "a".repeat(64);
    const controller = new PaymentController(challenges, {
      verify: async () => ({
        transactionHash: txHash,
        ledger: 123,
        payerAddress: "GPAYER",
        confirmedAt: "2026-07-28T10:01:00.000Z",
      }),
    }, receipts);

    const result = await controller.verify({ challengeId: challenge.id, transactionHash: txHash });
    expect(result).toMatchObject({ receipt: txHash, network: "TESTNET", requestHash: "sha256:paid" });
    expect(receipts.has(txHash)).toBe(true);
    await expect(controller.verify({ challengeId: challenge.id, transactionHash: txHash }))
      .rejects.toThrow("Payment challenge already used");
  });
});
