// Flat search corpus for the command menu. Derived once at module load from
// the validated content shims (data/projects.ts, data/cv.ts) plus a small
// hand-curated set of pages/actions. Hand-curated recruiter-synonym aliases
// live in content/search-aliases.json and are merged in by id.
//
// This module has no "use client" — it's plain data, importable from both
// server and client components.
//
// ---------------------------------------------------------------------------
// Two fields, two jobs (added after the "sydney" recall bug)
// ---------------------------------------------------------------------------
// `keywords` holds SHORT discrete tokens only — tools, axis values, org names,
// venue, location, year, aliases. cmdk's command-score is a subsequence
// matcher, so it is safe on short strings and catastrophic on paragraphs: a
// 2000-character description matches almost any query as a scattered
// subsequence, at a tiny score, which is exactly the noise the original
// index avoided by indexing nothing but tools.
//
// `text` holds the prose (subtitle + description blocks). It is NEVER fuzzy
// matched — only literal, word-start substring matched (see rankSearch). That
// buys back the recall the old index threw away ("sydney" is literally in
// latent-space's subtitle) without reintroducing subsequence noise.
//
// Ranking bands, so a body hit can never outrank a real title hit:
//   0.80 – 1.00  cmdk fuzzy match on title/OWN keywords (a "mare" → Mare hit)
//   0.62         every meaningful query token prefixes a title/keyword word
//   0.60         same, but the only hit is a curated alias, not the item's
//                own data — findable, never rank-competitive with real tags
//   0.45         the whole query appears verbatim in the prose
//   0.30         every meaningful query token appears in the prose
//   < 0.05 · top dropped as noise (junk subsequence hits score ~0.002–0.02)

import { projects } from "@/data/projects";
import { experience, shows, skills } from "@/data/cv";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";
import aliasesJson from "@/content/search-aliases.json";
import { defaultFilter } from "cmdk";

export type SearchGroup =
  | "projects"
  | "sketches"
  | "experience"
  | "shows"
  | "skills"
  | "pages"
  | "actions";

export type SearchItem = {
  id: string;
  title: string;
  group: SearchGroup;
  href: string;
  meta?: string;
  /**
   * The item's OWN vocabulary — tools, axis values, role/company/place, year.
   * Fed to both the fuzzy scorer (Tier 1) and the word-start scorer (Tier 2).
   */
  keywords: string[];
  /**
   * Hand-curated recruiter-synonym tags from content/search-aliases.json.
   * Word-start matched only (Tier 2, capped at SCORE_TOKEN_KEYWORD_ALIAS) — never
   * fed to the fuzzy scorer. Found via: Synapse's actual technology axis is
   * "Shader/GPU", but NEEEU and FAT32 Loss Protocol (Meta Spark and
   * TouchDesigner projects, no shader-specific tech of their own) also carry
   * a loose "shader" alias for recall. Both used to feed the SAME fuzzy
   * matcher, where an exact short-string alias hit scores close to a title
   * match — so a project tagged "shader" only in passing tied or beat the
   * project actually built on shaders. Aliases now buy recall, not rank.
   */
  aliasKeywords?: string[];
  /**
   * Lowercased prose blob for literal substring matching only. Never fed to
   * the fuzzy scorer. Absent on thin items (pages, actions).
   */
  text?: string;
  /** Open via window.open(noopener) instead of router.push — external links/mailto. */
  external?: boolean;
};

const aliases: Record<string, string[]> = aliasesJson;

function nativeKeywords(base: (string | undefined)[]): string[] {
  return Array.from(new Set(base.filter((v): v is string => Boolean(v && v.trim()))));
}

function aliasesFor(id: string): string[] {
  return aliases[id] ?? [];
}

/** Axis values are `string | string[]` — flatten to a keyword list. */
function axisValues(axes: Record<string, string | readonly string[]>): string[] {
  return Object.values(axes).flatMap((v) => (Array.isArray(v) ? [...v] : [v as string]));
}

/**
 * Place strings ("Sydney, Australia", "Shortwave × Soft Centre, Sydney Opera
 * House") are indexed whole AND split, so both "sydney" and the full venue
 * name score. Fragments under 3 chars are dropped — they only add noise.
 */
function placeTokens(...values: (string | undefined)[]): string[] {
  const out: string[] = [];
  for (const v of values) {
    if (!v?.trim()) continue;
    out.push(v.trim());
    for (const part of v.split(/[,—–·×]|\s+-\s+/)) {
      const t = part.trim();
      if (t.length >= 3) out.push(t);
    }
  }
  return out;
}

const TEXT_CAP = 2000; // per item; keeps the client bundle honest

function proseOf(...parts: (string | undefined)[]): string | undefined {
  const joined = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" · ")
    .toLowerCase();
  return joined ? joined.slice(0, TEXT_CAP) : undefined;
}

