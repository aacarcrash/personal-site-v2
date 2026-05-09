/**
 * One-shot migration: imports the existing TS source-of-truth modules
 * (data/projects.ts, data/cv.ts, data/featured.ts, data/types.ts) and
 * writes their data to content/*.json.
 *
 * After this runs, the .ts files become thin Zod-validated shims that
 * import the JSON. The admin panel writes back to these JSON files.
 *
 * Run once with:  npx tsx scripts/migrate-to-json.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

import {
  YEARS,
  MEDIUMS,
  CONCERNS,
  TECHNOLOGIES,
  CONTEXTS,
} from "../data/types";
import { projects as allItems } from "../data/projects";
import type { Project, Cluster } from "../data/types";

const projects = allItems.filter(
  (i): i is Project => i.type === "project",
);
const clusters = allItems.filter(
  (i): i is Cluster => i.type === "cluster",
);
import {
  experience,
  shows,
  residencies,
  teaching,
  press,
  education,
  awards,
  skills,
} from "../data/cv";
import { featuredSlugs, featuredColumns } from "../data/featured";

const root = resolve(__dirname, "..");
const contentDir = resolve(root, "content");

function writeJson(relPath: string, data: unknown) {
  const full = resolve(contentDir, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("wrote", relPath);
}

writeJson("axes.json", {
  year: [...YEARS],
  medium: [...MEDIUMS],
  concern: [...CONCERNS],
  technology: [...TECHNOLOGIES],
  context: [...CONTEXTS],
});

writeJson("projects.json", projects);
writeJson("clusters.json", clusters);
writeJson("featured.json", { slugs: featuredSlugs, columns: featuredColumns });
writeJson("cv.json", {
  experience,
  shows,
  residencies,
  teaching,
  press,
  education,
  awards,
  skills,
});

console.log("\nmigration complete.");
