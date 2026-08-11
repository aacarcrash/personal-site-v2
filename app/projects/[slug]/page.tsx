import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CaseStudyHero, CaseStudyDecisions } from "@/components/CaseStudy";
import { MareCaseStudyHero, MareCaseStudyDecisions } from "@/components/MareCaseStudy";
import { MediaGallery } from "@/components/MediaGallery";
import { CreativeWorkJsonLd } from "@/components/StructuredData";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { getProjectAxisValues } from "@/lib/axes";

type Params = { slug: string };

export function generateStaticParams() {
  return projects
    .filter((p): p is Project => p.type === "project")
    .map((p) => ({ slug: p.slug }));
}

function findProject(slug: string): Project | undefined {
  return projects.find(
    (p): p is Project => p.type === "project" && p.slug === slug,
  );
}

/** Short, SERP-safe description: prefer the subtitle, else the opening line. */
function projectDescription(project: Project): string | undefined {
  if (project.subtitle) return project.subtitle;
  const first = project.description?.[0];
  const text = typeof first === "object" && first ? first.text : undefined;
  if (!text) return undefined;
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}…` : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};

  const description = projectDescription(project);
  const url = `/projects/${project.slug}`;
  const images = project.thumbnail ? [project.thumbnail] : undefined;

  return {
    title: project.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.name} — Aakarsh Singh`,
      description,
      url,
      type: "article",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — Aakarsh Singh`,
      description,
      images,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const project = findProject(slug);

  if (!project) notFound();

  const related = (project.relatedSlugs ?? [])
    .map((s) => projects.find((p): p is Project => p.type === "project" && p.slug === s))
    .filter((p): p is Project => Boolean(p));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CreativeWorkJsonLd
        name={project.name}
        description={projectDescription(project)}
        url={`https://aakarsh.dev/projects/${project.slug}`}
        image={
          project.thumbnail
            ? `https://aakarsh.dev${project.thumbnail}`
            : undefined
        }
        year={project.axes?.year}
      />
      <Header crumbs={[{ label: "Home", href: "/" }, { label: project.name }]} />
      <main className="project-main">
        {/* Hero: title + metadata row */}
        <header style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(34px, 9vw, 56px)",
              color: "var(--text)",
              letterSpacing: "-1px",
              lineHeight: 1.05,
              overflowWrap: "break-word",
            }}
          >
            {project.name}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--text-muted)",
              lineHeight: 1.8,
            }}
          >
            {[
              project.date,
              getProjectAxisValues(project, "medium").join(" · "),
              getProjectAxisValues(project, "context").join(" · "),
              project.role ? `${project.role} @ ${project.company}` : null,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </header>

        {/* Case-study hero (video/screenshot) sits under the title; the
            decisions section renders after the overview prose below, so a
            reader knows what the product is before the design decisions. */}
        {project.caseStudy ? (
          project.slug === "mare" ? (
            <MareCaseStudyHero data={project.caseStudy} />
          ) : (
            <CaseStudyHero data={project.caseStudy} />
          )
        ) : null}

        {/* Body — sidebar metadata + description */}
        <section className="pd-body" style={{ display: "flex", gap: "48px 64px", paddingTop: "48px", flexWrap: "wrap" }}>
          <aside
            className="pd-aside"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              width: "280px",
              flexShrink: 0,
            }}
          >
            <MetaBlock label="Technologies" value={project.technology} />
            <MetaBlock label="Context" value={getProjectAxisValues(project, "context").join(" · ")} />
            <MetaBlock label="Medium" value={getProjectAxisValues(project, "medium").join(" · ")} />
            {project.location && <MetaBlock label="Location" value={project.location} />}
            {project.sourceCode && (
              <MetaBlock label="Source" value="GitHub ↗" href={project.sourceCode} />
            )}
            {project.liveLink && (
              <MetaBlock label="Live" value="View live ↗" href={project.liveLink} />
            )}
          </aside>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", flex: 1, minWidth: "220px" }}>
            {related.length > 0 && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <span>See also:</span>
                {related.map((r, i) => (
                  <span key={r.slug}>
                    <Link
                      href={`/projects/${r.slug}`}
                      style={{
                        color: "var(--text-secondary)",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      {r.name}
                    </Link>
                    {i < related.length - 1 ? "," : ""}
                  </span>
                ))}
              </p>
            )}
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
                  className="prose-block"
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

        {project.caseStudy ? (
          project.slug === "mare" ? (
            <MareCaseStudyDecisions data={project.caseStudy} />
          ) : (
            <CaseStudyDecisions data={project.caseStudy} />
          )
        ) : null}

        {/* Media gallery — masonry grid, all media at once, click to lightbox */}
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
            <MediaGallery items={project.media} maxCols={project.mediaColumns} />
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
