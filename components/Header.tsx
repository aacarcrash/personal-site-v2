import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

type Crumb = { label: string; href?: string };

type HeaderProps = {
  /** When provided, replaces the name+tagline with breadcrumbs (project detail pages). */
  crumbs?: Crumb[];
};

export function Header({ crumbs }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "40px 64px 32px",
      }}
    >
      {crumbs ? (
        <nav style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
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
            Design Engineer. New media artist. Co-founder of Mare.
          </span>
        </Link>
      )}
      <nav style={{ display: "flex", gap: "28px", alignItems: "center" }}>
        <Link
          href="/about"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "14px",
            color: "var(--text-secondary)",
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
          }}
        >
          CV
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
