export function Footer() {
  const links: { label: string; href: string; newTab?: boolean }[] = [
    /* The résumé was reachable only from /cv, which a reviewer has to think to
       visit. It leads here because it is the one link someone screening for a
       role is looking for, and the footer is where they look after the work.
       Verified on disk: public/Aakarsh_Singh_Resume_2026.pdf. */
    { label: "Résumé (PDF)", href: "/Aakarsh_Singh_Resume_2026.pdf", newTab: true },
    /* Order below is by how alive the account is, not by convention. GitHub sat
       second, which promised activity that is not there; it moved down to
       fourth, ahead of Instagram only. */
    { label: "Email", href: "mailto:aakarsh@nyu.edu" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aakarshs/" },
    { label: "Are.na", href: "https://www.are.na/aakarsh-singh-xyyccgscqnu" },
    { label: "GitHub", href: "https://github.com/aacarcrash" },
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
      <nav aria-label="Résumé and elsewhere">
        {links.map((l) => {
          const external = l.newTab || l.href.startsWith("http");
          return (
          <a
            key={l.href}
            href={l.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            {l.label}
          </a>
          );
        })}
      </nav>
    </footer>
  );
}
