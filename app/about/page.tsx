import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Header />
      <main
        className="page-gutter"
        style={{
          flex: 1,
          paddingTop: "32px",
          paddingBottom: "80px",
          maxWidth: "780px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(34px, 8vw, 48px)",
            color: "var(--text)",
            letterSpacing: "-0.8px",
            marginBottom: "32px",
          }}
        >
          About
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            I&apos;m a product engineer and a new media artist. I co-founded{" "}
            <a
              href="https://mare.run"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "var(--text)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Mare
            </a>
            , a visual reference tool that organizes image archives for
            designers, artists, and researchers, where I design and build the
            product end to end. My artistic practice revolves around films,
            installations, and live performance, with work shown at the Sydney
            Opera House, Ars Electronica, Louvre Abu Dhabi, Dark Mofo, MUTEK
            UAE, Fuji Rock, the Jameel Arts Centre, and Alserkal Avenue.
            I&apos;ve previously worked between studios and start-ups in Tokyo,
            Berlin, and New York. I studied Interactive Media at New York
            University Abu Dhabi on a full-ride scholarship, with minors in
            Computer Science, Sound Computing, and Art&nbsp;History.
          </p>
          {/* <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            The two practices share more tools and questions than they look like
            they do. My artist / exhibition statement:.
          </p> */}

          <figure
            style={{
              margin: "20px 0 8px",
              padding: "28px 32px",
              borderLeft: "1.5px solid var(--text)",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
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
                fontSize: "20px",
                lineHeight: 1.55,
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
              Get in touch
            </span>
            <p
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              Email me at{" "}
              <a
                href="mailto:aakarsh@nyu.edu"
                style={{
                  color: "var(--text)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                aakarsh@nyu.edu
              </a>
              , or download my{" "}
              <a
                href="/Aakarsh_Singh_Resume_2026.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                resume (PDF)
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
