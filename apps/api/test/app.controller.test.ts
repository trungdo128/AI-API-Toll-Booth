import { describe, expect, it } from "vitest";
import { HttpException } from "@nestjs/common";
import { AppController } from "../src/app.controller.js";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";
import type { StellarSettings } from "../src/config/stellar.config.js";

const catalog = (amount = "300000", asset = "native") => ({
  bySlug: async (slug: string) => ({
    id: slug, slug, title: slug, description: "", category: "text", provider: "Toll Booth Labs",
    plans: [{ id: "plan", name: "Per request", mode: "PER_REQUEST", asset, amount }],
  }),
});

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
      catalog(),
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
    }, mainnet, catalog());
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
      catalog("700000", "USDC"),
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
    }, catalog());

    expect(controller.health()).toMatchObject({ network: "TESTNET" });
  });

  it("prices the challenge from the requested product's own plan", async () => {
    const controller = new AppController(
      new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z")),
      { has: async () => false },
      mainnet,
      catalog("700000"),
    );

    const error = await controller
      .protectedApi(undefined, "sha256:request", "document-extractor")
      .catch((thrown) => thrown);
    expect((error as HttpException).getResponse()).toMatchObject({
      apiId: "document-extractor",
      amount: "700000",
    });
  });

  it("refuses an API that has no published plan", async () => {
    const controller = new AppController(
      new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z")),
      { has: async () => false },
      mainnet,
      { bySlug: async () => { throw new Error("API product not found"); } },
    );

    await expect(controller.protectedApi(undefined, "sha256:request", "ghost-api"))
      .rejects.toThrow(/no published plan/i);
  });
});
