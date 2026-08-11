import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { projects } from "@/data/projects";
import type { Cluster } from "@/data/types";
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
              fontWeight: 500,
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
                fontSize: "13px",
                color: "var(--text-muted)",
              }}
            >
              {cluster.count} {cluster.count === 1 ? "piece" : "pieces"}
            </span>
            {cluster.technology && (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-subtle)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                  }}
                >
                  {cluster.technology}
                </span>
              </>
            )}
            {cluster.date && (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-subtle)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    color: "var(--text-muted)",
                  }}
                >
                  {cluster.date}
                </span>
              </>
            )}
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
                <figcaption
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
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
