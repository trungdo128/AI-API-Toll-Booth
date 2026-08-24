"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCatalog, productPrice, type CatalogProduct } from "../lib/catalog";

type State =
  | { status: "loading" }
  | { status: "ready"; products: CatalogProduct[] }
  | { status: "failed"; message: string };

export function CatalogList() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetchCatalog()
      .then((products) => { if (active) setState({ status: "ready", products }); })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          status: "failed",
          message: error instanceof Error ? error.message : "Catalog unavailable",
        });
      });
    return () => { active = false; };
  }, []);

  if (state.status === "loading") return <p className="empty-state">Loading the catalog…</p>;
  if (state.status === "failed") return <p className="empty-state">{state.message}</p>;
  if (!state.products.length) return <p className="empty-state">No approved APIs are published yet.</p>;

  return (
    <div className="api-list">
      {state.products.map((product) => (
        <article key={product.slug}>
          <div>
            <small>{product.category}</small>
            <h2>{product.title}</h2>
            <p>{product.description}</p>
            <small>by {product.provider}</small>
          </div>
          <strong>{productPrice(product)}</strong>
          <Link href={`/marketplace/${product.slug}`}>Open API →</Link>
        </article>
      ))}
    </div>
  );
}
