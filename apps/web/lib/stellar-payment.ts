import { signTransaction } from "@stellar/freighter-api";
import { Client as RegistryClient } from "@ai-api-toll-booth/stellar";
import { Buffer } from "buffer";
import {
  Account,
  Asset,
  Networks,
  Operation,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { stellarProfile } from "./stellar-network";

export const walletStorageKey = "toll-booth:wallet";

// The registry and its RPC belong to one network, so both follow the build's
// network rather than being pinned to Mainnet in source.
export const registryContractId = process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID
  || "CAUZWSIVXANXFQWJWY4QYWCZUBV7NNSG54C7IRYI2MY7DY2UYDIDLG7X";
const profile = stellarProfile();
const networkPassphrase = profile.network === "PUBLIC" ? Networks.PUBLIC : Networks.TESTNET;
const sorobanRpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL
  || (profile.network === "PUBLIC"
    ? "https://stellar.api.onfinality.io/public"
    : "https://soroban-testnet.stellar.org");

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
  if (network !== profile.network) throw new Error(`Switch Freighter to Stellar ${profile.label}.`);
  const horizon = profile.horizonUrl;
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

export async function registerProvider(provider: string, profile: string) {
  const metadataHash = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(profile)));
  const registry = new RegistryClient({
    contractId: registryContractId,
    networkPassphrase,
    rpcUrl: sorobanRpcUrl,
    publicKey: provider,
    signTransaction,
  });
  const transaction = await registry.register_provider({
    provider,
    metadata_hash: metadataHash,
  });
  const sent = await transaction.signAndSend();
  const transactionHash = sent.sendTransactionResponse?.hash;
  if (!transactionHash) throw new Error("The registry transaction was not submitted.");
  return { transactionHash };
}
