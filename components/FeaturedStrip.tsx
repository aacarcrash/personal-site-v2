import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { ProjectOrCluster, Project } from "@/data/types";
import { thumbFor } from "@/lib/thumb";
import { featuredSlugs, featuredColumns } from "@/data/featured";

type Props = {
  projects: ProjectOrCluster[];
};

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
  "aa-dubai": "linear-gradient(135deg, #2a1a1a 0%, #3a2a2a 50%, #2a1a1a 100%)",
};

const PLACEHOLDER_LABELS: Record<string, { title: string; sub?: string }> = {
  mare: { title: "Mare", sub: "Visual archive platform" },
  "date-0-0": { title: "Date 0:0", sub: "Wafaa Bilal × Sara Niroobakhsh" },
  "aa-warsaw": { title: "Playful Cartographies", sub: "AA Visiting School, Warsaw" },
  "aa-dubai": { title: "Climate Cartographies", sub: "Alserkal Avenue, Dubai" },
};

function isPlaceholder(thumbnail: string): boolean {
  if (thumbnail === "" || thumbnail.includes("/placeholder.")) return true;
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

export function FeaturedStrip({ projects }: Props) {
  const projectBySlug = new Map<string, Project>();
  for (const p of projects) {
    if (p.type === "project") projectBySlug.set(p.slug, p);
  }

  const items = featuredSlugs
    .map((slug) => projectBySlug.get(slug))
    .filter((p): p is Project => Boolean(p));

  if (items.length === 0) return null;

  return (
    <section
      className="featured-strip"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 500,
          color: "var(--text-muted)",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
        }}
      >
        Featured
      </span>
      <div
        className="featured-grid"
        style={{ "--featured-columns": featuredColumns } as CSSProperties}
      >
        {items.map((p) => {
          const placeholder = isPlaceholder(p.thumbnail);
          const watermark = placeholder ? PLACEHOLDER_LABELS[p.id] : undefined;
          return (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  borderRadius: "6px",
                  overflow: "hidden",
                  background: placeholder
                    ? PLACEHOLDER_GRADIENTS[p.id] ?? "var(--surface)"
                    : "var(--surface)",
                }}
                aria-hidden
              >
                {!placeholder ? (
                  <Image
                    src={thumbFor(p.thumbnail)}
                    alt=""
                    fill
                    sizes={`(max-width: 768px) 100vw, ${Math.floor(100 / featuredColumns)}vw`}
                    style={{ objectFit: "cover" }}
                  />
                ) : watermark ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "4px",
                      color: "rgba(255,255,255,0.28)",
                      textAlign: "center",
                      padding: "0 16px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "22px",
                        letterSpacing: "-0.4px",
                      }}
                    >
                      {watermark.title}
                    </span>
                    {watermark.sub && (
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        {watermark.sub}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "20px",
                  color: "var(--text)",
                }}
              >
                {p.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {p.subtitle}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
