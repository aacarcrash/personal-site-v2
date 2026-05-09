import Link from "next/link";
import { z } from "zod";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Shell } from "@/components/admin/Shell";
import { Banner } from "@/components/admin/ui";
import {
  ProjectSchema,
  ClusterSchema,
  CvSchema,
  FeaturedSchema,
} from "@/data/types";
import { readJson } from "@/lib/admin/storage";

function lastAuditEntry(): string | null {
  const path = resolve(process.cwd(), ".admin-log", "audit.jsonl");
  if (!existsSync(path)) return null;
  const lines = readFileSync(path, "utf8").trim().split("\n");
  const last = lines[lines.length - 1];
  if (!last) return null;
  try {
    const entry = JSON.parse(last) as { ts: string; action: string };
    return `${entry.action} · ${new Date(entry.ts).toLocaleString()}`;
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  const projects = readJson("projects.json", z.array(ProjectSchema));
  const clusters = readJson("clusters.json", z.array(ClusterSchema));
  const featured = readJson("featured.json", FeaturedSchema);
  const cv = readJson("cv.json", CvSchema);
  const last = lastAuditEntry();

  const stats = [
    { label: "Projects", value: projects.length, href: "/admin/projects" },
    { label: "Sketches", value: clusters.length, href: "/admin/clusters" },
    { label: "Featured", value: featured.slugs.length, href: "/admin/featured" },
    { label: "CV roles", value: cv.experience.length, href: "/admin/cv" },
  ];

  return (
    <Shell title="Dashboard" subtitle="Local-only · /admin">
      <Banner tone="info">
        <strong className="font-bold">Local-first.</strong> All edits write to <code className="font-mono">content/*.json</code> and{" "}
        <code className="font-mono">public/images/*</code>. Review with{" "}
        <code className="font-mono">git diff</code>, commit when ready.
      </Banner>

      <div className="grid grid-cols-4 gap-px bg-border mt-8 border border-border">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-bg p-6 hover:bg-surface transition-colors"
          >
            <div className="font-serif text-5xl">{s.value}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-text-muted mt-2">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-wider text-text-muted mb-3">
          Quick edits
        </h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/projects/mare"
            className="font-mono text-xs px-3 py-2 border border-border hover:border-text"
          >
            Edit Mare
          </Link>
          <Link
            href="/admin/projects/new"
            className="font-mono text-xs px-3 py-2 border"
            style={{ background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }}
          >
            + New project
          </Link>
          <Link
            href="/admin/featured"
            className="font-mono text-xs px-3 py-2 border border-border hover:border-text"
          >
            Reorder featured
          </Link>
        </div>
      </section>

      {last ? (
        <p className="mt-10 font-mono text-[11px] text-text-subtle">
          Last action: {last}
        </p>
      ) : null}
    </Shell>
  );
}
