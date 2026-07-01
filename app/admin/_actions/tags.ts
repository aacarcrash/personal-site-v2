"use server";

// Bulk tag/axis editor backing the unified admin Board. Applies a batch of
// per-item axis/tier patches to content/projects.json + content/clusters.json
// in one atomic pass. Re-validates the whole array on write via Zod.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProjectSchema, ClusterSchema } from "@/data/types";
import { readJson, writeJson } from "@/lib/admin/storage";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

const ProjectsArray = z.array(ProjectSchema);
const ClustersArray = z.array(ClusterSchema);

type AxesPatch = Partial<{
  year: string | string[];
  medium: string | string[];
  concern: string | string[];
  technology: string | string[];
  context: string | string[];
}>;

type Edit = {
  kind: "project" | "cluster";
  id: string;
  axes?: AxesPatch;
  tier?: string | null;
};

export async function applyTagEditsAction(
  edits: Edit[],
): Promise<{ ok: true; count: number } | { error: string }> {
  await assertAdminAccess();
  if (!edits?.length) return { ok: true, count: 0 };

  const projects = readJson("projects.json", ProjectsArray);
  const clusters = readJson("clusters.json", ClustersArray);
  let touchedProjects = false;
  let touchedClusters = false;
  let count = 0;

  for (const e of edits) {
    if (e.kind === "project") {
      const p = projects.find((x) => x.id === e.id);
      if (!p) continue;
      if (e.axes) p.axes = { ...p.axes, ...e.axes } as typeof p.axes;
      if (e.tier !== undefined) {
        if (e.tier === null) delete (p as { tier?: unknown }).tier;
        else p.tier = e.tier as "case-study" | "light" | "art";
      }
      touchedProjects = true;
      count++;
    } else {
      const c = clusters.find((x) => x.id === e.id);
      if (!c) continue;
      if (e.axes) c.axes = { ...c.axes, ...e.axes } as typeof c.axes;
      touchedClusters = true;
      count++;
    }
  }

  let bytes = 0;
  try {
    if (touchedProjects) bytes += writeJson("projects.json", ProjectsArray, projects);
    if (touchedClusters) bytes += writeJson("clusters.json", ClustersArray, clusters);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "write failed" };
  }

  audit({ action: "tags.bulkEdit", bytes, ok: true });
  revalidatePath("/", "layout");
  return { ok: true, count };
}
