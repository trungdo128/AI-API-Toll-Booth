import { describe, expect, it } from "vitest";
import { HorizonTransactionLookup } from "../src/payment/horizon-transaction.lookup.js";

describe("HorizonTransactionLookup", () => {
  it("normalizes a confirmed native payment from the configured Testnet Horizon", async () => {
    const responses = [
      { successful: true, ledger: 42, source_account: "GPAYER" },
      { _embedded: { records: [{ type: "payment", asset_type: "native", to: "GDEST", amount: "1.2500000" }] } },
    ];
    const requested: string[] = [];
    const lookup = new HorizonTransactionLookup("https://horizon-testnet.stellar.org", async (url) => {
      requested.push(String(url));
      return new Response(JSON.stringify(responses.shift()), { status: 200 });
    });

    await expect(lookup.transaction("b".repeat(64))).resolves.toEqual({
      successful: true,
      ledger: 42,
      sourceAccount: "GPAYER",
      operation: { type: "payment", asset: "native", destination: "GDEST", amount: "1.2500000" },
    });
    expect(requested).toHaveLength(2);
  });

  it("rejects non-hex hashes before network access", async () => {
    const lookup = new HorizonTransactionLookup("https://horizon-testnet.stellar.org", async () => {
      throw new Error("must not fetch");
    });
    await expect(lookup.transaction("not-a-hash")).rejects.toThrow("Invalid transaction hash");
  });

  it("allows the official Stellar Mainnet Horizon endpoint", () => {
    expect(() => new HorizonTransactionLookup("https://horizon.stellar.org", async () => new Response()))
      .not.toThrow();
  });
});
