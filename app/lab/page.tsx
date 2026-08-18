import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RetrievalDemo } from "@/components/Lab/RetrievalDemo";

export const metadata = {
  title: "Lab",
  description:
    "Three systems that run this site — semantic search with its retrieval guards exposed, a force-directed cluster layout, and a 2D axis grid that re-sorts the same work five ways.",
  alternates: { canonical: "/lab" },
};

/* Why this page exists
   -------------------
   The portfolio shows finished work; it does not show how anything was built.
   A reviewer hiring for applied AI or product engineering has to take the
   engineering on trust, because the only artefacts on offer are screenshots
   and prose. This page is the opposite: three systems that are already
   running the site, opened up, with the decisions and their costs written
   down beside them.

   Deliberately not a gallery of things built to be demos. Everything here is
   load-bearing — turn it off and a real surface stops working. */

export default function LabPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main
        className="page-gutter"
        style={{ flex: 1, paddingTop: "32px", paddingBottom: "80px", width: "100%" }}
      >
        <h1 className="lab-h1">Lab</h1>

        <p className="lab-lede">
          Three systems that run this site, with their working shown. Each one is
          live on a page you can visit; none of them were built for this page.
          Where a decision cost something, the cost is written down.
        </p>

        {/* ---- 1. Retrieval ------------------------------------------------ */}
        <section className="lab-section" id="retrieval">
          <div className="lab-section-head">
            <span className="eyebrow">01 / Retrieval</span>
            <h2 className="lab-h2">Semantic search, guards visible</h2>
          </div>

          <div className="lab-prose">
            <p>
              The command palette (press <kbd className="lab-kbd">&#8984;K</kbd>) searches
              this site twice. Keyword matching answers instantly from an in-memory
              index; underneath it, a semantic tier embeds the query and runs cosine
              similarity against vectors computed at build time with{" "}
              <code className="lab-code">bge-m3</code>, 1024 dimensions per item. The
              vectors ship in the bundle, so there is no database and no vector store
              to keep alive for a corpus this size.
            </p>
            <p>
              Cosine similarity will happily rank every item in the corpus against any
              query, including a query that means nothing. Three guards decide what a
              reader actually sees, and the demo below shows all three doing it: a
              similarity floor drops matches that are merely closest rather than close,
              a gap cutoff ends the list where the score curve falls away, and a hard
              cap bounds the rest. Two strong results are a better answer than two
              strong results followed by three mediocre ones.
            </p>
            <p>
              The route fails closed. If the embedding call errors or times out at four
              seconds it returns a 503 and the palette carries on keyword-only, so the
              worst case is a smaller result list rather than a broken search box.
            </p>
            <p>
              The demo below runs the real route and prints what it scored. Try{" "}
              <span className="lab-code">asdfgh</span>: eight things still score
              against a word that means nothing, because cosine similarity has no
              concept of a bad query, and the floor is the only reason seven of them
              never reach you. Then try <span className="lab-code">compute shader</span>,
              where two results sit well clear of the rest and the gap cutoff ends the
              list rather than padding it out to five.
            </p>
          </div>

          <RetrievalDemo />

          <p className="lab-source">
            Route: <code className="lab-code">app/api/search/route.ts</code> &middot;
            vectors: <code className="lab-code">content/search-vectors.json</code>
          </p>
        </section>

        {/* ---- 2. Cluster layout ------------------------------------------- */}
        <section className="lab-section" id="clusters">
          <div className="lab-section-head">
            <span className="eyebrow">02 / Layout</span>
            <h2 className="lab-h2">A force field that had to be argued with</h2>
          </div>

          <div className="lab-prose">
            <p>
              The{" "}
              <Link href="/?view=cluster" className="link-underline">
                cluster view
              </Link>{" "}
              lays the work out as a d3-force simulation. Each value of an axis is an
              attractor pinned in place; every project is linked to the attractors it
              is tagged with and pulled toward them, and a collision force keeps the
              tiles off each other. The simulation runs a fixed number of ticks and
              then stops, because the useful output is a stable arrangement rather
              than something that keeps moving while you read it.
            </p>
            <p>
              The first version placed the attractors by hand and the layout kept
              failing in the same three ways: adjacent values landed on top of each
              other, whole quadrants of the canvas came out empty, and the wells
              collapsed into identical circles wherever the size clamp bit. Hand
              placement caused all three. Attractor positions are now computed onto an
              ellipse at equal angular spacing, so a four-value axis and a seven-value
              axis both get an even ring, and the well fitting scales both radii by a
              single factor instead of clamping each one on its own.
            </p>
            <p>
              Two things stayed wrong on purpose. The left side of the context ring is
              sparse, and on medium three labels sit close together. Both are the data
              telling the truth, since one context value has a single project in it,
              and a hand nudge would have hidden that rather than fixed it.
            </p>
          </div>

          <p className="lab-source">
            <code className="lab-code">components/ClusterView/useForceLayout.ts</code>{" "}
            &middot; <code className="lab-code">fitBlob.ts</code> &middot; written up in{" "}
            <code className="lab-code">docs/cluster-view-redesign.md</code>
          </p>
        </section>

        {/* ---- 3. Axis grid ------------------------------------------------ */}
        <section className="lab-section" id="axis-grid">
          <div className="lab-section-head">
            <span className="eyebrow">03 / Interaction</span>
            <h2 className="lab-h2">One set of work, five ways to read it</h2>
          </div>

          <div className="lab-prose">
            <p>
              The homepage grid plots 31 projects against two axes chosen from five:
              year, medium, concern, technology, context. Swapping an axis re-sorts
              every tile into a new cell and animates it there, so the grid answers
              &ldquo;what else sits next to this?&rdquo; without a page load. Try{" "}
              <Link href="/?y=concern&x=technology" className="link-underline">
                concern against technology
              </Link>
              , then{" "}
              <Link href="/?y=year&x=context" className="link-underline">
                year against context
              </Link>
              .
            </p>
            <p>
              A project rarely has one value on an axis, and the grid does not force it
              to. An item tagged with three technologies appears in three cells, deduped
              within any single cell. That means the number of tiles on screen is larger
              than the number of projects, which is the right answer to one question and
              the wrong answer to the other, so the two counts are labelled separately
              rather than reconciled into one misleading number.
            </p>
            <p>
              Both axes are in the URL, which is the part that matters for a portfolio:
              a link can open the grid already sorted the way the sender meant. The
              state is written with{" "}
              <code className="lab-code">history.replaceState</code>{" "}
              rather than the router, because a router replace hands the page to Next&apos;s scroll
              handler and resets the scroll position on every axis change.
            </p>
          </div>

          <p className="lab-source">
            <code className="lab-code">components/AxisGrid/</code> &middot;{" "}
            <code className="lab-code">axisGridUtils.ts</code>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
