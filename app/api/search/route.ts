// Semantic search: embeds the query (Cloudflare Workers AI, same bge-m3 model
// as the build-time corpus pass) and does cosine over the precomputed vectors
// in content/search-vectors.json. No database — 31-item corpus lives in
// memory. Guards borrowed from Mare's retrieval stack: similarity floor (junk
// never renders), gap cutoff (stop where the score curve drops), plus a
// per-IP rate limit, 200-char query cap and a small LRU so spam mostly hits
// cache. Fails closed: any error → 503 and the client stays keyword-only.

import { NextRequest, NextResponse } from "next/server";
import vectorsFile from "@/content/search-vectors.json";

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const MODEL = "@cf/baai/bge-m3";

const SIM_FLOOR = 0.4; // below this = no meaningful match (Mare's floor)
const GAP_RATIO = 0.15; // cut where the sorted score curve drops ≥15%
const MAX_RESULTS = 5;
const MAX_QUERY_CHARS = 200;

const vectors: Record<string, number[]> =
  (vectorsFile as { vectors?: Record<string, number[]> }).vectors ?? {};
const ids = Object.keys(vectors);

function cosine(a: number[], b: number[]): number {
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

// -- tiny LRU (query → results), 200 entries --
const cache = new Map<string, { id: string; score: number }[]>();
function cacheGet(k: string) {
  const v = cache.get(k);
  if (v) {
    cache.delete(k);
    cache.set(k, v); // refresh recency
  }
  return v;
}
function cacheSet(k: string, v: { id: string; score: number }[]) {
  if (cache.size >= 200) cache.delete(cache.keys().next().value!);
  cache.set(k, v);
}

// -- per-IP token bucket: 20 requests / 10s window --
const buckets = new Map<string, { n: number; reset: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { n: 1, reset: now + 10_000 });
    return false;
  }
  b.n += 1;
  if (buckets.size > 5000) buckets.clear(); // memory backstop
  return b.n > 20;
}

export async function POST(req: NextRequest) {
  if (!ACCOUNT || !TOKEN || ids.length === 0) {
    return NextResponse.json({ error: "semantic search unavailable" }, { status: 503 });
  }
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  let q: unknown;
  try {
    ({ q } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  if (typeof q !== "string") {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const query = q.trim().slice(0, MAX_QUERY_CHARS).toLowerCase();
  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const cached = cacheGet(query);
  if (cached) {
    return NextResponse.json(
      { results: cached },
      { headers: { "Cache-Control": "public, s-maxage=86400" } },
    );
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: [query] }),
      signal: AbortSignal.timeout(4000),
    },
  ).catch(() => null);
  if (!res?.ok) {
    return NextResponse.json({ error: "embedding failed" }, { status: 503 });
  }
  const json = (await res.json()) as { result: { data: number[][] } };
  const qVec = json.result?.data?.[0];
  if (!qVec) {
    return NextResponse.json({ error: "embedding failed" }, { status: 503 });
  }

  const scored = ids
    .map((id) => ({ id, score: cosine(qVec, vectors[id]) }))
    .filter((r) => r.score >= SIM_FLOOR)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);

  // Gap cutoff: stop where the curve visibly drops — 2 strong results beat
  // 2 strong + 3 mediocre (Mare's adaptive cutoff, simplified for n≤5).
  let cut = scored.length;
  for (let i = 1; i < scored.length; i++) {
    if ((scored[i - 1].score - scored[i].score) / scored[i - 1].score >= GAP_RATIO) {
      cut = i;
      break;
    }
  }
  const results = scored.slice(0, Math.max(cut, Math.min(2, scored.length))).map((r) => ({
    id: r.id,
    score: Number(r.score.toFixed(2)),
  }));

  cacheSet(query, results);
  return NextResponse.json(
    { results },
    { headers: { "Cache-Control": "public, s-maxage=86400" } },
  );
}
