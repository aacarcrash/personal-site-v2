import Link from "next/link";
import Image from "next/image";
import type { ProjectOrCluster } from "@/data/types";

type Props = {
  projects: ProjectOrCluster[];
};

// Tonal gradients used when a project doesn't have a real thumbnail yet.
const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
};

function isPlaceholder(thumbnail: string): boolean {
  return thumbnail === "" || thumbnail.includes("/placeholder.");
}

export function FeaturedStrip({ projects }: Props) {
  const featured = projects.filter(
    (p): p is Extract<ProjectOrCluster, { type: "project" }> =>
      p.type === "project" && p.featured
  );

  if (featured.length === 0) return null;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        padding: "8px 64px 40px",
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
      <div style={{ display: "flex", gap: "24px" }}>
        {featured.slice(0, 3).map((p) => {
          const placeholder = isPlaceholder(p.thumbnail);
          return (
            <Link
              key={p.id}
              href={`/projects/${p.slug}`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
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
                {!placeholder && (
                  <Image
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "22px",
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
