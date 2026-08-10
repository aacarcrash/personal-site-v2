import { Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { ResponsiveGrid } from "@/components/ResponsiveGrid";
import { PersonJsonLd } from "@/components/StructuredData";
import ControlBarProto from "@/components/proto/ControlBarProto";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PersonJsonLd />
      {/* PROTOTYPE: A/B/C/D control-bar placement experiment, proto/control-bar branch. */}
      <Suspense fallback={null}>
        <ControlBarProto />
      </Suspense>
      <Header />
      <main style={{ flex: 1 }}>
        <FeaturedStrip projects={projects} />
        <ResponsiveGrid projects={projects} />
      </main>
      <Footer />
    </div>
  );
}
