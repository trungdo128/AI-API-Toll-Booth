import test from "node:test";
import assert from "node:assert/strict";
import { requestPaidApi } from "../src/client.js";

test("signs a challenge and retries once after HTTP 402", async () => {
  const requests = [];
  const response = await requestPaidApi({
    request: async (headers) => {
      requests.push(headers);
      return requests.length === 1
        ? { status: 402, body: { price: 250_000 } }
        : { status: 200, body: { summary: "Access granted" } };
    },
    signPayment: async (challenge) => `receipt-${challenge.price}`,
  });

  assert.equal(response.status, 200);
  assert.deepEqual(requests, [{}, { "x-payment-receipt": "receipt-250000" }]);
});
