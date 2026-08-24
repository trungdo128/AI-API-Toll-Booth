export type StellarNetwork = "PUBLIC" | "TESTNET";

const HORIZON_BY_NETWORK: Record<StellarNetwork, string> = {
  PUBLIC: "https://horizon.stellar.org",
  TESTNET: "https://horizon-testnet.stellar.org",
};

export type StellarSettings = {
  network: StellarNetwork;
  horizonUrl: string;
  paymentAsset: string;
  paymentRecipient: string;
};

/**
 * Reads the deployment's Stellar settings once so controllers and providers cannot
 * drift apart. A Horizon endpoint belonging to the other network is rejected rather
 * than accepted, because verifying a payment against the wrong ledger would confirm
 * a receipt that never settled on the network the caller paid on.
 */
export function readStellarSettings(env: NodeJS.ProcessEnv = process.env): StellarSettings {
  const network: StellarNetwork = env.STELLAR_NETWORK?.trim().toUpperCase() === "TESTNET"
    ? "TESTNET"
    : "PUBLIC";
  const expectedHorizon = HORIZON_BY_NETWORK[network];
  const horizonUrl = env.STELLAR_HORIZON_URL?.trim() || expectedHorizon;
  if (new URL(horizonUrl).hostname !== new URL(expectedHorizon).hostname) {
    throw new Error(`STELLAR_HORIZON_URL must serve ${network}; expected ${expectedHorizon}`);
  }

  const paymentRecipient = env.PAYMENT_RECIPIENT?.trim() || "";
  if (!/^G[A-Z2-7]{55}$/.test(paymentRecipient)) {
    throw new Error("PAYMENT_RECIPIENT must be a Stellar public key");
  }

  return {
    network,
    horizonUrl,
    paymentAsset: env.PAYMENT_ASSET?.trim() || "native",
    paymentRecipient,
  };
}
