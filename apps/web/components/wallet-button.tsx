"use client";

import { useState } from "react";
import { getNetwork, isConnected, requestAccess } from "@stellar/freighter-api";
import { isExpectedNetwork } from "../lib/network";

const expectedNetwork = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET";
const networkLabel = expectedNetwork === "PUBLIC" ? "Mainnet" : "Testnet";

export function WalletButton() {
  const [label, setLabel] = useState("Connect wallet");
  const connect = async () => {
    try {
      const connection = await isConnected();
      if (!connection.isConnected) throw new Error("Install or unlock Freighter");
      const network = await getNetwork();
      if (!isExpectedNetwork(network, expectedNetwork)) throw new Error(`Switch Freighter to ${networkLabel}`);
      const access = await requestAccess();
      if (access.error || !access.address) throw new Error(access.error || "Wallet access rejected");
      setLabel(`${access.address.slice(0, 5)}…${access.address.slice(-4)}`);
    } catch (error) {
      setLabel(error instanceof Error ? error.message : "Connection failed");
    }
  };
  return <button className="wallet-button" type="button" onClick={connect}>{label}</button>;
}
