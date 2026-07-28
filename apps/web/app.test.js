import test from "node:test";
import assert from "node:assert/strict";
import { requestProtectedApi } from "./app.js";

test("shows the payment challenge returned by the protected API", async () => {
  const calls = [];
  const result = await requestProtectedApi("", async (url, options) => {
    calls.push({ url, options });
    return { status: 402, json: async () => ({ asset: "native", price: 300_000, paymentRequired: true }) };
  });

  assert.equal(calls[0].url, "/api/protected");
  assert.deepEqual(calls[0].options.headers, {});
  assert.equal(result.status, 402);
  assert.equal(result.body.price, 300_000);
});

test("sends a supplied payment receipt", async () => {
  const result = await requestProtectedApi("receipt-1", async (_url, options) => ({
    status: 200,
    json: async () => ({ receipt: options.headers["x-payment-receipt"], summary: "Access granted" }),
  }));

  assert.deepEqual(result.body, { receipt: "receipt-1", summary: "Access granted" });
});
