import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { HeaderSearchTrigger } from "./Header/HeaderSearchTrigger";

type Crumb = { label: string; href?: string };

type HeaderProps = {
  /** When provided, replaces the name+tagline with breadcrumbs (project detail pages). */
  crumbs?: Crumb[];
};

export function Header({ crumbs }: HeaderProps) {
  return (
    <header className="site-header">
      {crumbs ? (
        <nav style={{ display: "flex", gap: "12px", alignItems: "baseline", flexWrap: "wrap" }}>
          {crumbs.map((c, i) => (
            <span key={i} style={{ display: "inline-flex", gap: "12px", alignItems: "baseline" }}>
              {c.href ? (
                <Link
                  href={c.href}
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                  }}
                >
                  {c.label}
                </Link>
              ) : (
                <span style={{ fontFamily: "var(--font-inter)", fontSize: "14px", color: "var(--text-secondary)" }}>
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
          <span style={{ fontFamily: "var(--font-inter)", fontSize: "15px", color: "var(--text-muted)" }}>
            Product Engineer. New media artist. Co-founder of Mare.
          </span>
        </Link>
      )}
      <HeaderSearchTrigger />
      <nav style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        <Link
          href="/about"
          style={{
            fontFamily: "var(--font-inter)",
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
            fontFamily: "var(--font-inter)",
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