function buildIndex(): SearchItem[] {
  const items: SearchItem[] = [];

  // Projects + sketches (clusters), from data/projects.ts
  for (const p of projects) {
    if (p.type === "project") {
      items.push({
        id: p.id,
        title: p.name,
        group: "projects",
        href: `/projects/${p.slug}`,
        meta: `project · ${p.axes.year}`,
        // Short tokens only — tools, axis values, role/company/place, year.
        // Prose lives in `text` and is matched literally, never fuzzily.
        keywords: nativeKeywords([
          ...(p.tools ?? []),
          p.technology,
          ...axisValues(p.axes),
          p.date,
          p.role,
          p.company,
          ...placeTokens(p.location),
        ]),
        aliasKeywords: aliasesFor(p.id),
        text: proseOf(p.subtitle, ...p.description.map((b) => b.text)),
      });
    } else {
      const slug = clusterSlug(p);
      items.push({
        id: p.id,
        title: p.name,
        group: "sketches",
        href: `/sketches/${slug}`,
        meta: `Sketches → ${p.name}`,
        keywords: nativeKeywords([
          ...(p.tools ?? []),
          p.technology,
          ...axisValues(p.axes),
          p.date,
        ]),
        aliasKeywords: aliasesFor(p.id),
        // Cluster item titles are the only prose a cluster has.
        text: proseOf(p.subtitle, ...p.items.map((i) => i.title)),
      });
    }
  }

  // Experience entries, from data/cv.ts. Link to the related project when one
  // exists, otherwise fall back to the CV page itself.
  experience.forEach((role, i) => {
    const id = `experience-${i}`;
    items.push({
      id,
      title: `${role.title} · ${role.org}`,
      group: "experience",
      href: role.projectLink ?? "/cv",
      meta: `CV → Experience → ${role.org}`,
      keywords: nativeKeywords([
        role.org,
        role.title,
        role.date,
        ...placeTokens(role.location),
      ]),
      aliasKeywords: aliasesFor(id),
      text: proseOf(...(role.bullets ?? [])),
    });
  });

  // Exhibitions / screenings / performances, from data/cv.ts. These carry the
  // venue and city facts that exist nowhere else in the index — without them a
  // query like "sydney" has literally nothing to match against.
  shows.forEach((show, i) => {
    const id = `show-${i}`;
    items.push({
      id,
      title: show.title,
      group: "shows",
      href: show.link ?? "/cv",
      meta: `CV → ${show.kind} → ${show.venue}`,
      keywords: nativeKeywords([
        show.kind,
        show.year,
        ...placeTokens(show.venue, show.location),
      ]),
      aliasKeywords: aliasesFor(id),
      text: proseOf(show.title, show.kind, show.venue, show.location, show.year),
    });
  });

  // Skill categories, from data/cv.ts.
  skills.forEach((skill, i) => {
    const id = `skill-${i}`;
    items.push({
      id,
      title: skill.category,
      group: "skills",
      href: "/cv",
      meta: "CV → Skills",
      keywords: nativeKeywords([
        skill.category,
        ...skill.items.split(",").map((s) => s.trim()),
      ]),
      aliasKeywords: aliasesFor(id),
    });
  });

  // Pages
  items.push(
    {
      id: "page-home",
      title: "Home",
      group: "pages",
      href: "/",
      meta: "page",
      keywords: nativeKeywords(["home", "index", "work", "projects"]),
      aliasKeywords: aliasesFor("page-home"),
    },
    {
      id: "page-about",
      title: "About",
      group: "pages",
      href: "/about",
      meta: "page",
      keywords: nativeKeywords(["about", "bio", "statement"]),
      aliasKeywords: aliasesFor("page-about"),
    },
    {
      id: "page-cv",
      title: "CV",
      group: "pages",
      href: "/cv",
      meta: "page",
      keywords: nativeKeywords(["cv", "resume", "curriculum vitae"]),
      aliasKeywords: aliasesFor("page-cv"),
    },
  );

  // Actions — résumé download, contact, socials, theme toggle. Socials pull
  // real URLs from components/Footer.tsx (do not invent).
  items.push(
    {
      id: "action-resume",
      title: "Download résumé",
      group: "actions",
      href: "/Aakarsh_Singh_Resume_090525.pdf",
      meta: "action",
      keywords: nativeKeywords(["resume", "cv", "pdf", "download"]),
      aliasKeywords: aliasesFor("action-resume"),
      external: true,
    },
    {
      id: "action-email",
      title: "Email",
      group: "actions",
      href: "mailto:aakarsh@nyu.edu",
      meta: "action",
      keywords: nativeKeywords(["email", "contact", "mail"]),
      aliasKeywords: aliasesFor("action-email"),
      external: true,
    },
    {
      id: "action-github",
      title: "GitHub",
      group: "actions",
      href: "https://github.com/aacarcrash",
      meta: "action",
      keywords: nativeKeywords(["github", "code", "source"]),
      aliasKeywords: aliasesFor("action-github"),
      external: true,
    },
    {
      id: "action-linkedin",
      title: "LinkedIn",
      group: "actions",
      href: "https://www.linkedin.com/in/aakarshs/",
      meta: "action",
      keywords: nativeKeywords(["linkedin"]),
      aliasKeywords: aliasesFor("action-linkedin"),
      external: true,
    },
    {
      id: "action-arena",
      title: "Are.na",
      group: "actions",
      href: "https://www.are.na/aakarsh-singh-xyyccgscqnu",
      meta: "action",
      keywords: nativeKeywords(["arena", "are.na", "moodboard", "references"]),
      aliasKeywords: aliasesFor("action-arena"),
      external: true,
    },
    {
      id: "action-instagram",
      title: "Instagram",
      group: "actions",
      href: "https://www.instagram.com/aacarcrash/",
      meta: "action",
      keywords: nativeKeywords(["instagram", "insta", "ig", "social"]),
      aliasKeywords: aliasesFor("action-instagram"),
      external: true,
    },
    {
      id: "action-theme",
      title: "Toggle theme",
      group: "actions",
      href: "#theme",
      meta: "action",
      keywords: nativeKeywords(["theme", "dark mode", "light mode", "dark", "light"]),
      aliasKeywords: aliasesFor("action-theme"),
    },
  );

  return items;
}

