/**
 * MareCaseStudy renders the design-engineering case-study slots unique to the
 * Mare project page: screen recording, annotated design decisions. Each
 * decision is a real interaction choice from the product, not a generic
 * placeholder — image slots are gradients until real screenshots are dropped in.
 */

type DesignDecision = {
  title: string;
  body: string;
  // Image slot — placeholder until real screenshots are dropped in
  placeholder?: string;
};

const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "Three clustering modes, not a slider",
    body:
      "Mare clusters the same library three ways — Balanced, Aesthetic, Semantic — with a Recluster button. The temptation was a single 'similarity' slider, but a slider implies a smooth gradient between two ends. The actual modes are different algorithms with different signals (visual features vs. embeddings vs. blended). Three buttons make that honest. They're also the smallest control surface that lets a user actively reshape what 'belongs together' means.",
    placeholder: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
  },
  {
    title: "An always-visible 'Unclustered' sidebar",
    body:
      "Items the system can't confidently place don't get hidden in a hamburger or forced into the nearest cluster — they sit in a persistent right-rail labelled with their count. This was a deliberate choice to surface ambiguity rather than smooth it over. For a tool meant to support creative thinking, the unsure pile is often where the most interesting connections live.",
    placeholder: "linear-gradient(135deg, #1a1a2a, #2a2a3a)",
  },
  {
    title: "Item detail as side panel, not modal",
    body:
      "Clicking any item opens a contextual side panel with themes, related items, and an extracted color palette — without losing the cluster you came from. A modal would force you to dismiss-and-return for every cross-reference. The panel keeps the visual context intact and makes related-item exploration a one-click motion. The color palette isn't decoration — it's the same signal Aesthetic mode uses to cluster.",
    placeholder: "linear-gradient(135deg, #1a2a1a, #2a3a2a)",
  },
];

export function MareCaseStudy() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "48px",
        padding: "48px 0 16px",
      }}
    >
      {/* Screen recording slot */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
          Product walkthrough
        </span>
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
              Screen recording placeholder · 60–90s
            </span>
          </div>
        </div>
      </div>

      {/* Design decisions */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
          Design decisions
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "32px",
        }}
      >
        {DESIGN_DECISIONS.map((d, i) => (
          <article
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
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
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                color: "var(--text)",
                letterSpacing: "-0.2px",
              }}
            >
              {d.title}
            </h3>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
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
