import test from "node:test";
import assert from "node:assert/strict";
import { createTollHandler } from "../src/toll.js";

test("returns HTTP 402 with a payment challenge before protected access", async () => {
  const handler = createTollHandler({
    asset: "native",
    price: 250_000,
    verifyReceipt: async () => false,
  });

  const response = await handler({ headers: {} });

  assert.equal(response.status, 402);
  assert.equal(response.body.price, 250_000);
  assert.equal(response.body.asset, "native");
});

test("returns a deterministic protected result after receipt verification", async () => {
  const handler = createTollHandler({
    asset: "native",
    price: 250_000,
    verifyReceipt: async (receipt) => receipt === "verified-receipt",
  });

  const response = await handler({
    headers: { "x-payment-receipt": "verified-receipt" },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { summary: "Access granted" });
});
