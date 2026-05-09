"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  AxesConfigSchema,
  ProjectSchema,
  ClusterSchema,
  type AxesConfig,
  type AxisKey,
  type Project,
  type Cluster,
} from "@/data/types";
import { readJson, writeJson } from "@/lib/admin/storage";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

const ProjectsArray = z.array(ProjectSchema);
const ClustersArray = z.array(ClusterSchema);

export type AxisRename = {
  axis: AxisKey;
  from: string;
  to: string;
};

/**
 * Save the axis config and (optionally) bulk-rename references in
 * projects.json + clusters.json. Renames are applied in a single
 * round of writes; no partial state.
 */
export async function saveAxesAction(
  input: AxesConfig,
  renames: AxisRename[] = [],
): Promise<{ ok: true; updated: number } | { error: string }> {
  await assertAdminAccess();

  const parsed = AxesConfigSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid axes" };
  const config = parsed.data;

  // Validate that each rename's `to` exists in the new config.
  for (const r of renames) {
    if (!config[r.axis].includes(r.to)) {
      return { error: `rename target "${r.to}" missing from new ${r.axis} list` };
    }
  }

  const projects = readJson("projects.json", ProjectsArray);
  const clusters = readJson("clusters.json", ClustersArray);
  let touched = 0;

  function applyRenames(item: Project | Cluster): Project | Cluster {
    const next = { ...item, axes: { ...item.axes } };
    let changed = false;
    for (const r of renames) {
      const cur = next.axes[r.axis];
      if (Array.isArray(cur)) {
        if (cur.includes(r.from)) {
          next.axes = {
            ...next.axes,
            [r.axis]: cur.map((v) => (v === r.from ? r.to : v)),
          };
          changed = true;
        }
      } else if (cur === r.from) {
        next.axes = { ...next.axes, [r.axis]: r.to };
        changed = true;
      }
    }
    if (changed) touched++;
    return next;
  }

  const nextProjects = projects.map(applyRenames) as Project[];
  const nextClusters = clusters.map(applyRenames) as Cluster[];

  const b1 = writeJson("axes.json", AxesConfigSchema, config);
  const b2 = renames.length ? writeJson("projects.json", ProjectsArray, nextProjects) : 0;
  const b3 = renames.length ? writeJson("clusters.json", ClustersArray, nextClusters) : 0;

  audit({ action: "axes.save", bytes: b1 + b2 + b3, ok: true });
  revalidatePath("/", "layout");
  return { ok: true, updated: touched };
}

/**
 * Count how many projects + clusters reference a given axis value, for
 * the "this rename will retag N items" preview in the UI.
 */
export async function countAxisReferencesAction(
  axis: AxisKey,
  value: string,
): Promise<number> {
  await assertAdminAccess();
  const projects = readJson("projects.json", ProjectsArray);
  const clusters = readJson("clusters.json", ClustersArray);
  let n = 0;
  for (const item of [...projects, ...clusters]) {
    const cur = item.axes[axis];
    if (Array.isArray(cur) ? cur.includes(value) : cur === value) n++;
  }
  return n;
}
