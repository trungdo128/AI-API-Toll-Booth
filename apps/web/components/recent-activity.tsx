"use client";

import { useEffect, useState } from "react";
import { explorerTransactionUrl, stellarProfile } from "../lib/stellar-network";

type Activity = {
  payerAddress: string;
  transactionHash: string;
  ledger: number;
  confirmedAt: string;
  challenge: { apiProduct: { title: string } };
};

const profile = stellarProfile();

export function RecentActivity() {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => {
    fetch("/api/catalog/activity/recent")
      .then((response) => response.ok ? response.json() : [])
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  if (!items.length) return <p className="empty-state">No verified {profile.label} activity yet.</p>;
  return <div className="activity-list">{items.map((item) => (
    <a href={explorerTransactionUrl(item.transactionHash, profile)} key={item.transactionHash} target="_blank" rel="noreferrer">
      <strong>{item.challenge.apiProduct.title}</strong>
      <span>{item.payerAddress.slice(0, 8)}…{item.payerAddress.slice(-6)} · ledger {item.ledger}</span>
    </a>
  ))}</div>;
}
