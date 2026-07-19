export async function requestPaidApi({ request, signPayment }) {
  const initial = await request({});
  if (initial.status !== 402) return initial;

  const receipt = await signPayment(initial.body);
  return request({ "x-payment-receipt": receipt });
}
