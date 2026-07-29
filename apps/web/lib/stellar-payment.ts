import { signTransaction } from "@stellar/freighter-api";
import {
  Account,
  Asset,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export const walletStorageKey = "toll-booth:wallet";

type PaymentChallenge = {
  id: string;
  network: string;
  asset: string;
  recipient: string;
  amount: string;
};

export function buildPaymentXdr(input: {
  payer: string;
  recipient: string;
  amount: string;
  sequence: string;
  networkPassphrase: string;
}) {
  const stroops = BigInt(input.amount);
  const xlm = `${stroops / 10_000_000n}.${(stroops % 10_000_000n).toString().padStart(7, "0")}`;
  return new TransactionBuilder(new Account(input.payer, input.sequence), {
    fee: "100",
    networkPassphrase: input.networkPassphrase,
  })
    .addOperation(Operation.payment({
      destination: input.recipient,
      asset: Asset.native(),
      amount: xlm,
    }))
    .setTimeout(180)
    .build()
    .toXDR();
}

export async function payChallenge(challenge: PaymentChallenge, payer: string) {
  if (challenge.asset !== "native") throw new Error("Only native XLM payments are supported.");
  const network = challenge.network.toUpperCase();
  const networkPassphrase = network === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET;
  const horizon = network === "PUBLIC"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
  const accountResponse = await fetch(`${horizon}/accounts/${payer}`);
  if (!accountResponse.ok) throw new Error("Connected wallet is not funded on the selected network.");
  const account = await accountResponse.json() as { sequence: string };
  const transactionXdr = buildPaymentXdr({
    payer,
    recipient: challenge.recipient,
    amount: challenge.amount,
    sequence: account.sequence,
    networkPassphrase,
  });
  const signed = await signTransaction(transactionXdr, { networkPassphrase, address: payer });
  if (signed.error || !signed.signedTxXdr) throw new Error(signed.error || "Wallet signature was rejected.");
  const submit = await fetch(`${horizon}/transactions`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ tx: signed.signedTxXdr }),
  });
  const result = await submit.json() as { hash?: string; extras?: { result_codes?: unknown } };
  if (!submit.ok || !result.hash) {
    throw new Error(`Stellar rejected the payment: ${JSON.stringify(result.extras?.result_codes || result)}`);
  }
  return { transactionHash: result.hash };
}
