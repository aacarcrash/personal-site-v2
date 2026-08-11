// Build-time embedding of the search corpus → content/search-vectors.json.
// Run: npx tsx scripts/embed-search-index.ts  (also wired as prebuild).
// Uses Cloudflare Workers AI (bge-m3) — the SAME model the /api/search route
// uses for queries; the two must never diverge or cosine scores are garbage.
// Skips gracefully (exit 0, vectors file untouched) when env keys are absent
// so builds never break — the semantic tier just stays off.
//
// Corpus recipe (widened after "tools for organizing images" failed to return
// Mare): title + meta + keywords + prose, where prose is the subtitle and the
// description blocks (lib/searchIndex builds those into SearchItem.text) plus
// the case-study decision titles and bodies, which are server-only and never
// ship to the client bundle. A 20-word embedding cannot represent a project;
// the old recipe stopped at title + subtitle + keywords, so a query phrased in
// the user's words rather than the site's words had nothing to hit.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { corpusText, searchIndex } from "../lib/searchIndex";
import { projects } from "../data/projects";

// Server-only extra prose per project: the case study's decision titles and
// bodies. This is where a project explains what it actually DOES in plain
// language ("collapses 123 near-duplicate frames down to 7"), which is exactly
// the vocabulary vague queries use.
const CASE_STUDY_CAP = 3000;
const extraById = new Map<string, string>();
for (const p of projects) {
  if (p.type !== "project") continue;
  const cs = p.caseStudy;
  if (!cs) continue;
  const parts: string[] = [];
  if (cs.heroCaption) parts.push(cs.heroCaption);
  for (const d of cs.decisions) {
    parts.push(d.title);
    parts.push(d.body);
  }
  const joined = parts.filter(Boolean).join(" ").slice(0, CASE_STUDY_CAP);
  if (joined) extraById.set(p.id, joined);
}

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/baai/bge-m3";
const OUT = join(process.cwd(), "content", "search-vectors.json"); // run from repo root
const BATCH = 25; // Workers AI caps the per-request text array; batch to stay under it

if (!ACCOUNT || !TOKEN) {
  console.log("[embed] CLOUDFLARE_* env not set — skipping (semantic tier disabled)");
  process.exit(0);
}

// Actions (buttons), pages (About/Home/CV) and shows are excluded — semantic
// matches should surface CONTENT; thin embeddings like "LinkedIn. social"
// or "About" otherwise score mid on every vague query and crowd out the
// right project.
//
// Shows joined that list when they were added to the index: a show is fifteen
// words of venue and city, so every place-shaped query ("dubai") pulled five
// near-identical show records ahead of the actual project. They are exact
// factual records and the keyword tier matches them exactly — venue, city and
// year are all indexed keywords now — so they lose nothing by sitting out the
// fuzzy tier.
const EXCLUDED_GROUPS = new Set(["actions", "pages", "shows"]);
const items = searchIndex.filter((item) => !EXCLUDED_GROUPS.has(item.group));

const texts = items.map((item) => corpusText(item, extraById.get(item.id)));

async function embed(batch: string[]): Promise<number[][]> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: batch }),
    },
  );
  if (!res.ok) {
    console.error(`[embed] Cloudflare API ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const json = (await res.json()) as { result: { data: number[][] } };
  const data = json.result?.data;
  if (!Array.isArray(data) || data.length !== batch.length) {
    console.error(`[embed] expected ${batch.length} vectors, got ${data?.length}`);
    process.exit(1);
  }
  return data;
}

async function main() {
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    vectors.push(...(await embed(texts.slice(i, i + BATCH))));
  }

  const out: Record<string, number[]> = {};
  items.forEach((item, i) => {
    // Round to 6dp — halves file size, cosine impact is far below the 0.40 floor.
    out[item.id] = vectors[i].map((v) => Number(v.toFixed(6)));
  });
  writeFileSync(OUT, JSON.stringify({ model: MODEL, dims: vectors[0].length, vectors: out }));
  const avg = Math.round(texts.reduce((s, t) => s + t.length, 0) / texts.length);
  console.log(
    `[embed] wrote ${items.length} vectors (${vectors[0].length}d, avg ${avg} chars/item) → content/search-vectors.json`,
  );
}

main();
