import { describe, expect, it } from "vitest";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";

describe("PaymentChallengeService", () => {
  it("binds a short-lived challenge to the original request", () => {
    const service = new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z"));
    const challenge = service.issue({
      apiId: "summarizer",
      requestHash: "sha256:abc",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });

    expect(challenge.nonce).toMatch(/^[a-f0-9]{64}$/);
    expect(challenge.expiresAt).toBe("2026-07-28T10:05:00.000Z");
    expect(challenge.requestHash).toBe("sha256:abc");
  });

  it("rejects an expired or reused challenge", () => {
    let now = new Date("2026-07-28T10:00:00Z");
    const service = new PaymentChallengeService(() => now);
    const first = service.issue({
      apiId: "summarizer",
      requestHash: "sha256:one",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    service.consume(first.id, "tx-1");
    expect(() => service.consume(first.id, "tx-1")).toThrow("Payment challenge already used");

    const second = service.issue({
      apiId: "summarizer",
      requestHash: "sha256:two",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    now = new Date("2026-07-28T10:06:00Z");
    expect(() => service.consume(second.id, "tx-2")).toThrow("Payment challenge expired");
  });
});
