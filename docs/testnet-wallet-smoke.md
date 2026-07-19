# Testnet wallet smoke test

Performed on 2026-07-19 using the local Stellar CLI identity `user1` on Stellar Testnet. This is controlled QA evidence, not Mainnet-user evidence.

- Provider wallet: `GA6S6JMZEUJI6SWDJJG4KKLYXVHRFHXFJWTIY6MG57G7UEL2YN3N2TME`
- Registry: `CDCXMAI7YIONRCQ5NYEM2KIODHQRWYIGYSL7OLMLYAUE63K5XYL3AL5K`
- Provider registration: [`356b0438…23d95`](https://stellar.expert/explorer/testnet/tx/356b0438f05a25b6acb0d408c13617c640dd6de9cbf9207fbdc1c8930d723d95)
- API registration (`summary7`, price `300000`): [`98150b41…a1fca`](https://stellar.expert/explorer/testnet/tx/98150b413c1663133c93d8bbe0c9a3303638a203a2f7968f49275caaf55a1fca)

Readback through the Testnet RPC confirmed the provider is active and `summary7` is active at price `300000`.
