"use client";

import { useState } from "react";
import { payChallenge, walletStorageKey } from "../lib/stellar-payment";

type Challenge = {
  id: string;
  network: string;
  asset: string;
  recipient: string;
  amount: string;
};

export function ApiConsole({ apiId }: { apiId?: string }) {
  const [result, setResult] = useState("Ready to send a request.");
  const call = async () => {
    setResult("Requesting…");
    try {
      const headers: Record<string, string> = { "x-request-hash": "sha256:browser-demo" };
      if (apiId) headers["x-api-id"] = apiId;
      const response = await fetch("/api/protected", { headers });
      const body = await response.json() as Challenge;
      if (response.status !== 402) {
        setResult(`HTTP ${response.status}\n${JSON.stringify(body, null, 2)}`);
        return;
      }
      const payer = localStorage.getItem(walletStorageKey);
      if (!payer) throw new Error("Connect Freighter before paying.");
      setResult("Waiting for Freighter payment approval…");
      const { transactionHash } = await payChallenge(body, payer);
      setResult(`Payment submitted\n${transactionHash}\nWaiting for verification…`);
      const verificationResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ challengeId: body.id, transactionHash }),
      });
      const verification = await verificationResponse.json() as { receipt?: string; error?: string };
      if (!verificationResponse.ok || !verification.receipt) {
        throw new Error(verification.error || "Payment verification failed.");
      }
      const retry = await fetch("/api/protected", {
        headers: { ...headers, "x-payment-receipt": verification.receipt },
      });
      setResult(`Transaction ${transactionHash}\nHTTP ${retry.status}\n${JSON.stringify(await retry.json(), null, 2)}`);
    } catch (error) {
      setResult(error instanceof Error ? error.message : "Request failed");
    }
  };
  return (
    <div className="console">
      <div className="console-bar"><code>GET /api/protected</code><button type="button" onClick={call}>Send</button></div>
      <pre aria-live="polite">{result}</pre>
    </div>
  );
}
