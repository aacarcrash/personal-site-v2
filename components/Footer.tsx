export function Footer() {
  const links: { label: string; href: string }[] = [
    { label: "Email", href: "mailto:aakarsh@nyu.edu" },
    { label: "GitHub", href: "https://github.com/aacarcrash" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aakarshs/" },
    { label: "Are.na", href: "https://www.are.na/aakarsh-singh-xyyccgscqnu" },
    { label: "Instagram", href: "https://www.instagram.com/aacarcrash/" },
  ];

  return (
    <footer className="site-footer">
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          // --text-subtle (#BBBBBB on #FAFAFA) is ~1.9:1 — far under 4.5:1.
          color: "var(--text-muted)",
        }}
      >
        © {new Date().getFullYear()} Aakarsh Singh
      </span>
      <nav aria-label="Elsewhere">
        {links.map((l) => (
          <a
            key={l.href}
            href={l.href}
            target={l.href.startsWith("http") ? "_blank" : undefined}
            rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
