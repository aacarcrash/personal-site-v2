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
            I&rsquo;m a design engineer — I design and build interfaces where the details matter.
            I care about how things move, how interactions feel, and how systems communicate
            their logic through visual design.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            I&rsquo;m the co-founder and CTO of{" "}
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
            , where I designed and built the entire product — frontend, interaction design,
            clustering UI, and the underlying architecture. Mare is a platform for organising
            creative archives, and the interface itself is central to the product: how you
            navigate large visual collections, how clusters form and shift, how metadata
            surfaces without overwhelming. Every design decision is also an engineering decision.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            Before Mare, I built production web applications (Next.js, React, TypeScript), XR
            experiences in Unity and Unreal Engine, and interactive installations shown at Ars
            Electronica, the Louvre Abu Dhabi, and Jameel Arts Centre. I studied Interactive
            Media at NYU with minors in Computer Science, Art History, and Sound &amp; Music
            Computing.
          </p>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "18px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            I bring an unusual combination: real engineering depth (fullstack, systems,
            performance optimisation), formal visual training (art history, exhibition
            practice), and experience shipping products where the interface is the product.
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
