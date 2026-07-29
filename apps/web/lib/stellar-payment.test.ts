import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { buildPaymentXdr } from "./stellar-payment";

describe("buildPaymentXdr", () => {
  it("builds one exact native payment from the HTTP 402 challenge", () => {
    const payer = Keypair.random().publicKey();
    const recipient = Keypair.random().publicKey();
    const xdr = buildPaymentXdr({
      payer,
      recipient,
      amount: "300000",
      sequence: "123",
      networkPassphrase: Networks.TESTNET,
    });
    const transaction = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);

    expect(transaction.operations).toHaveLength(1);
    expect(transaction.operations[0]).toMatchObject({
      type: "payment",
      destination: recipient,
      amount: "0.0300000",
    });
  });
});
