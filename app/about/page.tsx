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
            I work across two practices that keep informing each other.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            As a <strong style={{ color: "var(--text)", fontWeight: 500 }}>design engineer</strong>, I design and build interfaces where the
            details matter — how things move, how interactions feel, how systems
            communicate their logic through visual design. I&rsquo;m the co-founder and
            CTO of{" "}
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
            , where I designed and built the entire product — frontend, interaction
            design, clustering UI, and the underlying architecture. Before Mare I shipped
            production web at Callback (Next.js, TypeScript) and AR experiences for clients
            at NEEEU Spaces in Berlin (Unity, shaders, Meta Spark).
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            As an <strong style={{ color: "var(--text)", fontWeight: 500 }}>artist</strong> I make experimental film, installations, and live
            performance — work that uses computation as a material rather than a tool. My
            film <em>LAND</em> screened at Ars Electronica 2025; <em>Real Art</em> was
            installed at the Louvre Abu Dhabi University Takeover; I&rsquo;ve performed at
            Jameel Arts Centre, MUTEK.AE, Alte M&uuml;nze Berlin, and Fuji Rock Festival.
            I&rsquo;ve been an invited speaker at the Architectural Association and a
            visiting school student at AA Climate Cartographies in Dubai.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            The two practices share a method: treat structure as a creative material. In
            Mare, that&rsquo;s how clusters form. In an installation, it&rsquo;s how a
            scene transitions. The interface is always the work.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            I studied Interactive Media at NYU Abu Dhabi with minors in Computer Science,
            Sound &amp; Music Computing, and Art History. I&rsquo;m based between Abu Dhabi
            and remote.
          </p>

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
                href="/Aakarsh_Singh_Resume_090525.pdf"
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
