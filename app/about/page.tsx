import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        style={{
          flex: 1,
          padding: "32px 64px 0",
          maxWidth: "780px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "48px",
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
            I work as a design engineer and an artist. I co-founded{" "}
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
            , where I design and build the product. The artist side is films,
            installations, and live performance, with work shown at Ars
            Electronica, the Jameel Arts Centre, Alserkal Avenue, MUTEK, and Fuji
            Rock, between studios and residencies in Tokyo, Berlin, New York, and
            Abu Dhabi.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            The two practices share more tools and questions than they look
            like they do. The statement below is the version I use for
            exhibitions and reads truer than anything I&rsquo;d write here.
          </p>

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
                fontSize: "10px",
                fontWeight: 500,
                color: "var(--text-muted)",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              Statement
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
              mediating game engines and video alteration systems, as vehicles of
              alternate worldbuilding and worlding. He sees emerging technologies
              as underutilized lenses to dissect extant post-colonial truths and
              falsehoods, while simultaneously exploring the fabrication of new
              ones. Photogrammetry scans, simulated ecologies, archival footage
              and internet imagery are all actors in his reflection on (faulty)
              personal memory, communal mythmaking, and cybernetic constructivism.
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
                href="mailto:hello@aakarsh.dev"
                style={{
                  color: "var(--text)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                hello@aakarsh.dev
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
