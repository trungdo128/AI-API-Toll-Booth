const STROOPS_PER_UNIT = 10_000_000n;

export type CatalogPlan = {
  id: string;
  name: string;
  mode: string;
  asset: string;
  /** Stroops, as returned by the API. */
  amount: string;
};

export type CatalogProduct = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  plans: CatalogPlan[];
};

/** Renders a stroop amount the way Stellar wallets show it: seven fixed decimals. */
export function formatAmount(stroops: string, asset: string): string {
  if (!/^\d+$/.test(stroops)) return `— ${assetLabel(asset)}`;
  const value = BigInt(stroops);
  const whole = value / STROOPS_PER_UNIT;
  const fraction = (value % STROOPS_PER_UNIT).toString().padStart(7, "0");
  return `${whole}.${fraction} ${assetLabel(asset)}`;
}

export function assetLabel(asset: string): string {
  return asset === "native" ? "XLM" : asset;
}

/** The cheapest plan is what the listing advertises, so pricing matches what a caller pays. */
export function entryPlan(product: CatalogProduct): CatalogPlan | undefined {
  return [...product.plans]
    .filter((plan) => /^\d+$/.test(plan.amount))
    .sort((left, right) => (BigInt(left.amount) < BigInt(right.amount) ? -1 : 1))[0];
}

export function productPrice(product: CatalogProduct): string {
  const plan = entryPlan(product);
  return plan ? formatAmount(plan.amount, plan.asset) : "Price on request";
}

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`Catalog request failed with HTTP ${response.status}`);
  return await response.json() as T;
}

export function fetchCatalog(): Promise<CatalogProduct[]> {
  return readJson<CatalogProduct[]>("/api/catalog");
}

export function fetchProduct(slug: string): Promise<CatalogProduct> {
  return readJson<CatalogProduct>(`/api/catalog/${encodeURIComponent(slug)}`);
}
