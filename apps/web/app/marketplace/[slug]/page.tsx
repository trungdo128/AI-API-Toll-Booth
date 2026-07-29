import { notFound } from "next/navigation";
import { ApiConsole } from "../../../components/api-console";
import { SectionPage } from "../../../components/section-page";
import { apis } from "../../../lib/apis";

export function generateStaticParams() {
  return apis.map(({ slug }) => ({ slug }));
}

export default async function ApiDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const api = apis.find((item) => item.slug === slug);
  if (!api) notFound();
  return (
    <SectionPage title={api.name} intro={api.description}>
      <dl className="details"><div><dt>Endpoint</dt><dd><code>POST {api.path}</code></dd></div><div><dt>Price</dt><dd>{api.price}</dd></div><div><dt>Network</dt><dd>Stellar Mainnet</dd></div><div><dt>Mode</dt><dd>Charge per request</dd></div></dl>
      <h2>Try the payment challenge</h2><ApiConsole />
    </SectionPage>
  );
}
