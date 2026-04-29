import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { AxisGrid } from "@/components/AxisGrid/AxisGrid";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <FeaturedStrip projects={projects} />
        <Suspense fallback={null}>
          <AxisGrid projects={projects} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
