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
          // .page-gutter adds 64px each side and preflight makes everything
          // border-box, so this caps the BOX, not the text: 788 = 660 measure
          // + 128 gutter. 660 is not a guess — it is the column width of the
          // Absans specimen that read comfortably, and at 16px it lands near
          // 78 characters per line. The 840px measure I set earlier ran ~93.
          maxWidth: "788px",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p
            className="prose-scaley"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--step-base)",
              color: "var(--text-secondary)",
              lineHeight: "var(--lh-base)",
            }}
          >
            I&apos;m a product engineer and a new media artist. I co-founded{" "}
            <a
              href="https://mare.run"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline"
            >
              Mare
            </a>
            , a visual reference tool that organizes image archives for
            designers, artists, and researchers, where I design and build the
            product end to end. My artistic practice revolves around films,
            installations, and live performance, with work shown at the Sydney
            Opera House, Ars Electronica, Louvre Abu Dhabi, Dark Mofo, MUTEK
            Dubai, Fuji Rock, the Jameel Arts Centre, and Alserkal Avenue.
            I&apos;ve previously worked between studios and start-ups in Tokyo,
            Berlin, and New York. I studied Interactive Media at New York
            University Abu Dhabi on a full-ride scholarship and graduated cum
            laude, with minors in Computer Science, Sound Computing, and
            Art&nbsp;History.
          </p>
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
            style={{
              margin: "20px 0 8px",
              padding: "28px 32px",
              /* Was 1.5px solid var(--text): three times the weight of every
                 other rule on the site and near-black against their light
                 grey, so it read as a different kind of mark rather than the
                 same system. The statement already carries a family change
                 and a size jump — the rule does not need to shout too. */
              borderLeft: "0.5px solid var(--border)",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--step-meta)",
                lineHeight: "var(--lh-meta)",
                fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Artist / Exhibition Statement
            </span>
            <blockquote
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "var(--step-title)",
                lineHeight: "var(--lh-title)",
                color: "var(--text)",
                margin: 0,
                fontStyle: "italic",
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

          <div
            style={{
              marginTop: "40px",
              paddingTop: "32px",
              borderTop: "0.5px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--step-base)",
                color: "var(--text-secondary)",
                lineHeight: "var(--lh-base)",
              }}
            >
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
