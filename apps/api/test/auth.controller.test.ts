import { BadRequestException } from "@nestjs/common";
import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { AuthController } from "../src/auth/auth.controller.js";
import { WalletAuthService } from "../src/auth/wallet-auth.service.js";

describe("AuthController", () => {
  it("requires an allowed request origin", async () => {
    const controller = new AuthController(new WalletAuthService(() => new Date(), ["https://app.example"]));
    await expect(controller.challenge(undefined, { address: Keypair.random().publicKey() }))
      .rejects.toThrow(BadRequestException);
  });

  it("issues a challenge without accepting a public key as authentication", async () => {
    const wallet = Keypair.random();
    const controller = new AuthController(
      new WalletAuthService(() => new Date("2026-07-28T10:00:00Z"), ["https://app.example"]),
    );
    const response = await controller.challenge("https://app.example", { address: wallet.publicKey() });
    expect(response).toMatchObject({ network: "TESTNET" });
    expect(response).not.toHaveProperty("token");
  });
});
