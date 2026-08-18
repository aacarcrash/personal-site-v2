import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderSearchTrigger } from "./Header/HeaderSearchTrigger";

type Crumb = { label: string; href?: string };

type HeaderProps = {
  /**
   * Accepted and ignored. Project and sketch pages used to swap the name for
   * a "Home / LAND" trail, which made the top-left change identity as you
   * moved around the site — and the page name was already the H1 directly
   * below it, so the header printed the title twice. Every page now shows the
   * same name and byline. Kept in the type so the two call sites that pass it
   * keep type-checking; the page title lives in <h1> and in the metadata,
   * which is where a crawler reads it from anyway.
   */
  crumbs?: Crumb[];
  /**
   * Drop the byline under the name. /about opens by saying the same thing in
   * the first line of its own copy, so the header would be the fifth place on
   * that one page to state it — after the title tag, the OG card and the
   * structured data. Everywhere else the byline is the only description there
   * is, so it stays.
   */
  byline?: boolean;
};

export function Header({ crumbs, byline = true }: HeaderProps) {
  return (
    <header className="site-header">
        <Link href="/" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "28px",
              color: "var(--text)",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            Aakarsh Singh
          </span>
          {byline && (
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "15px", color: "var(--text-muted)" }}>
            {/* Was three clipped sentences ("Product Engineer. New media
                artist. Co-founder of Mare."), which is the staccato that
                reads as machine-written. Mare is gone from here on purpose —
                it is the first item in the featured strip directly below, so
                the byline was announcing something the page shows six inches
                later. This now matches the title, the OG card and the
                structured data, which all already said this. */}
            Product Engineer &amp; New Media Artist
          </span>
          )}
        </Link>
      <HeaderSearchTrigger />
      {/* alignSelf center, matching the search field. The header aligns on the
          last baseline, which is right for the name block — it is the only
          multi-line item and it sets the row height. But the field and the nav
          are the row's two objects, and baseline put them on different lines:
          the field centred on its own box, the nav on the byline's baseline.
          Centring both makes them agree with each other, which is the
          alignment you actually see. */}
      <nav
        aria-label="Main"
        style={{
          display: "flex",
          /* Four items now, not three. Without wrap the row overflows the
             viewport at 375px instead of breaking. */
          flexWrap: "wrap",
          gap: "12px 28px",
          alignItems: "center",
          alignSelf: "center",
        }}
      >
        <Link
          href="/about"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            padding: "6px 0",
          }}
        >
          About
        </Link>
        {/* /lab sits between the two pages a reviewer already knows how to
            read. It is the only nav item that is neither a bio nor a
            credential, so it goes where someone scanning for evidence will
            hit it after About and before CV. */}
        <Link
          href="/lab"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            padding: "6px 0",
          }}
        >
          Lab
        </Link>
        <Link
          href="/cv"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--text-secondary)",
            padding: "6px 0",
          }}
        >
          CV
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
