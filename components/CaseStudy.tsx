// Unified, data-driven case-study slot — replaces the per-project
// MareCaseStudy / CallbackCaseStudy / NeeeuCaseStudy components.
// Reads `project.caseStudy` and renders the optional walkthrough plus
// decision cards in the same layout the hand-coded ones used.

import Image from "next/image";
import type { CaseStudy as CaseStudyData } from "@/data/types";

export function CaseStudy({ data }: { data: CaseStudyData }) {
  const hasWalkthrough = !!data.walkthroughLabel || !!data.walkthroughVideo;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: hasWalkthrough ? "48px" : "24px",
        padding: "48px 0 16px",
      }}
    >
      {hasWalkthrough ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.walkthroughLabel ? (
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
              {data.walkthroughLabel}
            </span>
          ) : null}
          {data.walkthroughVideo ? (
            <video
              src={data.walkthroughVideo}
              controls
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "6px",
                border: "0.5px solid var(--border)",
                background: "#0d0d0d",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "16 / 9",
                borderRadius: "6px",
                background: "linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "0.5px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  alignItems: "center",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                <span
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  ▶
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  Walkthrough placeholder
                  {data.walkthroughDuration ? ` · ${data.walkthroughDuration}` : ""}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {data.decisionsLabel ? (
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
          {data.decisionsLabel}
        </span>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
        }}
      >
        {data.decisions.map((d, i) => (
          <article key={i} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {d.image ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 10",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background: "var(--surface)",
                }}
              >
                <Image
                  src={d.image}
                  alt={d.imageCaption ?? d.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16 / 10",
                  borderRadius: "4px",
                  background: d.placeholder ?? "var(--surface)",
                  display: "flex",
                  alignItems: "flex-end",
                  padding: "10px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  screenshot placeholder
                </span>
              </div>
            )}
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "22px",
                color: "var(--text)",
                letterSpacing: "-0.2px",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "15px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {d.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
