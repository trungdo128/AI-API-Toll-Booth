/**
 * Drives the 402 flow for one paid call: ask, pay the challenge, ask again with
 * the receipt. `apiId` selects which product to buy, because the API prices each
 * one from its own published plan and that header is what names it.
 */
export async function requestPaidApi({ request, signPayment, apiId, requestHash }) {
  const headers = {};
  if (apiId) headers["x-api-id"] = apiId;
  if (requestHash) headers["x-request-hash"] = requestHash;

  const initial = await request({ ...headers });
  if (initial.status !== 402) return initial;

  const receipt = await signPayment(initial.body);
  // The retry repeats those headers: a receipt is bound to the challenge, and the
  // challenge was issued for this product and this request hash.
  return request({ ...headers, "x-payment-receipt": receipt });
}
