import { describe, expect, it } from "vitest";
import { PaymentVerifierService } from "../src/payment/payment-verifier.service.js";

const requirement = {
  network: "TESTNET" as const,
  asset: "native",
  recipient: "GDESTINATION",
  amount: "300000",
};

describe("PaymentVerifierService", () => {
  it("accepts one confirmed Testnet payment with exact asset, recipient, and amount", async () => {
    const service = new PaymentVerifierService({
      transaction: async () => ({
        successful: true,
        ledger: 123,
        sourceAccount: "GPAYER",
        operation: { type: "payment", asset: "native", destination: "GDESTINATION", amount: "0.0300000" },
      }),
    });

    await expect(service.verify("abc123", requirement)).resolves.toMatchObject({
      transactionHash: "abc123",
      payerAddress: "GPAYER",
      ledger: 123,
    });
    await expect(service.verify("abc123", requirement)).rejects.toThrow("Payment transaction already used");
  });

  it("rejects wrong recipient, amount, asset, and failed transactions", async () => {
    const lookup = (operation: Record<string, string>, successful = true) => new PaymentVerifierService({
      transaction: async () => ({
        successful,
        ledger: 123,
        sourceAccount: "GPAYER",
        operation: { type: "payment", asset: "native", destination: "GDESTINATION", amount: "0.0300000", ...operation },
      }),
    });

    await expect(lookup({ destination: "GWRONG" }).verify("wrong-recipient", requirement))
      .rejects.toThrow("Wrong payment recipient");
    await expect(lookup({ amount: "0.0200000" }).verify("wrong-amount", requirement))
      .rejects.toThrow("Wrong payment amount");
    await expect(lookup({ asset: "USDC:GISSUER" }).verify("wrong-asset", requirement))
      .rejects.toThrow("Wrong payment asset");
    await expect(lookup({}, false).verify("failed", requirement))
      .rejects.toThrow("Payment transaction is not confirmed");
  });

  it("accepts a payment requirement on the configured Mainnet network", async () => {
    const service = new PaymentVerifierService({
      transaction: async () => ({
        successful: true,
        ledger: 123,
        sourceAccount: "GPAYER",
        operation: { type: "payment", asset: "native", destination: "GDESTINATION", amount: "0.0300000" },
      }),
    }, "PUBLIC");

    await expect(service.verify("mainnet-payment", { ...requirement, network: "PUBLIC" }))
      .resolves.toMatchObject({ payerAddress: "GPAYER" });
  });
});
