/**
 * Design-engineering case study slots for the Mare project page:
 * a screen recording and two annotated decisions taken from the product.
 * Image slots stay as gradients until real screenshots are dropped in.
 */

type DesignDecision = {
  title: string;
  body: string;
  placeholder?: string;
};

const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "Three clustering modes side by side",
    body:
      "Mare clusters the same library three different ways at once: Balanced, Aesthetic, and Semantic. There's a Recluster button if any of them feels off. We considered a single similarity slider but a slider implies one signal smoothly shifting between two ends. The three modes are actually different algorithms reading different things, so labelling them is more honest than hiding the choice behind a slider.",
    placeholder: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
  },
  {
    title: "Showing what the system isn't sure about",
    body:
      "A lot of how Mare reads in use comes down to surfacing where it's unsure. Items the algorithm can't confidently place sit in a persistent Unclustered rail with a count, instead of being pushed into the nearest cluster. Clusters can also hold sub-collections, so a 123-item collection might contain seven of them, and you can drill into a fuzzy boundary instead of treating every cluster as flat. Most of the interesting cross-references in someone's archive live in those unsure piles.",
    placeholder: "linear-gradient(135deg, #1a1a2a, #2a2a3a)",
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
          Two decisions inside Mare
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "40px",
        }}
      >
        {DESIGN_DECISIONS.map((d, i) => (
          <article
            key={i}
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
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
