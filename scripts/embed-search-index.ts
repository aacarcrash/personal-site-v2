// Build-time embedding of the search corpus → content/search-vectors.json.
// Run: npx tsx scripts/embed-search-index.ts  (also wired as prebuild).
// Uses Cloudflare Workers AI (bge-m3) — the SAME model the /api/search route
// uses for queries; the two must never diverge or cosine scores are garbage.
// Skips gracefully (exit 0, vectors file untouched) when env keys are absent
// so builds never break — the semantic tier just stays off.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { searchIndex } from "../lib/searchIndex";
import { projects } from "../data/projects";

// Subtitles carry the semantic meat ("film of childhood memory pushed
// through video models") — titles + tool keywords alone rank generic pages
// above the obviously-right project for vibe queries.
const subtitleById = new Map<string, string>();
for (const p of projects) {
  const slug = (p as { slug?: string }).slug;
  const subtitle = (p as { subtitle?: string }).subtitle;
  if (slug && subtitle) subtitleById.set(slug, subtitle);
}

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/baai/bge-m3";
const OUT = join(process.cwd(), "content", "search-vectors.json"); // run from repo root

if (!ACCOUNT || !TOKEN) {
  console.log("[embed] CLOUDFLARE_* env not set — skipping (semantic tier disabled)");
  process.exit(0);
}

// Actions (buttons) and pages (About/Home/CV) are excluded — semantic
// matches should surface CONTENT; thin embeddings like "LinkedIn. social"
// or "About" otherwise score mid on every vague query and crowd out the
// right project. Keyword tier still covers actions and pages fully.
const items = searchIndex.filter(
  (item) => item.group !== "actions" && item.group !== "pages",
);

// One embedding text per item: title + subtitle + meta + keywords. Same
// recipe the query side doesn't need to know about — only the model must match.
const texts = items.map((item) =>
  [item.title, subtitleById.get(item.id), item.meta, ...(item.keywords ?? [])]
    .filter(Boolean)
    .join(". "),
);

async function main() {
const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: texts }),
  },
);
if (!res.ok) {
  console.error(`[embed] Cloudflare API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const json = (await res.json()) as { result: { data: number[][] } };
const vectors = json.result.data;
if (!Array.isArray(vectors) || vectors.length !== items.length) {
  console.error(`[embed] expected ${items.length} vectors, got ${vectors?.length}`);
  process.exit(1);
}

const out: Record<string, number[]> = {};
items.forEach((item, i) => {
  // Round to 6dp — halves file size, cosine impact is far below the 0.40 floor.
  out[item.id] = vectors[i].map((v) => Number(v.toFixed(6)));
});
writeFileSync(OUT, JSON.stringify({ model: MODEL, dims: vectors[0].length, vectors: out }));
console.log(`[embed] wrote ${items.length} vectors (${vectors[0].length}d) → content/search-vectors.json`);
}

main();
