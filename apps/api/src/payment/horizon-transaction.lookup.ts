import type { TransactionLookup } from "./payment-verifier.service.js";

type Fetch = (input: string | URL, init?: RequestInit) => Promise<Response>;

export class HorizonTransactionLookup implements TransactionLookup {
  constructor(
    private readonly baseUrl = "https://horizon.stellar.org",
    private readonly fetcher: Fetch = fetch,
  ) {
    if (!["horizon-testnet.stellar.org", "horizon.stellar.org"].includes(new URL(baseUrl).hostname)) {
      throw new Error("Only official Stellar Horizon endpoints are allowed");
    }
  }

  async transaction(hash: string) {
    if (!/^[a-f0-9]{64}$/i.test(hash)) throw new Error("Invalid transaction hash");
    const base = this.baseUrl.replace(/\/$/, "");
    const [transactionResponse, operationsResponse] = await Promise.all([
      this.fetcher(`${base}/transactions/${hash}`, { redirect: "error" }),
      this.fetcher(`${base}/transactions/${hash}/operations?limit=20`, { redirect: "error" }),
    ]);
    if (!transactionResponse.ok || !operationsResponse.ok) throw new Error("Transaction not found on configured network");
    const transaction = await transactionResponse.json() as {
      successful?: boolean;
      ledger?: number;
      source_account?: string;
    };
    const operations = await operationsResponse.json() as {
      _embedded?: { records?: Array<Record<string, unknown>> };
    };
    const operation = operations._embedded?.records?.find((item) => item.type === "payment");
    if (!operation) throw new Error("Payment operation missing");
    const asset = operation.asset_type === "native"
      ? "native"
      : `${String(operation.asset_code)}:${String(operation.asset_issuer)}`;
    return {
      successful: transaction.successful === true,
      ledger: Number(transaction.ledger),
      sourceAccount: String(transaction.source_account),
      operation: {
        type: "payment",
        asset,
        destination: String(operation.to),
        amount: String(operation.amount),
      },
    };
  }
}
