import { CatalogList } from "../../components/catalog-list";
import { SectionPage } from "../../components/section-page";

export default function Marketplace() {
  return (
    <SectionPage title="API marketplace" intro="Protected developer APIs with explicit Mainnet pricing and payment modes.">
      <CatalogList />
    </SectionPage>
  );
}