export const searchIndex: SearchItem[] = buildIndex();

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

// Function words and filler verbs a user types around the real query
// ("shader WORK", "tools FOR organizing images"). Dropping them lets the
// token tiers fire on the words that carry meaning. Kept deliberately small —
// every entry here is a word that can never usefully discriminate 62 items.
const STOPWORDS = new Set([
  "a", "an", "and", "the", "of", "for", "to", "in", "on", "at", "by", "with",
  "from", "into", "about", "is", "are", "was", "were", "be", "that", "this",
  "it", "its", "my", "his", "her", "their", "work", "works", "stuff", "thing",
  "things", "show", "me", "some", "any", "all",
]);

const WORD_RE = /[a-z0-9]+/g;

function meaningfulTokens(query: string): string[] {
  const raw = query.toLowerCase().match(WORD_RE) ?? [];
  const kept = raw.filter((t) => t.length >= 2 && !STOPWORDS.has(t));
  // If the query is nothing but stopwords ("the work"), fall back to the raw
  // tokens rather than matching everything.
  return kept.length > 0 ? kept : raw;
}

/** Word-start occurrence — "art" hits "art house", never "smart". */
function hasWordStart(haystack: string, token: string): boolean {
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(token, from);
    if (idx === -1) return false;
    if (idx === 0 || !/[a-z0-9]/.test(haystack[idx - 1])) return true;
    from = idx + 1;
  }
}

/**
 * Plural/singular-tolerant word-start match ("shaders" query hitting a
 * "shader" keyword and vice versa). Found via: Synapse is tagged "shader"
 * (singular, in both its keyword axis and its search-aliases entry) but
 * nothing in its index has the plural — a "shaders" query missed it
 * completely across every tier, while "shader" worked fine. Length-gated to
 * avoid nonsense on short words ("as" → "a").
 */
function hasWordStartStem(haystack: string, token: string): boolean {
  if (hasWordStart(haystack, token)) return true;
  if (token.length < 4) return false;
  const variant = token.endsWith("s") ? token.slice(0, -1) : `${token}s`;
  return hasWordStart(haystack, variant);
}

const SCORE_TOKEN_TITLE = 0.7;
/**
 * Two keyword tiers, not one. A stem match against the item's OWN keywords
 * (tools/axis values — data the item is actually tagged with) outranks the
 * same stem match landing only in aliasKeywords (a loose curated synonym).
 * Otherwise a plural query defeats Tier 1's cmdk fuzzy pass (cmdk can't
 * subsequence-match "shaders" against a keyword that literally ends
 * "shader/gpu" — there's no trailing "s" to find) and both tiers collapse
 * to the same score, leaving Synapse tied with — or behind — NEEEU/FAT32
 * Loss Protocol, which only mention "shader" in passing via alias.
 */
