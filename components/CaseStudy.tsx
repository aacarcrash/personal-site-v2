// Unified, data-driven case-study slot, split in two so the project page can
// put the overview prose between them: CaseStudyHero (walkthrough video or
// hero image) renders under the page title, CaseStudyDecisions renders after
// the description. Decision cards sit in equal-width rows (grouped by `span`
// sums <= 12, widths no longer scale by span — equal columns keep the text
// measure consistent); images are shown whole on a dark background and
// expand on click. Mobile stacks each row — see .cs-row in app/globals.css.

import type { CSSProperties, ReactNode } from "react";
import { ExpandableImage } from "./ExpandableImage";
import type { CaseStudy as CaseStudyData, CaseStudyDecision } from "@/data/types";

const ROW_HEIGHTS = [360, 300, 330, 310];

function Label({ children }: { children: ReactNode }) {
  return (
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
      {children}
    </span>
  );
}

export function CaseStudyHero({ data }: { data: CaseStudyData }) {
  if (data.walkthroughVideo) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "40px 0 0" }}>
        {data.walkthroughLabel ? <Label>{data.walkthroughLabel}</Label> : null}
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
      </div>
    );
  }
  if (data.heroImage) {
    return (
      <div style={{ padding: "40px 0 0" }}>
        <ExpandableImage
          src={data.heroImage}
          alt={data.heroCaption ?? "Product hero"}
          caption={data.heroCaption}
          aspectRatio="2 / 1"
          maxWidth={980}
          fit="contain"
          sizes="(max-width: 1000px) 100vw, 980px"
          priority
        />
      </div>
    );
  }
  return null;
}

export function CaseStudyDecisions({ data }: { data: CaseStudyData }) {
  // Group decisions into rows whose spans sum to <= 12.
  const rows: CaseStudyDecision[][] = [];
  let cur: CaseStudyDecision[] = [];
  let sum = 0;
  for (const d of data.decisions) {
    const span = d.span ?? 6;
    if (cur.length && sum + span > 12) {
      rows.push(cur);
      cur = [];
      sum = 0;
    }
    cur.push(d);
    sum += span;
  }
  if (cur.length) rows.push(cur);

  if (rows.length === 0) return null;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "40px", padding: "56px 0 16px" }}>
      {data.decisionsLabel ? <Label>{data.decisionsLabel}</Label> : null}

      <div style={{ display: "flex", flexDirection: "column", gap: "48px" }}>
        {rows.map((row, ri) => {
          const h = ROW_HEIGHTS[ri % ROW_HEIGHTS.length];
          return (
            <div
              key={ri}
              className="cs-row"
              style={{ "--cs-cols": row.length, "--cs-row-h": `${h}px` } as CSSProperties}
            >
              {row.map((d, i) => (
                <article
                  key={i}
                  style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "14px" }}
                >
                  {d.image ? (
                    <ExpandableImage
                      src={d.image}
                      alt={d.imageCaption ?? d.title}
                      caption={d.imageCaption}
                      className="cs-decision-img"
                      fit={d.fit ?? "contain"}
                      sizes={`(max-width: 820px) 100vw, ${Math.round(88 / row.length)}vw`}
                    />
                  ) : (
                    <div
                      className="cs-decision-img"
                      style={{
                        width: "100%",
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
                      maxWidth: "62ch",
                    }}
                  >
                    {d.body}
                  </p>
                </article>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}
