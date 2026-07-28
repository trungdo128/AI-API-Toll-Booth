import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const address = "GB7CDHVP6LBMP3L5BJFXSTOWB4NX7ONPFN4537AFCWCNL7YD2MHSBZJN";
const wallet = await prisma.walletIdentity.upsert({
  where: { address },
  update: { network: "TESTNET" },
  create: { address, network: "TESTNET" },
});
const provider = await prisma.provider.upsert({
  where: { walletId: wallet.id },
  update: { status: "APPROVED" },
  create: {
    walletId: wallet.id,
    displayName: "Toll Booth Labs",
    description: "Deterministic Testnet API provider",
    status: "APPROVED",
  },
});
for (const product of [
  { slug: "text-summarizer", title: "AI Text Summarizer", description: "Deterministic concise summaries.", category: "text", amount: 300000n },
  { slug: "rental-listing-generator", title: "Rental Listing Generator", description: "Structured copy from listing facts.", category: "property", amount: 500000n },
  { slug: "document-extractor", title: "Structured Document Extractor", description: "Predictable JSON field extraction.", category: "documents", amount: 700000n },
]) {
  const { amount, ...productData } = product;
  const stored = await prisma.apiProduct.upsert({
    where: { slug: product.slug },
    update: { ...productData, upstreamUrlEncrypted: `internal:${product.slug}`, active: true },
    create: { ...productData, providerId: provider.id, upstreamUrlEncrypted: `internal:${product.slug}`, active: true },
  });
  await prisma.apiPlan.upsert({
    where: { apiProductId_name: { apiProductId: stored.id, name: "Per request" } },
    update: { amount, asset: "native", mode: "PER_REQUEST" },
    create: { apiProductId: stored.id, name: "Per request", amount, asset: "native", mode: "PER_REQUEST" },
  });
}
await prisma.$disconnect();
console.log("D7 Testnet catalog seed complete");
