import { SectionPage } from "../../components/section-page";
import { ProviderRegistration } from "../../components/provider-registration";

export default function Provider() {
  return <SectionPage title="Provider workspace" intro="Register a provider identity with the deployed Mainnet registry."><ProviderRegistration /></SectionPage>;
}
