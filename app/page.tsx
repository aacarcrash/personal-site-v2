import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { ResponsiveGrid } from "@/components/ResponsiveGrid";
import { PersonJsonLd } from "@/components/StructuredData";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PersonJsonLd />
      <Header />
      <main style={{ flex: 1 }}>
        <FeaturedStrip projects={projects} />
        <ResponsiveGrid projects={projects} />
      </main>
      <Footer />
    </div>
  );
}