const SCORE_TOKEN_KEYWORD_NATIVE = 0.62;
const SCORE_TOKEN_KEYWORD_ALIAS = 0.6;
const SCORE_PROSE_PHRASE = 0.45;
const SCORE_PROSE_TOKENS = 0.3;
/**
 * cmdk's scorer is a subsequence matcher, so it returns a small non-zero
 * score for almost any query against almost any string — measured, real hits
 * land at 0.79–0.99 and pure coincidence lands at 0.02–0.15. Below this the
 * hit is noise the reader cannot explain, and with the token/prose tiers below
 * a genuine weak match now scores ≥0.30 anyway.
 */
const FUZZY_MIN = 0.2;
/** Anything scoring below this fraction of the best hit is subsequence noise. */
const NOISE_RATIO = 0.05;

export type ScoredItem = { item: SearchItem; score: number };

function scoreItem(item: SearchItem, query: string, tokens: string[]): number {
  // Tier 1 — cmdk's own scorer over title + the item's OWN keywords.
  // Deliberately excludes aliasKeywords: a hand-curated synonym tag ("shader"
  // pasted onto NEEEU and FAT32 Loss Protocol for recall) scores almost as
  // high as a title match under cmdk's algorithm on an exact short string, so
  // feeding aliases in here let a passing-mention project tie or beat the
  // project actually built on shaders (Synapse, tagged "Shader/GPU" as its
  // real technology axis). Aliases still match below, just capped at
  // SCORE_TOKEN_KEYWORD_ALIAS instead of riding the fuzzy scorer to the top.
  const fuzzy = defaultFilter(item.title, query, item.keywords);
  let score = fuzzy >= FUZZY_MIN ? fuzzy : 0;

  // Tier 2 — every meaningful token prefixes a word in the title (stronger),
  // in a keyword, or in an alias. Catches "shader work" → Shaders, which
  // whole-query fuzzy scores at 0 because "work" appears nowhere. Stem-aware
  // so a plural query ("shaders") still hits a singular tag ("shader") —
  // Synapse is tagged "shader" everywhere and used to miss "shaders" queries
  // entirely.
  if (score < SCORE_TOKEN_TITLE) {
    const title = item.title.toLowerCase();
    if (tokens.every((t) => hasWordStartStem(title, t))) {
      score = Math.max(score, SCORE_TOKEN_TITLE);
    } else if (score < SCORE_TOKEN_KEYWORD_NATIVE) {
      const nativeHaystack = item.keywords.join(" ").toLowerCase();
      if (tokens.every((t) => hasWordStartStem(nativeHaystack, t))) {
        score = Math.max(score, SCORE_TOKEN_KEYWORD_NATIVE);
      } else if (score < SCORE_TOKEN_KEYWORD_ALIAS && item.aliasKeywords?.length) {
        const aliasHaystack = item.aliasKeywords.join(" ").toLowerCase();
        if (tokens.every((t) => hasWordStartStem(aliasHaystack, t))) {
          score = Math.max(score, SCORE_TOKEN_KEYWORD_ALIAS);
        }
      }
    }
  }

  // Tiers 3 & 4 — literal matching against prose. Never fuzzy.
  const text = item.text;
  if (text && score < SCORE_PROSE_PHRASE) {
    const phrase = query.trim().toLowerCase();
    if (phrase.length >= 3 && hasWordStart(text, phrase)) {
      score = Math.max(score, SCORE_PROSE_PHRASE);
    } else if (tokens.every((t) => hasWordStartStem(text, t))) {
      score = Math.max(score, SCORE_PROSE_TOKENS);
    }
  }

  return score;
}

/**
 * Rank the whole index for a query. Single source of truth — the command
 * palette and scripts/search-regression.ts both call this, so the regression
 * table tests what users actually get.
 */
export function rankSearch(query: string): ScoredItem[] {
  const q = query.trim();
  if (!q) return [];
  const tokens = meaningfulTokens(q);
  const scored: ScoredItem[] = [];
  for (const item of searchIndex) {
    const score = scoreItem(item, q, tokens);
    if (score > 0) scored.push({ item, score });
  }
  if (scored.length === 0) return [];
  scored.sort((a, b) => b.score - a.score);
  // Relative noise cutoff: a real hit scores ≥0.3, junk subsequence hits land
  // around 0.002–0.02. Without this, "sydney" still lists Callback under the
  // right answer for no reason a reader could explain.
  const floor = scored[0].score * NOISE_RATIO;
  return scored.filter((s) => s.score >= floor);
}

/**
 * Embedding corpus for one item — used by scripts/embed-search-index.ts.
 * Kept here so the corpus recipe lives next to the index it describes.
 * `extra` carries server-only text (case-study bodies) that must not ship
 * to the client bundle.
 */
export function corpusText(item: SearchItem, extra?: string): string {
  return [
    item.title,
    item.meta,
    item.keywords.join(", "),
    item.aliasKeywords?.join(", "),
    item.text,
    extra,
  ]
    .filter(Boolean)
    .join(". ");
}
