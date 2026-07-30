"use client";

import { useState } from "react";
import { registerProvider, walletStorageKey } from "../lib/stellar-payment";

export function ProviderRegistration() {
  const [status, setStatus] = useState("Connect Freighter before registering.");

  const submit = async (formData: FormData) => {
    const provider = localStorage.getItem(walletStorageKey);
    if (!provider) {
      setStatus("Connect Freighter before registering.");
      return;
    }
    const profile = String(formData.get("profile") || "").trim();
    if (!profile) return;
    setStatus("Confirm register_provider in Freighter…");
    try {
      const { transactionHash } = await registerProvider(provider, profile);
      setStatus(`Provider registered on Mainnet: ${transactionHash}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Provider registration failed.");
    }
  };

  return (
    <form className="form" action={submit}>
      <label>Provider profile<input name="profile" required /></label>
      <button type="submit">Register provider on Mainnet</button>
      <p aria-live="polite">{status}</p>
    </form>
  );
}
