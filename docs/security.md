# Security boundaries

- The Soroban registry requires the admin address to authorize initialization and global pause changes.
- Provider and API registration require provider authorization; only a 32-byte metadata hash is stored for providers.
- The API gateway never treats a hard-coded receipt as valid. Receipt acceptance is delegated to an injected verifier.
- The web application connects wallet extensions, stores only a public address locally and requires Stellar Mainnet before a payment.
- The agent client has no key handling. A caller supplies the signing callback.
- The current Mainnet deployment settles in native XLM.

The backend persists unique receipts, rejects replayed transactions and verifies the exact Mainnet payment before access. See the [security audit](security/security-audit.md).
