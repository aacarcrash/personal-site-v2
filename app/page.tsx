import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedStrip } from "@/components/FeaturedStrip";
import { IntroBlock } from "@/components/IntroBlock";
import { ResponsiveGrid } from "@/components/ResponsiveGrid";
import { ViewBar } from "@/components/ViewBar";
import { PersonJsonLd } from "@/components/StructuredData";
import { projects } from "@/data/projects";

export default function HomePage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PersonJsonLd />
      <Header />
      <main style={{ flex: 1 }}>
        <IntroBlock />
        <FeaturedStrip projects={projects} />
        {/* id is the ViewBar's anchor: it watches this region with an
            IntersectionObserver and springs open as the work you can
            actually switch views on comes into view. That replaces a fixed
            scroll threshold, which was wrong at every viewport it wasn't
            tuned for. */}
        <div id="work-region">
          <ResponsiveGrid projects={projects} />
        </div>
      </main>
      <Footer />
      {/* Extra bottom clearance so the floating ViewBar (fixed 24px from the
          viewport bottom, ~36px tall) never sits over the footer links when
          scrolled all the way down. Padding lives AFTER Footer, not on
          <main> — Footer renders below main, so padding on main alone never
          reaches the page's true bottom edge. */}
      <div aria-hidden style={{ height: "calc(96px + env(safe-area-inset-bottom))" }} />
      <ViewBar />
    </div>
  );
}
