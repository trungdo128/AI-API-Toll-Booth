import { SectionPage } from "../../components/section-page";

export default function Security() {
  return <SectionPage title="Security" intro="Payment verification is fail-closed and every mutable flow is bound to an expiring nonce."><ul className="rules"><li>Wrong network, recipient, asset or amount is rejected.</li><li>Payment and wallet-signature replay is rejected.</li><li>Provider credentials never reach the browser.</li><li>This release uses Stellar Testnet only.</li></ul></SectionPage>;
}
