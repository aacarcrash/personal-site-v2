import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { ProjectSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function ProjectsList() {
  const projects = readJson("projects.json", z.array(ProjectSchema));

  return (
    <Shell
      title="Projects"
      subtitle={`${projects.length} entries`}
      actions={
        <Link
          href="/admin/projects/new"
          className="font-mono text-xs uppercase tracking-wider px-4 py-2 border"
          style={{ background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }}
        >
          + New project
        </Link>
      }
    >
      <ul className="divide-y divide-border border-y border-border">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/admin/projects/${p.slug}`}
              className="grid grid-cols-[64px_1fr_auto_auto] gap-4 items-center py-3 px-2 hover:bg-surface"
            >
              <div className="w-16 h-12 bg-surface relative overflow-hidden">
                {p.thumbnail ? (
                  <Image
                    src={p.thumbnail}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div>
                <div className="font-serif text-lg leading-tight">{p.name}</div>
                <div className="font-mono text-[11px] text-text-muted">{p.slug}</div>
              </div>
              <div className="font-mono text-[11px] text-text-secondary">{p.axes.year}</div>
              <div className="font-mono text-[11px] text-text-muted uppercase tracking-wider">
                {p.tier ?? "—"}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
