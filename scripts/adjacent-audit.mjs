// Diagnostic, not shipped code. Answers one question: if "Adjacent Work"
// (project page footer, nearest-by-embedding) shipped as-is, would the
// pairings be defensible or embarrassing?
//
// Run:  node scripts/adjacent-audit.mjs [topN]
// Re-run after ANY change to the embedding corpus — the whole point is to
// judge the vectors that would actually ship.
//
// Prints, per project, its nearest neighbours by cosine, so a human can
// scan for pairings that are thematically plausible but factually wrong.
// It deliberately does NOT auto-approve anything: the failure mode here is
// a confident wrong link on a page that presents it as a claim about the work.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const TOP_N = Number(process.argv[2] ?? 3);
const root = process.cwd();

const { model, vectors } = JSON.parse(
  readFileSync(join(root, "content", "search-vectors.json"), "utf8"),
);

// Only real projects are eligible neighbours. CV experience rows, skills and
// cluster pages live in the same vector file but are not "adjacent work" —
// linking a project to "skill-4" from its footer would be nonsense.
const projectsFile = JSON.parse(
  readFileSync(join(root, "content", "projects.json"), "utf8"),
);
const projectList = Array.isArray(projectsFile)
  ? projectsFile
  : (projectsFile.projects ?? []);
const nameBySlug = new Map(
  projectList.filter((p) => p.slug).map((p) => [p.slug, p.name ?? p.slug]),
);
const eligible = Object.keys(vectors).filter((id) => nameBySlug.has(id));

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

console.log(`model: ${model}`);
console.log(`projects with vectors: ${eligible.length} / ${nameBySlug.size}`);
console.log(`missing vectors: ${[...nameBySlug.keys()].filter((s) => !vectors[s]).join(", ") || "none"}`);
console.log("");

const rows = [];
for (const id of eligible) {
  const near = eligible
    .filter((o) => o !== id)
    .map((o) => ({ id: o, score: cosine(vectors[id], vectors[o]) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
  rows.push({ id, near });
  const list = near
    .map((n) => `${nameBySlug.get(n.id)} (${n.score.toFixed(2)})`)
    .join("  ·  ");
  console.log(`${nameBySlug.get(id)}\n   → ${list}\n`);
}

// Two cheap signals a human can act on without reading all 31 lists.
const all = rows.flatMap((r) => r.near.map((n) => n.score));
all.sort((a, b) => a - b);
const median = all[Math.floor(all.length / 2)];
const weak = rows.filter((r) => r.near[0].score < 0.5);

console.log("─".repeat(60));
console.log(`median neighbour similarity: ${median.toFixed(3)}`);
console.log(
  `projects whose BEST neighbour is under 0.50: ${weak.length}/${rows.length}`,
);
if (weak.length) {
  console.log(
    `  ${weak.map((r) => `${nameBySlug.get(r.id)} (${r.near[0].score.toFixed(2)})`).join(", ")}`,
  );
}
console.log(
  "\nA high median with a long weak tail is the dangerous shape: most pages",
);
console.log(
  "look fine while a handful assert a relationship that does not exist.",
);
