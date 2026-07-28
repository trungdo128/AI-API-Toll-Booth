import { SectionPage } from "../../components/section-page";

export default function Dashboard() {
  return <SectionPage title="Usage dashboard" intro="Receipts, paid requests and session balances for the connected Testnet wallet."><p className="empty-state">Connect a wallet to load verified usage. No sample activity is presented as real data.</p></SectionPage>;
}
