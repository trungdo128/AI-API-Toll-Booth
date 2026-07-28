import { BadRequestException } from "@nestjs/common";
import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { AuthController } from "../src/auth/auth.controller.js";
import { WalletAuthService } from "../src/auth/wallet-auth.service.js";

describe("AuthController", () => {
  it("requires an allowed request origin", () => {
    const controller = new AuthController(new WalletAuthService(() => new Date(), ["https://app.example"]));
    expect(() => controller.challenge(undefined, { address: Keypair.random().publicKey() }))
      .toThrow(BadRequestException);
  });

  it("issues a challenge without accepting a public key as authentication", () => {
    const wallet = Keypair.random();
    const controller = new AuthController(
      new WalletAuthService(() => new Date("2026-07-28T10:00:00Z"), ["https://app.example"]),
    );
    const response = controller.challenge("https://app.example", { address: wallet.publicKey() });
    expect(response).toMatchObject({ network: "TESTNET" });
    expect(response).not.toHaveProperty("token");
  });
});
