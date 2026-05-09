import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { AxesConfigSchema, ProjectSchema, ClusterSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";
import { AxesEditor } from "./AxesEditor";

export default async function AxesPage() {
  const axes = readJson("axes.json", AxesConfigSchema);
  const projects = readJson("projects.json", z.array(ProjectSchema));
  const clusters = readJson("clusters.json", z.array(ClusterSchema));

  // Pre-compute reference counts so the editor can show "this rename hits N items".
  const counts: Record<string, Record<string, number>> = {
    year: {}, medium: {}, concern: {}, technology: {}, context: {},
  };
  for (const item of [...projects, ...clusters]) {
    for (const axis of ["year", "medium", "concern", "technology", "context"] as const) {
      const cur = item.axes[axis];
      const arr = Array.isArray(cur) ? cur : cur ? [cur] : [];
      for (const v of arr) {
        counts[axis][v] = (counts[axis][v] ?? 0) + 1;
      }
    }
  }

  return (
    <Shell title="Axes" subtitle="Tab names + values for the grid">
      <AxesEditor initial={axes} counts={counts} />
    </Shell>
  );
}
