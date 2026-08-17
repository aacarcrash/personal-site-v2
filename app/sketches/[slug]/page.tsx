import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { projects } from "@/data/projects";
import type { Cluster, Project } from "@/data/types";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";

type Params = { slug: string };

export function generateStaticParams() {
  return projects
    .filter((p): p is Cluster => p.type === "cluster")
    .map((c) => ({ slug: clusterSlug(c) }));
}

export default async function SketchClusterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cluster = projects.find(
    (p): p is Cluster => p.type === "cluster" && clusterSlug(p) === slug,
  );

  if (!cluster) notFound();

  const related = (cluster.relatedSlugs ?? [])
    .map((s) => projects.find((p): p is Project => p.type === "project" && p.slug === s))
    .filter((p): p is Project => Boolean(p));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sketches", href: "/" },
          { label: cluster.name },
        ]}
      />
      <main
        className="page-gutter"
        style={{
          flex: 1,
          paddingTop: "32px",
          maxWidth: "920px",
          width: "100%",
          margin: "0 auto",
        }}
      >
        <header style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Sketches
          </span>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "56px",
              color: "var(--text)",
              letterSpacing: "-1px",
              lineHeight: 1.05,
            }}
          >
            {cluster.name}
          </h1>
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--step-data)",
                lineHeight: "var(--lh-data)",
                color: "var(--text-muted)",
              }}
            >
              {cluster.count} {cluster.count === 1 ? "piece" : "pieces"}
            </span>
            {/* Separator and value are ONE flex item, not two. As siblings the
                row could break between them, which at 375/390 left a "·"
                dangling at the end of a line with its value wrapped below. */}
            {cluster.technology && <MetaItem>{cluster.technology}</MetaItem>}
            {cluster.date && <MetaItem>{cluster.date}</MetaItem>}
          </div>
          {cluster.subtitle && (
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "640px",
                marginTop: "8px",
              }}
            >
              {cluster.subtitle}
            </p>
          )}
          {/* Surfaced up here, not after the item grid: 11 embeds is a long
              scroll, and the point is to catch a reader before they leave
              rather than reward the ones who make it to the bottom. Sized
              up from a quiet metadata line to an eyebrow + serif name — the
              11 sketches are rough studies, this is the polished piece they
              led to, so it needs to read as a highlight, not a footnote. */}
          {related.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                flexWrap: "wrap",
                columnGap: "12px",
                rowGap: "4px",
                marginTop: "10px",
                paddingTop: "18px",
                borderTop: "0.5px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                {cluster.relatedLabel ?? "Also see"}
              </span>
              {related.map((r, i) => (
                <span
                  key={r.slug}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "var(--step-title)",
                    lineHeight: "var(--lh-title)",
                    color: "var(--text)",
                  }}
                >
                  <Link href={`/projects/${r.slug}`} className="link-underline">
                    {r.name}
                  </Link>
                  {i < related.length - 1 ? "," : ""}
                </span>
              ))}
            </div>
          )}
        </header>

        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "48px",
            paddingTop: "48px",
            paddingBottom: "64px",
          }}
        >
          {cluster.items.map((item, i) => {
            const isVideo =
              item.type === "video" || /^https?:\/\//i.test(item.link ?? "");
            return (
              <figure
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
              >
                {isVideo && item.link ? (
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 9",
                      borderRadius: "4px",
                      overflow: "hidden",
                      background: "#000",
                    }}
                  >
                    <iframe
                      src={item.link}
                      title={item.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      style={{ width: "100%", height: "100%", border: 0 }}
                    />
                  </div>
                ) : item.link ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.link}
                    alt={item.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "4px",
                      background: "var(--surface)",
                    }}
                  />
                ) : null}
                <figcaption className="caption">
                  {item.title}
                  {item.source && (
                    <>
                      {" · "}
                      <a
                        href={item.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link-underline"
                      >
                        source ↗
                      </a>
                    </>
                  )}
                </figcaption>
              </figure>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}

/** One metadata cell: its leading "·" travels with it, so a wrap can never
 *  strand the separator on the line above. */
function MetaItem({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "20px",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--step-data)",
        lineHeight: "var(--lh-data)",
        color: "var(--text-muted)",
      }}
    >
      <span aria-hidden style={{ color: "var(--text-subtle)" }}>
        ·
      </span>
      {children}
    </span>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cluster = projects.find(
    (p): p is Cluster => p.type === "cluster" && clusterSlug(p) === slug,
  );
  if (!cluster) return {};
  const description =
    cluster.subtitle ??
    `${cluster.name} — ${cluster.count} pieces from the sketchbook of Aakarsh Singh, new media artist.`;
  const url = `/sketches/${clusterSlug(cluster)}`;
  return {
    title: cluster.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${cluster.name} — Aakarsh Singh`,
      description,
      url,
      type: "article",
    },
  };
}
