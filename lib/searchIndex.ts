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
//   0.80 – 1.00  cmdk fuzzy match on title/keywords (a "mare" → Mare hit)
//   0.60         every meaningful query token prefixes a title/keyword word
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
  keywords: string[];
  /**
   * Lowercased prose blob for literal substring matching only. Never fed to
   * the fuzzy scorer. Absent on thin items (pages, actions).
   */
  text?: string;
  /** Open via window.open(noopener) instead of router.push — external links/mailto. */
  external?: boolean;
};

const aliases: Record<string, string[]> = aliasesJson;

function withAliases(id: string, base: (string | undefined)[]): string[] {
  const clean = base.filter((v): v is string => Boolean(v && v.trim()));
  const extra = aliases[id] ?? [];
  return Array.from(new Set([...clean, ...extra]));
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
        keywords: withAliases(p.id, [
          ...(p.tools ?? []),
          p.technology,
          ...axisValues(p.axes),
          p.date,
          p.role,
          p.company,
          ...placeTokens(p.location),
        ]),
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
        keywords: withAliases(p.id, [
          ...(p.tools ?? []),
          p.technology,
          ...axisValues(p.axes),
          p.date,
        ]),
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
      keywords: withAliases(id, [
        role.org,
        role.title,
        role.date,
        ...placeTokens(role.location),
      ]),
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
      keywords: withAliases(id, [
        show.kind,
        show.year,
        ...placeTokens(show.venue, show.location),
      ]),
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
      keywords: withAliases(id, [
        skill.category,
        ...skill.items.split(",").map((s) => s.trim()),
      ]),
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
      keywords: withAliases("page-home", ["home", "index", "work", "projects"]),
    },
    {
      id: "page-about",
      title: "About",
      group: "pages",
      href: "/about",
      meta: "page",
      keywords: withAliases("page-about", ["about", "bio", "statement"]),
    },
    {
      id: "page-cv",
      title: "CV",
      group: "pages",
      href: "/cv",
      meta: "page",
      keywords: withAliases("page-cv", ["cv", "resume", "curriculum vitae"]),
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
      keywords: withAliases("action-resume", ["resume", "cv", "pdf", "download"]),
      external: true,
    },
    {
      id: "action-email",
      title: "Email",
      group: "actions",
      href: "mailto:aakarsh@nyu.edu",
      meta: "action",
      keywords: withAliases("action-email", ["email", "contact", "mail"]),
      external: true,
    },
    {
      id: "action-github",
      title: "GitHub",
      group: "actions",
      href: "https://github.com/aacarcrash",
      meta: "action",
      keywords: withAliases("action-github", ["github", "code", "source"]),
      external: true,
    },
    {
      id: "action-linkedin",
      title: "LinkedIn",
      group: "actions",
      href: "https://www.linkedin.com/in/aakarshs/",
      meta: "action",
      keywords: withAliases("action-linkedin", ["linkedin"]),
      external: true,
    },
    {
      id: "action-arena",
      title: "Are.na",
      group: "actions",
      href: "https://www.are.na/aakarsh-singh-xyyccgscqnu",
      meta: "action",
      keywords: withAliases("action-arena", ["arena", "are.na", "moodboard", "references"]),
      external: true,
    },
    {
      id: "action-instagram",
      title: "Instagram",
      group: "actions",
      href: "https://www.instagram.com/aacarcrash/",
      meta: "action",
      keywords: withAliases("action-instagram", ["instagram", "insta", "ig", "social"]),
      external: true,
    },
    {
      id: "action-theme",
      title: "Toggle theme",
      group: "actions",
      href: "#theme",
      meta: "action",
      keywords: withAliases("action-theme", ["theme", "dark mode", "light mode", "dark", "light"]),
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

const SCORE_TOKEN_TITLE = 0.7;
const SCORE_TOKEN_KEYWORD = 0.6;
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
  // Tier 1 — cmdk's own scorer over title + short keywords.
  const fuzzy = defaultFilter(item.title, query, item.keywords);
  let score = fuzzy >= FUZZY_MIN ? fuzzy : 0;

  // Tier 2 — every meaningful token prefixes a word in the title (stronger)
  // or in a keyword. Catches "shader work" → Shaders, which whole-query fuzzy
  // scores at 0 because "work" appears nowhere.
  if (score < SCORE_TOKEN_TITLE) {
    const title = item.title.toLowerCase();
    if (tokens.every((t) => hasWordStart(title, t))) {
      score = Math.max(score, SCORE_TOKEN_TITLE);
    } else if (score < SCORE_TOKEN_KEYWORD) {
      const haystack = item.keywords.join(" ").toLowerCase();
      if (tokens.every((t) => hasWordStart(haystack, t))) {
        score = Math.max(score, SCORE_TOKEN_KEYWORD);
      }
    }
  }

  // Tiers 3 & 4 — literal matching against prose. Never fuzzy.
  const text = item.text;
  if (text && score < SCORE_PROSE_PHRASE) {
    const phrase = query.trim().toLowerCase();
    if (phrase.length >= 3 && hasWordStart(text, phrase)) {
      score = Math.max(score, SCORE_PROSE_PHRASE);
    } else if (tokens.every((t) => hasWordStart(text, t))) {
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
  return [item.title, item.meta, item.keywords.join(", "), item.text, extra]
    .filter(Boolean)
    .join(". ");
}
