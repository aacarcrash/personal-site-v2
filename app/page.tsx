import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <FeaturedStrip projects={projects} />
        <section
          style={{
            padding: "40px 64px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}
        >
          Axis grid — Phase 2 (next)
        </section>
      </main>
      <Footer />
    </div>
  );
}
