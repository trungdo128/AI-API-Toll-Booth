# API reference

Request and response schemas are validated at the NestJS boundary. Payment
verification stays server-side: a transaction hash, a public address or a
frontend success state alone never grants access.

## Health

`GET /health` → `{ status, service, network }`

`network` reports the ledger this deployment is configured for, so a caller can
tell a Mainnet instance from a testnet one without guessing from the hostname.

## Catalog

| Route | Returns |
| --- | --- |
| `GET /api/catalog` | Active products from approved providers, each with its plans |
| `GET /api/catalog/:slug` | One product, or 404 |
| `GET /api/catalog/activity/recent` | The 50 most recent verified receipts on the configured network |

Plan `amount` is a stroop string. Divide by 10,000,000 for the display value.

## Wallet authentication

`POST /api/auth/challenge` with `{ address }` returns `{ id, message, expiresAt, network }`.
Sign `message` with the wallet, then `POST /api/auth/verify` with
`{ challengeId, address, signature }`, where `signature` is base64. A challenge is
single-use and expires after five minutes.

The `Origin` header is required on both calls and must be one of `PUBLIC_ORIGIN`.

## Protected access

`GET /api/protected`

| Header | Purpose |
| --- | --- |
| `x-api-id` | Product slug to buy access to. Defaults to `text-summarizer` |
| `x-request-hash` | Binds the challenge to the request being paid for |
| `x-payment-receipt` | Receipt from a verified payment; returns the result instead of a challenge |

Without a valid receipt the route answers `402` with a payment challenge. The
amount is the cheapest published plan for that product, read from the catalog at
request time, so republishing a price changes what the route quotes and no figure
is fixed in the service.

An unknown product, or one with no published plan, answers `400` rather than
quoting a price that could never be paid.

## Payment verification

`POST /api/payments/verify` with `{ challengeId, transactionHash }` returns
`{ receipt }` once the transaction is found on the configured network and pays the
challenge amount to the challenge recipient.
