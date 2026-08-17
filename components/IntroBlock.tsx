import Link from "next/link";

/**
 * The homepage's only text anchor. Before this the page opened straight into
 * a 31-item grid, so the sole role signal above the fold was the header
 * byline — a reviewer landing cold could see that the work looked good and
 * still not know what the person does or what they are for.
 *
 * Three parts, in the order a stranger needs them: what he builds (with the
 * product he is building now named and linked), where the art has shown, and
 * what he is looking for. The credential line was buried in paragraph two of
 * /about, which most readers never reach; venues are the thing recruiters
 * pattern-match on, so they move above the fold.
 *
 * Sits on .featured-strip's own gutter values rather than .page-gutter so the
 * copy hangs off the same left edge as the FEATURED label directly below it.
 */
export function IntroBlock() {
  return (
    <section className="intro-block">
      {/* Deliberately not the same sentences as /about, which opens on the
          same two facts. The homepage version does one thing /about does not:
          it says what the grid below is, so the art and the product work
          don't read as one undifferentiated pile. */}
      <p className="intro-lede">
        I build products end to end, from the interface down to the systems
        underneath. Right now that&apos;s{" "}
        <Link href="/projects/mare" className="link-underline">
          Mare
        </Link>
        , a reference tool I co-founded for designers, artists, and researchers,
        which is in closed beta with 100+ creatives and around 10,000 items on
        it. Mare and the work I shipped at Callback are collected under{" "}
        <Link href="/?view=list&context=Product" className="link-underline">
          product
        </Link>
        . Everything else on this page is my art practice: films,
        installations, and live performance.
      </p>
      {/* Mono, one line, · separated — the same mark the site already uses for
          metadata. Wraps to two lines on mobile rather than scrolling. */}
      <p className="intro-credits">
        Sydney Opera House · Ars Electronica · Louvre Abu Dhabi · Dark Mofo ·
        NYU Abu Dhabi
      </p>
      <p className="intro-seeking">
        I&apos;m looking for applied AI and product engineering work, and my{" "}
        <Link href="/cv" className="link-underline">
          CV
        </Link>{" "}
        has the detail.
      </p>
    </section>
  );
}
