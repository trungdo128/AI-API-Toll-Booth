"use client";

import { useState } from "react";
import { getNetwork, isConnected, requestAccess, signMessage } from "@stellar/freighter-api";
import { isExpectedNetwork } from "../lib/network";
import { stellarProfile } from "../lib/stellar-network";
import { walletStorageKey } from "../lib/stellar-payment";
import { requestChallenge, submitSignature, toBase64Signature } from "../lib/wallet-auth";

const { network: expectedNetwork, label: networkLabel } = stellarProfile();

export function WalletButton() {
  const [label, setLabel] = useState("Connect wallet");
  const [busy, setBusy] = useState(false);

  const connect = async () => {
    setBusy(true);
    try {
      const connection = await isConnected();
      if (!connection.isConnected) throw new Error("Install or unlock Freighter");
      const network = await getNetwork();
      if (!isExpectedNetwork(network, expectedNetwork)) throw new Error(`Switch Freighter to ${networkLabel}`);
      const access = await requestAccess();
      if (access.error || !access.address) throw new Error(access.error || "Wallet access rejected");

      // Holding an address proves nothing on its own, so the wallet signs the
      // server's one-time challenge before the session is treated as authenticated.
      setLabel("Sign the login challenge…");
      const challenge = await requestChallenge(access.address);
      const signed = await signMessage(challenge.message, { address: access.address });
      if (signed.error) throw new Error(String(signed.error));
      await submitSignature({
        challengeId: challenge.id,
        address: access.address,
        signature: toBase64Signature(signed.signedMessage),
      });

      localStorage.setItem(walletStorageKey, access.address);
      setLabel(`${access.address.slice(0, 5)}…${access.address.slice(-4)}`);
    } catch (error) {
      localStorage.removeItem(walletStorageKey);
      setLabel(error instanceof Error ? error.message : "Connection failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="wallet-button" type="button" onClick={connect} disabled={busy}>
      {label}
    </button>
  );
}
