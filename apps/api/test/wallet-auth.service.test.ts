import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { WalletAuthService } from "../src/auth/wallet-auth.service.js";

describe("WalletAuthService", () => {
  it("authenticates one signed Testnet challenge and blocks replay", () => {
    const wallet = Keypair.random();
    const service = new WalletAuthService(
      () => new Date("2026-07-28T10:00:00Z"),
      ["https://app.example"],
    );
    const challenge = service.issue(wallet.publicKey(), "https://app.example");
    const signature = wallet.sign(Buffer.from(challenge.message)).toString("base64");

    const session = service.verify({
      challengeId: challenge.id,
      address: wallet.publicKey(),
      origin: "https://app.example",
      signature,
    });

    expect(session.token).toMatch(/^[a-f0-9]{64}$/);
    expect(() => service.verify({
      challengeId: challenge.id,
      address: wallet.publicKey(),
      origin: "https://app.example",
      signature,
    })).toThrow("Authentication challenge already used");
  });

  it("rejects a wrong origin, signature, or expired challenge", () => {
    const wallet = Keypair.random();
    let now = new Date("2026-07-28T10:00:00Z");
    const service = new WalletAuthService(() => now, ["https://app.example"]);
    expect(() => service.issue(wallet.publicKey(), "https://evil.example")).toThrow("Origin not allowed");

    const challenge = service.issue(wallet.publicKey(), "https://app.example");
    expect(() => service.verify({
      challengeId: challenge.id,
      address: wallet.publicKey(),
      origin: "https://app.example",
      signature: Keypair.random().sign(Buffer.from(challenge.message)).toString("base64"),
    })).toThrow("Invalid wallet signature");

    now = new Date("2026-07-28T10:06:00Z");
    expect(() => service.verify({
      challengeId: challenge.id,
      address: wallet.publicKey(),
      origin: "https://app.example",
      signature: wallet.sign(Buffer.from(challenge.message)).toString("base64"),
    })).toThrow("Authentication challenge expired");
  });
});
