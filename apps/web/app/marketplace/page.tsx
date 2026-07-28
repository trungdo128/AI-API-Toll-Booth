import Link from "next/link";
import { SectionPage } from "../../components/section-page";
import { apis } from "../../lib/apis";

export default function Marketplace() {
  return (
    <SectionPage title="API marketplace" intro="Protected developer APIs with explicit Testnet pricing and payment modes.">
      <div className="api-list">
        {apis.map((api) => <article key={api.slug}><div><small>{api.category}</small><h2>{api.name}</h2><p>{api.description}</p></div><strong>{api.price}</strong><Link href={`/marketplace/${api.slug}`}>Open API →</Link></article>)}
      </div>
    </SectionPage>
  );
}
