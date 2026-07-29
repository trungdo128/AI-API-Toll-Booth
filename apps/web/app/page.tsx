import Link from "next/link";
import { ApiConsole } from "../components/api-console";
import { HeroGate } from "../components/hero-gate";
import { apis } from "../lib/apis";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <h1>Pay only when the API answers.</h1>
          <p>Discover protected APIs and settle each successful request on Stellar Mainnet. HTTP 402 keeps payment requirements machine-readable.</p>
          <div className="actions">
            <Link className="primary" href="/marketplace">Explore APIs</Link>
            <Link className="secondary" href="/docs">Read the protocol</Link>
          </div>
          <ul className="trust-line"><li>Per-request billing</li><li>HTTP 402 flow</li><li>Mainnet receipts</li></ul>
        </div>
        <div className="hero-product">
          <HeroGate />
          <ApiConsole />
        </div>
      </section>

      <section className="market-preview">
        <div className="section-heading"><h2>Marketplace</h2><Link href="/marketplace">View all APIs →</Link></div>
        <div className="api-rail">
          {apis.map((api) => (
            <article key={api.slug}>
              <span className="api-icon">{api.category.slice(0, 1)}</span>
              <div><h3>{api.name}</h3><p>{api.description}</p><code>POST {api.path}</code></div>
              <div className="api-price"><strong>{api.price}</strong><small>per request</small><Link href={`/marketplace/${api.slug}`}>View details →</Link></div>
            </article>
          ))}
        </div>
      </section>

      <section className="flow">
        <div><h2>HTTP 402 → Pay on Mainnet → Retry → Receive data</h2><p>Every challenge binds the request, asset, recipient, amount, nonce and expiration.</p></div>
        <ol>
          <li><b>1</b><strong>Request</strong><span>Call a protected endpoint.</span></li>
          <li><b>2</b><strong>Pay</strong><span>Approve the exact Mainnet payment.</span></li>
          <li><b>3</b><strong>Retry</strong><span>Attach the verified receipt.</span></li>
          <li><b>4</b><strong>Receive</strong><span>Get deterministic API data.</span></li>
        </ol>
      </section>

      <section className="provider-strip">
        <div><h2>Provider controls without credential exposure.</h2><p>Publish plans, monitor requests and disable an API while encrypted upstream credentials stay server-side.</p></div>
        <div className="analytics-preview">
          <span><small>Requests</small><strong>Connect data source</strong></span>
          <span><small>Settlement</small><strong>Mainnet receipts</strong></span>
          <span><small>Availability</small><strong>Health monitored</strong></span>
        </div>
      </section>
    </main>
  );
}
