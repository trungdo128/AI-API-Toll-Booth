import { describe, expect, it } from "vitest";
import { HttpException } from "@nestjs/common";
import { AppController } from "../src/app.controller.js";
import { PaymentChallengeService } from "../src/payment/payment-challenge.service.js";

describe("AppController", () => {
  it("returns a machine-readable HTTP 402 challenge", async () => {
    const controller = new AppController(
      new PaymentChallengeService(() => new Date("2026-07-28T10:00:00Z")),
      { has: async () => false },
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
    });
    await expect(controller.protectedApi("verified", "sha256:request")).resolves.toEqual({
      summary: "Access granted",
      deterministic: true,
    });
  });
});
