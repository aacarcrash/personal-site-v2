"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  ProjectSchema,
  ClusterSchema,
  type Project,
  type Cluster,
} from "@/data/types";
import { readJson, writeJson } from "@/lib/admin/storage";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

const ProjectsArray = z.array(ProjectSchema);
const ClustersArray = z.array(ClusterSchema);

const PROJECTS = "projects.json";
const CLUSTERS = "clusters.json";

function revalidateAll() {
  revalidatePath("/", "layout");
}

// ---------- Projects ----------

export async function saveProjectAction(input: Project): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid project" };
  const project = parsed.data;

  const projects = readJson(PROJECTS, ProjectsArray);
  const idx = projects.findIndex((p) => p.id === project.id);
  if (idx < 0) return { error: `no project with id ${project.id}` };
  projects[idx] = project;

  const bytes = writeJson(PROJECTS, ProjectsArray, projects);
  audit({ action: "project.save", target: project.slug, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

export async function createProjectAction(input: Project): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = ProjectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid project" };
  const project = parsed.data;

  const projects = readJson(PROJECTS, ProjectsArray);
  if (projects.some((p) => p.id === project.id)) return { error: `id ${project.id} already exists` };
  if (projects.some((p) => p.slug === project.slug)) return { error: `slug ${project.slug} already exists` };
  projects.unshift(project);

  const bytes = writeJson(PROJECTS, ProjectsArray, projects);
  audit({ action: "project.create", target: project.slug, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

export async function deleteProjectAction(id: string): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const projects = readJson(PROJECTS, ProjectsArray);
  const next = projects.filter((p) => p.id !== id);
  if (next.length === projects.length) return { error: "not found" };
  const bytes = writeJson(PROJECTS, ProjectsArray, next);
  audit({ action: "project.delete", target: id, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

export async function reorderProjectsAction(ids: string[]): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const projects = readJson(PROJECTS, ProjectsArray);
  const map = new Map(projects.map((p) => [p.id, p]));
  const next: Project[] = [];
  for (const id of ids) {
    const p = map.get(id);
    if (!p) return { error: `unknown id ${id}` };
    next.push(p);
    map.delete(id);
  }
  // Append any left over (defensive — shouldn't happen if UI sends complete list).
  for (const p of map.values()) next.push(p);
  const bytes = writeJson(PROJECTS, ProjectsArray, next);
  audit({ action: "project.reorder", bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

// ---------- Clusters ----------

export async function saveClusterAction(input: Cluster): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = ClusterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid cluster" };
  const cluster = parsed.data;

  const clusters = readJson(CLUSTERS, ClustersArray);
  const idx = clusters.findIndex((c) => c.id === cluster.id);
  if (idx < 0) return { error: `no cluster with id ${cluster.id}` };
  clusters[idx] = cluster;

  const bytes = writeJson(CLUSTERS, ClustersArray, clusters);
  audit({ action: "cluster.save", target: cluster.id, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

export async function createClusterAction(input: Cluster): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = ClusterSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid cluster" };
  const cluster = parsed.data;
  const clusters = readJson(CLUSTERS, ClustersArray);
  if (clusters.some((c) => c.id === cluster.id)) return { error: `id ${cluster.id} already exists` };
  clusters.push(cluster);
  const bytes = writeJson(CLUSTERS, ClustersArray, clusters);
  audit({ action: "cluster.create", target: cluster.id, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}

export async function deleteClusterAction(id: string): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const clusters = readJson(CLUSTERS, ClustersArray);
  const next = clusters.filter((c) => c.id !== id);
  if (next.length === clusters.length) return { error: "not found" };
  const bytes = writeJson(CLUSTERS, ClustersArray, next);
  audit({ action: "cluster.delete", target: id, bytes, ok: true });
  revalidateAll();
  return { ok: true };
}
