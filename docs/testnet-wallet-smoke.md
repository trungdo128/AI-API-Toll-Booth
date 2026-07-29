# Testnet wallet smoke test

Performed on 2026-07-29 using controlled Stellar CLI Testnet identities. This is controlled QA evidence, not Mainnet-user or browser-extension evidence.

- Current registry: [`CCSC…LMQK`](https://lab.stellar.org/r/testnet/contract/CCSCHYIM3XNM7OD2264C2FR4MBN2EKCA7M7VVAJESS4SAXYU64H2LMQK)
- Provider wallet: `GDVZV6CYHCXLGEEW6OLNCBPTSE7NIBSF7YBRM4UTX7YHO4SZG4B7B6B7`
- Provider registration: [`d0d7719e…d99b`](https://stellar.expert/explorer/testnet/tx/d0d7719e2446c51faae09d662592f7800862eb2c7e7a23cbf6640123902dd99b)
- API registration (`testnet_api`, price `300000`): [`a1965cd3…fd57`](https://stellar.expert/explorer/testnet/tx/a1965cd3993031e874db95e264012a281f575dc52dd3818c86de9dfdd707fd57)
- HTTP 402 payment receipt: [`f55fb51b…86cd`](https://stellar.expert/explorer/testnet/tx/f55fb51b5b7d6de9a2c19ed201602f79d6089d6e0db677c97d4cecfe92fc86cd)

RPC readback confirmed `testnet_api` is active at price `300000`. Railway verified the exact native payment, persisted the receipt and returned HTTP 200 with `{ "summary": "Access granted", "deterministic": true }` on retry.
