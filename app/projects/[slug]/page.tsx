import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";

type Params = { slug: string };

export function generateStaticParams() {
  return projects
    .filter((p): p is Project => p.type === "project")
    .map((p) => ({ slug: p.slug }));
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = projects.find(
    (p): p is Project => p.type === "project" && p.slug === slug
  );

  if (!project) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header crumbs={[{ label: "Home", href: "/" }, { label: project.name }]} />
      <main style={{ flex: 1, padding: "32px 64px 0" }}>
        {/* Hero: title + metadata row */}
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "56px",
              color: "var(--text)",
              letterSpacing: "-1px",
              lineHeight: 1.05,
            }}
          >
            {project.name}
          </h1>
          <div style={{ display: "flex", gap: "20px", alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
              {project.date}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-subtle)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
              {project.axes.medium}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-subtle)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
              {project.axes.context}
            </span>
            {project.role && (
              <>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-subtle)" }}>·</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-muted)" }}>
                  {project.role} @ {project.company}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Body — sidebar metadata + description */}
        <section style={{ display: "flex", gap: "64px", paddingTop: "48px", flexWrap: "wrap" }}>
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "280px",
              flexShrink: 0,
            }}
          >
            <MetaBlock label="Technologies" value={project.technology} />
            <MetaBlock label="Context" value={project.axes.context} />
            <MetaBlock label="Medium" value={project.axes.medium} />
            {project.location && <MetaBlock label="Location" value={project.location} />}
            {project.sourceCode && (
              <MetaBlock label="Source" value="GitHub ↗" href={project.sourceCode} />
            )}
            {project.liveLink && (
              <MetaBlock label="Live" value="View live ↗" href={project.liveLink} />
            )}
          </aside>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, minWidth: "320px" }}>
            {project.description.map((block, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {block.header && (
                  <h2
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "24px",
                      color: "var(--text)",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {block.header}
                  </h2>
                )}
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "17px",
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{ __html: block.text }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Media gallery (placeholder rendering for Phase 1.5; full carousel comes in Phase 3) */}
        {project.media.length > 0 && (
          <section style={{ paddingTop: "64px", paddingBottom: "64px" }}>
            <h2
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-muted)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Media
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>
              {project.media.slice(0, 9).map((m, i) => (
                <figure key={i} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16 / 10",
                      borderRadius: "6px",
                      background: "var(--surface)",
                      backgroundImage:
                        m.type === "image" ? `url(${m.link})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {m.type === "video" && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          color: "var(--text-muted)",
                        }}
                      >
                        ▶ video
                      </span>
                    )}
                  </div>
                  {m.caption && (
                    <figcaption
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        textAlign: "center",
                        fontStyle: "italic",
                      }}
                    >
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function MetaBlock({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 500,
          color: "var(--text-subtle)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          }}
        >
          {value}
        </a>
      ) : (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
