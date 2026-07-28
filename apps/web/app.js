export async function requestProtectedApi(receipt = "", fetchFn = fetch) {
  const response = await fetchFn("/api/protected", {
    headers: receipt ? { "x-payment-receipt": receipt } : {},
  });
  return { status: response.status, body: await response.json() };
}
