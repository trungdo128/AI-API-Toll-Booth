# Security boundaries

- The Soroban registry requires the admin address to authorize initialization and global pause changes.
- Provider and API registration require provider authorization; only a 32-byte metadata hash is stored for providers.
- The API gateway never treats a hard-coded receipt as valid. Receipt acceptance is delegated to an injected verifier.
- The agent client has no key handling. A caller supplies the signing callback.
- The current Testnet deployment uses native XLM only for verification; it is not represented as a stablecoin integration.

Before production use, add a durable receipt indexer, replay protection, rate limiting, wallet-extension signing, and an independent contract review.
