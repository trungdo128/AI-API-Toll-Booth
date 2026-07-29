import { SectionPage } from "../../components/section-page";
import { RecentActivity } from "../../components/recent-activity";

export default function Dashboard() {
  return <SectionPage title="Usage dashboard" intro="Verified Mainnet receipts recorded by the application."><RecentActivity /></SectionPage>;
}
