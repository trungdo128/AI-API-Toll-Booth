import { SectionPage } from "../../components/section-page";
import { RecentActivity } from "../../components/recent-activity";
import { stellarProfile } from "../../lib/stellar-network";

export default function Dashboard() {
  return <SectionPage title="Usage dashboard" intro={`Verified ${stellarProfile().label} receipts recorded by the application.`}><RecentActivity /></SectionPage>;
}
