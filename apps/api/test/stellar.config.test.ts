import { describe, expect, it } from "vitest";
import { readStellarSettings } from "../src/config/stellar.config.js";

const recipient = "GCKJEORLGORT3BOUME2DQJQPKRSKST55BIZOSDZTNJ7FIGIV4KQMDDPX";

describe("readStellarSettings", () => {
  it("defaults to Mainnet Horizon and the native asset", () => {
    const settings = readStellarSettings({ PAYMENT_RECIPIENT: recipient } as NodeJS.ProcessEnv);

    expect(settings).toEqual({
      network: "PUBLIC",
      horizonUrl: "https://horizon.stellar.org",
      paymentAsset: "native",
      paymentRecipient: recipient,
    });
  });

  it("follows STELLAR_NETWORK to the matching Horizon endpoint", () => {
    const settings = readStellarSettings({
      STELLAR_NETWORK: "testnet",
      PAYMENT_RECIPIENT: recipient,
    } as NodeJS.ProcessEnv);

    expect(settings.network).toBe("TESTNET");
    expect(settings.horizonUrl).toBe("https://horizon-testnet.stellar.org");
  });

  it("rejects a Horizon endpoint that serves the other network", () => {
    expect(() => readStellarSettings({
      STELLAR_NETWORK: "PUBLIC",
      STELLAR_HORIZON_URL: "https://horizon-testnet.stellar.org",
      PAYMENT_RECIPIENT: recipient,
    } as NodeJS.ProcessEnv)).toThrow(/must serve PUBLIC/);
  });

  it("rejects a missing or malformed payment recipient", () => {
    expect(() => readStellarSettings({} as NodeJS.ProcessEnv))
      .toThrow(/PAYMENT_RECIPIENT/);
    expect(() => readStellarSettings({ PAYMENT_RECIPIENT: "not-a-key" } as NodeJS.ProcessEnv))
      .toThrow(/PAYMENT_RECIPIENT/);
  });

  it("keeps a custom asset code", () => {
    const settings = readStellarSettings({
      PAYMENT_ASSET: "USDC",
      PAYMENT_RECIPIENT: recipient,
    } as NodeJS.ProcessEnv);

    expect(settings.paymentAsset).toBe("USDC");
  });
});
