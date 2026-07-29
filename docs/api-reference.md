# API reference

Core routes cover health, wallet challenge/verification, public catalog, payment verification and protected API access. Request/response schemas are validated at the NestJS boundary.

Payment verification must remain server-side. A transaction hash, public address or frontend success state alone never grants access.
