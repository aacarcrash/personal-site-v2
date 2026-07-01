import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { ProjectSchema, ClusterSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";
import axesJson from "@/content/axes.json";
import { Board, type BoardRow } from "./Board";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const projects = readJson("projects.json", z.array(ProjectSchema));
  const clusters = readJson("clusters.json", z.array(ClusterSchema));
  const axes = axesJson as Record<string, string[]>;

  const rows: BoardRow[] = [
    ...projects.map((p) => ({
      kind: "project" as const,
      id: p.id,
      name: p.name,
      tier: p.tier ?? null,
      axes: p.axes as unknown as Record<string, string | string[]>,
    })),
    ...clusters.map((c) => ({
      kind: "cluster" as const,
      id: c.id,
      name: c.name,
      tier: null,
      axes: c.axes as unknown as Record<string, string | string[]>,
    })),
  ];

  return (
    <Shell
      title="Board"
      subtitle={`${projects.length} projects · ${clusters.length} sketches — bulk tag editor`}
    >
      <Board rows={rows} axes={axes} />
    </Shell>
  );
}
