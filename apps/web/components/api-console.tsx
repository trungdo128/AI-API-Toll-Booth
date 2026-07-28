"use client";

import { useState } from "react";

export function ApiConsole() {
  const [result, setResult] = useState("Ready to send a request.");
  const call = async () => {
    setResult("Requesting…");
    try {
      const response = await fetch("/api/protected", { headers: { "x-request-hash": "sha256:browser-demo" } });
      setResult(`HTTP ${response.status}\n${JSON.stringify(await response.json(), null, 2)}`);
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
