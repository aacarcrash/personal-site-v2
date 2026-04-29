export function Footer() {
  const links: { label: string; href: string }[] = [
    { label: "Email", href: "mailto:hello@aakarsh.dev" },
    { label: "GitHub", href: "https://github.com/AakSin" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aakarshs/" },
    { label: "Are.na", href: "https://are.na/aakarsh-singh" },
  ];

  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "48px 64px 40px",
        marginTop: "auto",
        borderTop: "0.5px solid var(--border)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "13px",
          color: "var(--text-subtle)",
        }}
      >
        © {new Date().getFullYear()} Aakarsh Singh
      </span>
      <nav style={{ display: "flex", gap: "24px" }}>
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
