"use client";

import dynamic from "next/dynamic";

const PaymentGate = dynamic(
  () => import("./payment-gate").then((module) => module.PaymentGate),
  { ssr: false, loading: () => <div className="gate gate-fallback" aria-label="Payment gate loading" /> },
);

export function HeroGate() {
  return <PaymentGate />;
}
