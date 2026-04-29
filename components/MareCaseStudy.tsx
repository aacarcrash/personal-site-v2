/**
 * MareCaseStudy renders the additional design-engineering case-study slots
 * unique to the Mare project page: screen recording, annotated design decisions,
 * tech stack callout. All slots ship with placeholders so the structure is
 * visible before media is captured.
 */

type DesignDecision = {
  title: string;
  body: string;
  // Image slot — placeholder until real screenshots are dropped in
  placeholder?: string;
};

const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "How clusters communicate boundaries",
    body: "Placeholder — capture screenshot showing the clustering UI and write 60–80 words on why no hard borders, how the layout conveys 'these belong together' without enclosing them, what was tried and rejected.",
    placeholder: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
  },
  {
    title: "How metadata surfaces without overwhelming layout",
    body: "Placeholder — capture screenshot of metadata appearing on hover/expansion and write 60–80 words on the trade-off between always-on metadata and dense visual grids.",
    placeholder: "linear-gradient(135deg, #1a1a2a, #2a2a3a)",
  },
  {
    title: "How dense grids work at different screen sizes",
    body: "Placeholder — capture before/after screenshots at three breakpoints and write 60–80 words on column count, item sizing, and what gets dropped on mobile and why.",
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
