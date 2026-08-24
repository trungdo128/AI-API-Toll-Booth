import { notFound } from "next/navigation";
import { ProductDetail } from "../../../components/product-detail";
import { SectionPage } from "../../../components/section-page";
import { apis } from "../../../lib/apis";

// The site ships as a static export, so these seeded slugs are the pages built
// ahead of time. Their contents come from the catalog API at request time, which
// keeps plans and pricing in step with the database.
export function generateStaticParams() {
  return apis.map(({ slug }) => ({ slug }));
}

export default async function ApiDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const api = apis.find((item) => item.slug === slug);
  if (!api) notFound();
  return (
    <SectionPage title={api.name} intro={`Endpoint POST ${api.path}`}>
      <ProductDetail slug={slug} />
    </SectionPage>
  );
}
