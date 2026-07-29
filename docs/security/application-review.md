# Application review

The API validates trust-boundary input, binds wallet challenges to Mainnet and origin, stores token and nonce hashes, verifies payments server-side, applies secure headers and exposes no provider credentials through catalog responses. Payment challenges and receipts are persisted durably, transaction hashes are unique and production activity includes only `PUBLIC` network receipts.
