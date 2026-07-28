import type { Metadata } from "next";
import Link from "next/link";
import "./styles.css";
import { WalletButton } from "../components/wallet-button";

export const metadata: Metadata = {
  title: "AI API Toll Booth",
  description: "Pay-per-call APIs on Stellar Testnet.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/"><span className="brand-mark">S</span>AI API Toll Booth</Link>
          <nav aria-label="Primary navigation">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/dashboard">Usage</Link>
            <Link href="/provider">Provider</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/security">Security</Link>
          </nav>
          <WalletButton />
        </header>
        {children}
        <footer>
          <div><strong>AI API Toll Booth</strong><small>Stellar Testnet only</small></div>
          <nav aria-label="Footer navigation">
            <Link href="/marketplace">Marketplace</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/security">Security</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
          </nav>
        </footer>
      </body>
    </html>
  );
}
