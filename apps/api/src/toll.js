export function createTollHandler({ price, verifyReceipt }) {
  return async ({ headers }) => {
    const receipt = headers["x-payment-receipt"];
    if (!receipt || !(await verifyReceipt(receipt))) {
      return {
        status: 402,
        body: {
          asset: "testnet-configured-asset",
          price,
          paymentRequired: true,
        },
      };
    }

    return { status: 200, body: { summary: "Access granted" } };
  };
}
