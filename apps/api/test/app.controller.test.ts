import { describe, expect, it } from "vitest";
import { HttpException } from "@nestjs/common";
import { AppController } from "../src/app.controller.js";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";
import type { StellarSettings } from "../src/config/stellar.config.js";

const mainnet: StellarSettings = {
  network: "PUBLIC",
  horizonUrl: "https://horizon.stellar.org",
  paymentAsset: "native",
  paymentRecipient: "GCKJEORLGORT3BOUME2DQJQPKRSKST55BIZOSDZTNJ7FIGIV4KQMDDPX",
};

describe("AppController", () => {
  it("returns a machine-readable HTTP 402 challenge", async () => {
    const controller = new AppController(
      new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z")),
      { has: async () => false },
      mainnet,
    );

    try {
      await controller.protectedApi(undefined, "sha256:request");
      throw new Error("expected HTTP 402");
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      const response = (error as HttpException).getResponse() as Record<string, unknown>;
      expect((error as HttpException).getStatus()).toBe(402);
      expect(response).toMatchObject({
        paymentRequired: true,
        network: "PUBLIC",
        requestHash: "sha256:request",
        recipient: "GCKJEORLGORT3BOUME2DQJQPKRSKST55BIZOSDZTNJ7FIGIV4KQMDDPX",
      });
    }
  });

  it("returns deterministic protected data for a known receipt", async () => {
    const controller = new AppController(new PaymentChallengeService(), {
      has: async (receipt) => receipt === "verified",
    }, mainnet);
    await expect(controller.protectedApi("verified", "sha256:request")).resolves.toEqual({
      summary: "Access granted",
      deterministic: true,
    });
  });

  it("issues the challenge on the configured network and recipient", async () => {
    const testnetRecipient = "GAFV5SVNYDD65YJ2KBX7TY75UWWQ6P5Y4ULB2ZJCKJQ4Z6HJX524UP5Q";
    const controller = new AppController(
      new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z")),
      { has: async () => false },
      {
        network: "TESTNET",
        horizonUrl: "https://horizon-testnet.stellar.org",
        paymentAsset: "USDC",
        paymentRecipient: testnetRecipient,
      },
    );

    const error = await controller.protectedApi(undefined, "sha256:request").catch((thrown) => thrown);
    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getResponse()).toMatchObject({
      network: "TESTNET",
      asset: "USDC",
      recipient: testnetRecipient,
    });
  });

  it("reports the configured network on the health probe", () => {
    const controller = new AppController(new PaymentChallengeService(), { has: async () => false }, {
      ...mainnet,
      network: "TESTNET",
      horizonUrl: "https://horizon-testnet.stellar.org",
    });

    expect(controller.health()).toMatchObject({ network: "TESTNET" });
  });
});
