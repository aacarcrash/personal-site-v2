import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderSearchTrigger } from "./Header/HeaderSearchTrigger";

type Crumb = { label: string; href?: string };

type HeaderProps = {
  /** When provided, replaces the name+tagline with breadcrumbs (project detail pages). */
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
      {crumbs ? (
        <nav aria-label="Breadcrumb" style={{ display: "flex", gap: "12px", alignItems: "baseline", flexWrap: "wrap" }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", gap: "12px", alignItems: "baseline" }}>
              {c.href ? (
                <Link
                  href={c.href}
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                  }}
                >
                  {c.label}
                </Link>
              ) : (
                <span style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "var(--text-secondary)" }}>
                  {c.label}
                </span>
              )}
              {i < crumbs.length - 1 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-subtle)" }}>/</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
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
      )}
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
        style={{ display: "flex", gap: "28px", alignItems: "center", alignSelf: "center" }}
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
