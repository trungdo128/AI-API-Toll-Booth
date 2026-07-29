import { describe, expect, it } from "vitest";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";

describe("PaymentChallengeService", () => {
  it("binds a short-lived challenge to the original request", async () => {
    const service = new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z"));
    const challenge = await service.issue({
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

  it("rejects an expired or reused challenge", async () => {
    let now = new Date("2026-07-28T10:00:00Z");
    const service = new PaymentChallengeService(() => now);
    const first = await service.issue({
      apiId: "summarizer",
      requestHash: "sha256:one",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    await service.consume(first.id, "tx-1");
    await expect(service.consume(first.id, "tx-1")).rejects.toThrow("Payment challenge already used");

    const second = await service.issue({
      apiId: "summarizer",
      requestHash: "sha256:two",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    now = new Date("2026-07-28T10:06:00Z");
    await expect(service.consume(second.id, "tx-2")).rejects.toThrow("Payment challenge expired");
  });

  it("reads only a live unused challenge before transaction verification", async () => {
    const service = new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z"));
    const challenge = await service.issue({
      apiId: "summarizer",
      requestHash: "sha256:read",
      network: "TESTNET",
      asset: "native",
      recipient: "GDESTINATION",
      amount: "300000",
    });
    await expect(service.get(challenge.id)).resolves.toMatchObject({ requestHash: "sha256:read" });
    await service.consume(challenge.id, "tx-read");
    await expect(service.get(challenge.id)).rejects.toThrow("Payment challenge already used");
  });
});
