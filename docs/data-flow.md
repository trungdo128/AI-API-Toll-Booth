# Data flow

1. Consumer requests a protected API operation.
2. Gateway returns HTTP 402 with API, request hash, Mainnet, asset, recipient, amount, nonce and expiry.
3. Wallet signs the exact Mainnet payment.
4. Backend verifies success, payer, recipient, asset, amount, ledger and transaction uniqueness.
5. Receipt is bound to the original request or funded session.
6. Retry proxies to the encrypted upstream and records usage without returning credentials.
