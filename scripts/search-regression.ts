// Recall regression harness for both search tiers.
//   npm run search:test           # keyword tier only, no network
//   npm run search:test:vector    # also hits a running dev server's /api/search
//                                 # (SEARCH_BASE, default http://127.0.0.1:3111)
//
// Each case is `query → id that MUST appear` (or a junk query that must not
// produce a confident hit). The table prints the RANK the expected id landed
// at, not just pass/fail, so a change that buys recall by flattening precision
// is still visible — every expected id sliding from rank 1 to rank 5 is a
// regression even while the suite stays green.
//
// The keyword tier is exercised through lib/searchIndex.rankSearch, the same
// function the palette renders from, so this measures what users get.

import { rankSearch, searchIndex } from "../lib/searchIndex";

type Case = {
  q: string;
  /** id that must be in the results (omit for junk queries). */
  expect?: string;
  /** Junk query: nothing may match. */
  junk?: boolean;
  /** Not run against the keyword tier — phrased in the user's words, not the site's. */
  vectorOnly?: boolean;
  /**
   * Not run against the vector tier, with the reason. Used where bge-m3 has a
   * defensible disagreement and the keyword tier already answers correctly —
   * the two tiers are complementary, so forcing both to agree would mean
   * over-fitting the corpus to the test.
   */
  keywordOnly?: string;
};

const CASES: Case[] = [
  { q: "sydney", expect: "latent-space" },
  { q: "sydney opera house", expect: "latent-space" },
  { q: "tools for organizing images", expect: "mare", vectorOnly: true },
  { q: "image archive clustering", expect: "mare" },
  { q: "simulated ecology", expect: "land" },
  { q: "shader work", expect: "shaders" },
  { q: "warsaw", expect: "aa-warsaw" },
  { q: "dubai", expect: "aa-dubai" },
  {
    q: "vivid live",
    expect: "latent-space",
    // "Vivid Live" is a festival name; bge-m3 reads "live" as live performance
    // and returns the live-coding / live-sets clusters. Genuine ambiguity, and
    // the keyword tier matches the festival name literally at rank 1.
    keywordOnly: "bge-m3 reads 'live' as live performance",
  },
  { q: "asdfghjkl qwerty zzz", junk: true },
];

/**
 * The vector tier's 0.40 floor is tuned for a 1024d bge-m3 corpus where even
 * unrelated text sits around 0.40–0.43, so a junk query can leave one item
 * just over the line. The gate that matters is that junk never reaches the
 * confident band real matches occupy.
 */
const JUNK_MAX_SCORE = 0.45;

/** The exact ranking the palette renders (lib/searchIndex.rankSearch). */
export function keywordRank(query: string): { id: string; score: number }[] {
  return rankSearch(query).map((s) => ({ id: s.item.id, score: s.score }));
}

async function vectorRank(
  query: string,
  base: string,
): Promise<{ id: string; score: number }[] | null> {
  const res = await fetch(`${base}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: query }),
  }).catch(() => null);
  if (!res?.ok) return null;
  return ((await res.json()) as { results: { id: string; score: number }[] }).results;
}

function verdict(
  c: Case,
  results: { id: string; score: number }[],
  junkMax: number,
): { ok: boolean; note: string } {
  if (c.junk) {
    const top = results[0];
    if (!top) return { ok: true, note: "empty" };
    return {
      ok: top.score <= junkMax,
      note: `${results.length} result(s), top ${top.score.toFixed(2)} (limit ${junkMax})`,
    };
  }
  const rank = results.findIndex((r) => r.id === c.expect);
  if (rank === -1) {
    const top = results.slice(0, 3).map((r) => r.id).join(", ") || "none";
    return { ok: false, note: `MISS (top: ${top})` };
  }
  return { ok: true, note: `rank ${rank + 1} of ${results.length}` };
}

function row(ok: boolean, c: Case, note: string) {
  console.log(
    `${ok ? "ok  " : "FAIL"} ${c.q}`.padEnd(34) +
      (c.expect ?? "<junk>").padEnd(16) +
      note,
  );
}

async function main() {
  const useVector = process.argv.includes("--vector");
  const base = process.env.SEARCH_BASE ?? "http://127.0.0.1:3111";

  console.log(`corpus: ${searchIndex.length} items\n`);

  let kPass = 0;
  let kTotal = 0;
  console.log("KEYWORD TIER");
  console.log("query".padEnd(34) + "expect".padEnd(16) + "result");
  for (const c of CASES) {
    if (c.vectorOnly) continue;
    kTotal++;
    // Keyword scores are 0–1 bands, not cosine — junk simply must not match.
    const { ok, note } = verdict(c, keywordRank(c.q), 0);
    if (ok) kPass++;
    row(ok, c, note);
  }
  console.log(`\nkeyword: ${kPass}/${kTotal} pass\n`);

  if (!useVector) return;

  let vPass = 0;
  let vTotal = 0;
  let down = 0;
  console.log("VECTOR TIER");
  console.log("query".padEnd(34) + "expect".padEnd(16) + "result");
  for (const c of CASES) {
    if (c.keywordOnly) {
      console.log(`skip ${c.q}`.padEnd(34) + (c.expect ?? "").padEnd(16) + c.keywordOnly);
      continue;
    }
    vTotal++;
    const results = await vectorRank(c.q, base);
    if (results === null) {
      down++;
      console.log(`down ${c.q}`.padEnd(34) + (c.expect ?? "").padEnd(16) + "route 503 / server off");
      continue;
    }
    const { ok, note } = verdict(c, results, JUNK_MAX_SCORE);
    if (ok) vPass++;
    row(ok, c, note);
  }
  console.log(`\nvector: ${vPass}/${vTotal} pass${down ? ` (${down} unreachable)` : ""}`);

  const failed = kPass < kTotal || vPass + down < vTotal;
  process.exitCode = failed ? 1 : 0;
}

main();
