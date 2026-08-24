"use client";

import { useEffect, useState } from "react";
import { ApiConsole } from "./api-console";
import { formatAmount, fetchProduct, type CatalogProduct } from "../lib/catalog";

type State =
  | { status: "loading" }
  | { status: "ready"; product: CatalogProduct }
  | { status: "failed"; message: string };

const MODE_LABELS: Record<string, string> = {
  PER_REQUEST: "Charge per request",
  PREPAID: "Prepaid credit",
  SUBSCRIPTION: "Subscription",
};

export function ProductDetail({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let active = true;
    fetchProduct(slug)
      .then((product) => { if (active) setState({ status: "ready", product }); })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          status: "failed",
          message: error instanceof Error ? error.message : "API product unavailable",
        });
      });
    return () => { active = false; };
  }, [slug]);

  if (state.status === "loading") return <p className="empty-state">Loading API details…</p>;
  if (state.status === "failed") return <p className="empty-state">{state.message}</p>;

  const { product } = state;
  return (
    <>
      <dl className="details">
        <div><dt>Provider</dt><dd>{product.provider}</dd></div>
        <div><dt>Category</dt><dd>{product.category}</dd></div>
        <div><dt>Description</dt><dd>{product.description}</dd></div>
      </dl>
      <h2>Plans</h2>
      {product.plans.length ? (
        <dl className="details">
          {product.plans.map((plan) => (
            <div key={plan.id}>
              <dt>{plan.name}</dt>
              <dd>{formatAmount(plan.amount, plan.asset)} · {MODE_LABELS[plan.mode] ?? plan.mode}</dd>
            </div>
          ))}
        </dl>
      ) : <p className="empty-state">This API has no published plan yet.</p>}
      <h2>Try the payment challenge</h2>
      <ApiConsole apiId={product.slug} />
    </>
  );
}
