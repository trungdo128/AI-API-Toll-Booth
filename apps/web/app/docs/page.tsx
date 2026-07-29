import { SectionPage } from "../../components/section-page";

export default function Docs() {
  return <SectionPage title="Developer documentation" intro="Integrate the HTTP 402 charge flow without handling wallet secrets."><pre className="code-block">{`GET /api/protected
→ HTTP 402 + payment challenge
→ submit exact Stellar Mainnet payment
POST /api/payments/verify
→ retry with x-payment-receipt`}</pre></SectionPage>;
}
