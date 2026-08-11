import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PersonJsonLd } from "@/components/StructuredData";

export const metadata = {
  title: "About",
  description:
    "Aakarsh Singh is a product engineer and new media artist, co-founder of Mare. He studied Interactive Media at NYU Abu Dhabi; his art has shown at the Sydney Opera House, Ars Electronica, Louvre Abu Dhabi, and more.",
  alternates: { canonical: "/about" },
};

/* The column header. One object, because the whole point of the layout is
   that these labels are the same mark in every position — over each column,
   and over the contact row. */
const LABEL: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--step-meta)",
  lineHeight: "var(--lh-meta)",
  color: "var(--text-muted)",
  letterSpacing: "1.5px",
  textTransform: "uppercase",
};

const BODY: React.CSSProperties = {
  fontFamily: "var(--font-sans)",
  fontSize: "var(--step-base)",
  color: "var(--text-secondary)",
  lineHeight: "var(--lh-base)",
};

export default function AboutPage() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <PersonJsonLd />
      <Header />
      <main
        className="page-gutter"
        style={{
          flex: 1,
          paddingTop: "32px",
          paddingBottom: "80px",
          /* No max-width. The 788px cap (660 measure + 128 gutter) kept the
             measure honest when everything was one column, but it also left
             the right half of the page empty at every desktop size. The
             measure is now held by the two columns themselves — each flexes
             around 576/584, so neither runs past the ~78 characters the
             Absans specimen reads comfortably at. */
          width: "100%",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(32px, 8vw, var(--step-h1))",
            color: "var(--text)",
            letterSpacing: "-0.8px",
            marginBottom: "32px",
          }}
        >
          About
        </h1>
        {/* Column headers, on the rule both columns hang from. */}
        <div className="about-heads">
          <span style={LABEL}>Bio</span>
          <span style={LABEL}>Artist / Exhibition Statement</span>
        </div>

        <div className="about-cols" style={{ paddingTop: "28px" }}>
          {/* prose-scaley is on the COLUMN, not the first paragraph. It carries
              margin-bottom: 1.5em to reserve the overflow its scaleY creates,
              so on one paragraph of three it opened a 44px gap after the first
              and left 20px after the second. On the container the stretch
              applies to all three at once and the reserved margin lands where
              it belongs — at the end of the block. */}
          <div
            className="about-col-left prose-scaley"
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <span className="about-stacked-head" style={LABEL}>
              Bio
            </span>
            {/* One paragraph became three. The copy is unchanged and the breaks
                fall on sentence boundaries that were already there: the product,
                then the practice and where it has shown, then the history. Nine
                unbroken lines gave the eye nowhere to rest. */}
            {/* Opens on scope, not on a job title. "I'm a product engineer and
                a new media artist" was the byline, the page title, the OG card
                and the structured data all over again, and the reader had just
                read it in the header. The Tokyo startup stays out of here on
                purpose — the third paragraph already says he worked between
                studios and start-ups, so naming it twice would be the same
                fact wearing two hats. */}
            <p style={BODY}>
              I build products end to end, interface down to the systems
              underneath. Right now that&apos;s{" "}
              <a
                href="https://mare.run"
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                Mare
              </a>
              , a visual reference tool I co-founded for designers, artists, and
              researchers.
            </p>
            <p style={BODY}>
              My artistic practice revolves around films, installations, and
              live performance, with work shown at the Sydney Opera House, Ars
              Electronica, Louvre Abu Dhabi, Dark Mofo, MUTEK Dubai, Fuji Rock,
              the Jameel Arts Centre, and Alserkal Avenue.
            </p>
            <p style={BODY}>
              I&apos;ve previously worked between studios and start-ups in
              Tokyo, Berlin, and New York. I studied Interactive Media at New
              York University Abu Dhabi, with minors in Computer Science, Sound
              Computing, and Art&nbsp;History.
            </p>
          </div>
          {/* <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--step-base)",
              color: "var(--text-secondary)",
              lineHeight: "var(--lh-base)",
            }}
          >
            The two practices share more tools and questions than they look like
            they do. My artist / exhibition statement:.
          </p> */}

          <figure
            className="about-col-right"
            style={{
              /* The left rule is gone. It was the third emphasis signal on a
                 block that already carried a family change and a size jump, and
                 the column header now does the labelling job it was doing.
                 The size stays at --step-title: Aujournuit is a high-contrast
                 display face that does not hold at small sizes, so demoting
                 this block by shrinking it was never available. It is demoted
                 by POSITION instead — beside the bio rather than after it. */
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <span className="about-stacked-head" style={LABEL}>
              Artist / Exhibition Statement
            </span>
            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--step-title)",
                lineHeight: "var(--lh-title)",
                color: "var(--text)",
                margin: 0,
              }}
            >
              Aakarsh Singh is a creative technologist and new media artist
              mediating game engines and video alteration systems, as vehicles
              of alternate worldbuilding and worlding. He sees emerging
              technologies as underutilized lenses to dissect extant
              post-colonial truths and falsehoods, while simultaneously
              exploring the fabrication of new ones. Photogrammetry scans,
              simulated ecologies, archival footage and internet imagery are all
              actors in his reflection on (faulty) personal memory, communal
              mythmaking, and cybernetic constructivism.
            </blockquote>
          </figure>
        </div>

        {/* Contact spans both columns under its own rule. The two columns end
            at different heights and always will; the rule below them is what
            the eye reads as the bottom edge, so the ragged ends stop showing. */}
        <div
          style={{
            marginTop: "64px",
            paddingTop: "24px",
            borderTop: "0.5px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <p style={BODY}>
              Email me at{" "}
              <a
                href="mailto:aakarsh@nyu.edu"
                className="link-underline"
              >
                aakarsh@nyu.edu
              </a>
              , or read my{" "}
              {/* Internal route, so next/link — not the old direct-to-PDF
                  anchor. /cv carries both downloads (tech resume + artist CV)
                  and stays current; the hardcoded PDF filename did not. */}
              <Link
                href="/cv"
                className="link-underline"
              >
                CV
              </Link>
              .
            </p>
          <span style={LABEL}>Contact</span>
        </div>
      </main>
      <Footer />
    </div>
  );
}
