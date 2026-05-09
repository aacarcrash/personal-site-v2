import Link from "next/link";
import Image from "next/image";
import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { ClusterSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function ClustersList() {
  const clusters = readJson("clusters.json", z.array(ClusterSchema));
  return (
    <Shell
      title="Sketches"
      subtitle={`${clusters.length} cluster(s) · render at /sketches/[slug]`}
      actions={
        <Link
          href="/admin/clusters/new"
          className="font-mono text-xs uppercase tracking-wider px-4 py-2 border"
          style={{ background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }}
        >
          + New sketch group
        </Link>
      }
    >
      <ul className="divide-y divide-border border-y border-border">
        {clusters.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/clusters/${c.id}`} className="grid grid-cols-[64px_1fr_auto] gap-4 items-center py-3 px-2 hover:bg-surface">
              <div className="w-16 h-12 bg-surface relative overflow-hidden">
                {c.thumbnail ? <Image src={c.thumbnail} alt="" fill sizes="64px" className="object-cover" unoptimized /> : null}
              </div>
              <div>
                <div className="font-serif text-lg leading-tight">{c.name}</div>
                <div className="font-mono text-[11px] text-text-muted">{c.id}</div>
              </div>
              <div className="font-mono text-[11px] text-text-secondary">{c.items.length} items</div>
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  );
}
