import Link from "next/link";
import { ReactNode } from "react";
import { logoutAction } from "@/app/admin/_actions/session";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/board", label: "Board" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/clusters", label: "Sketches" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/axes", label: "Axes" },
  { href: "/admin/cv", label: "CV" },
];

export function Shell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-[200px_1fr] bg-bg text-text">
      <aside className="border-r border-border px-5 py-6 flex flex-col gap-6 sticky top-0 self-start h-screen">
        <div>
          <Link href="/admin" className="font-serif text-2xl block">
            Admin
          </Link>
          <p className="font-mono text-[10px] text-text-muted uppercase tracking-wider mt-1">
            127.0.0.1
          </p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-text py-1"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-wider text-text-muted hover:text-text block mb-2"
          >
            View site →
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-wider text-text-muted hover:text-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="px-10 py-8 max-w-5xl w-full">
        <header className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="font-serif text-4xl">{title}</h1>
            {subtitle ? (
              <p className="font-mono text-xs text-text-muted uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
