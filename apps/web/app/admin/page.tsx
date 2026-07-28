import { SectionPage } from "../../components/section-page";

export default function Admin() {
  return <SectionPage title="Admin review" intro="Provider approvals, API moderation and immutable audit actions."><p className="empty-state">Authenticated administrator access is required.</p></SectionPage>;
}
