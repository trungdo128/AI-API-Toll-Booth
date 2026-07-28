export const apis = [
  {
    slug: "text-summarizer",
    name: "AI Text Summarizer",
    description: "Turn long text into a concise, deterministic summary.",
    path: "/v1/summarize",
    price: "0.0300000 XLM",
    category: "Text",
  },
  {
    slug: "rental-listing-generator",
    name: "Rental Listing Generator",
    description: "Generate structured property copy from listing facts.",
    path: "/v1/rental/generate",
    price: "0.0500000 XLM",
    category: "Content",
  },
  {
    slug: "document-extractor",
    name: "Structured Document Extractor",
    description: "Extract predictable JSON fields from plain documents.",
    path: "/v1/extract",
    price: "0.0700000 XLM",
    category: "Documents",
  },
] as const;
