/**
 * Design-engineering case-study slots for the NEEEU project page.
 * Two graphics decisions made under Meta Spark's filter-size constraints.
 */

import Image from "next/image";

type DesignDecision = {
  title: string;
  body: string;
  image?: string;
  imageCaption?: string;
};

const DESIGN_DECISIONS: DesignDecision[] = [
  {
    title: "Faking a pearl on a flat canvas",
    body:
      "Meta Spark filters have to ship under a tight memory budget, so a real 3D sphere mesh for each pearl was out. I used a billboard of flat circles instead, with a shader that read the phone's rotation to keep the surface 'facing' the camera. From a few angles the same shader tricks the eye into seeing volume.",
    image: "/images/neeeu/2.jpeg",
    imageCaption: "Still from the prototype, with pearl orbs around the flower.",
  },
  {
    title: "Refraction without a mesh",
    body:
      "The pearls also needed to look wet. With no actual sphere geometry to refract through, I wrote a shader that converts world-space coordinates into the camera's space and samples a sphere normal map at the result. It mimics the colour-shift you get from light bending through glass without any of the geometry being there.",
    image: "/images/neeeu/1.jpeg",
    imageCaption: "Initial flower render from Fischersund that the filter was built around.",
  },
];

export function NeeeuCaseStudy() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "48px 0 16px",
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
        Two shader decisions
      </span>
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
            {d.image && (
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
