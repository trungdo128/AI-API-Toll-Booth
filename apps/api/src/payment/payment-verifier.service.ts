type PaymentOperation = {
  type: string;
  asset: string;
  destination: string;
  amount: string;
};

type ConfirmedTransaction = {
  successful: boolean;
  ledger: number;
  sourceAccount: string;
  operation: PaymentOperation;
};

export type TransactionLookup = {
  transaction(hash: string): Promise<ConfirmedTransaction>;
};

type Requirement = {
  network: "TESTNET" | "PUBLIC";
  asset: string;
  recipient: string;
  amount: string;
};

function atomicUnits(amount: string): bigint {
  if (!/^\d+(\.\d{1,7})?$/.test(amount)) throw new Error("Invalid payment amount");
  const [whole = "0", fraction = ""] = amount.split(".");
  return BigInt(whole) * 10_000_000n + BigInt(fraction.padEnd(7, "0"));
}

export class PaymentVerifierService {
  private readonly usedTransactions = new Set<string>();

  constructor(
    private readonly lookup: TransactionLookup,
    private readonly network = "PUBLIC",
  ) {}

  async verify(transactionHash: string, requirement: Requirement) {
    if (this.usedTransactions.has(transactionHash)) throw new Error("Payment transaction already used");
    if (requirement.network !== this.network) throw new Error("Wrong payment network");
    const transaction = await this.lookup.transaction(transactionHash);
    if (!transaction.successful || !Number.isInteger(transaction.ledger) || transaction.ledger <= 0) {
      throw new Error("Payment transaction is not confirmed");
    }
    if (transaction.operation.type !== "payment") throw new Error("Payment operation missing");
    if (transaction.operation.destination !== requirement.recipient) throw new Error("Wrong payment recipient");
    if (transaction.operation.asset !== requirement.asset) throw new Error("Wrong payment asset");
    if (atomicUnits(transaction.operation.amount) !== BigInt(requirement.amount)) {
      throw new Error("Wrong payment amount");
    }
    this.usedTransactions.add(transactionHash);
    return {
      transactionHash,
      ledger: transaction.ledger,
      payerAddress: transaction.sourceAccount,
      confirmedAt: new Date().toISOString(),
    };
  }
}
