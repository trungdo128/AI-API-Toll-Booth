import Link from "next/link";

export function SectionPage({ title, intro, children }: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <main className="section-page">
      <Link href="/">← Home</Link>
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
      <div className="page-panel">{children}</div>
    </main>
  );
}
