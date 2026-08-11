"use client";

// Global ⌘K / Ctrl+K command palette. Built on cmdk's Command (combobox
// semantics, arrow-key nav, command-score filtering) but NOT Command.Dialog —
// the overlay/panel chrome is hand-rolled with framer-motion, matching the
// existing modal pattern in components/Lightbox.tsx (LightboxShell), so we
// get exact control over the fade timing and stay consistent with the rest
// of the codebase's inline-style modals rather than introducing Radix-driven
// CSS hooks for a one-off dialog.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Command, useCommandState } from "cmdk";
import { rankSearch, searchIndex, type SearchGroup, type SearchItem } from "@/lib/searchIndex";
import featured from "@/content/featured.json";

const GROUP_ORDER: SearchGroup[] = [
  "projects",
  "sketches",
  "experience",
  "shows",
  "skills",
  "pages",
  "actions",
];

const GROUP_LABELS: Record<SearchGroup, string> = {
  projects: "Projects",
  sketches: "Sketches",
  experience: "Experience",
  shows: "Exhibitions & screenings",
  skills: "Skills",
  pages: "Pages",
  actions: "Actions",
};

const itemsByGroup: Record<SearchGroup, SearchItem[]> = GROUP_ORDER.reduce(
  (acc, g) => {
    acc[g] = searchIndex.filter((i) => i.group === g);
    return acc;
  },
  {} as Record<SearchGroup, SearchItem[]>,
);

const suggestedItems: SearchItem[] = featured.slugs
  .map((slug) => searchIndex.find((i) => i.id === slug))
  .filter((i): i is SearchItem => Boolean(i));

const actionItems = itemsByGroup.actions;

type RankedGroup = { group: SearchGroup; items: SearchItem[] };

// cmdk's built-in Command.Group does NOT reorder groups relative to each
// other by relevance — only items within a single group get sorted (verified
// against cmdk@1.1.1: Group elements carry no identifying attribute for the
// internal DOM-reorder pass to target, so group order stays fixed as
// authored). That's wrong for a corpus spanning six groups: a query like
// "cv" should surface the Pages group's CV entry above lower-scoring
// Projects matches, not always show Projects first. So filtering is fully
// manual here (Command shouldFilter={false}) using lib/searchIndex's
// rankSearch — both items-within-group AND which group appears first are
// ranked by score. Scoring itself lives in lib/searchIndex.ts so the
// regression harness measures the same ranking users see.
function rankGroups(query: string): RankedGroup[] {
  const scored = rankSearch(query);
  const byGroup = new Map<SearchGroup, { item: SearchItem; score: number }[]>();
  for (const s of scored) {
    const arr = byGroup.get(s.item.group);
    if (arr) arr.push(s);
    else byGroup.set(s.item.group, [s]);
  }
  const groups: { group: SearchGroup; items: SearchItem[]; maxScore: number }[] = [];
  for (const [group, entries] of byGroup) {
    entries.sort((a, b) => b.score - a.score);
    groups.push({ group, items: entries.map((e) => e.item), maxScore: entries[0].score });
  }
  groups.sort((a, b) => b.maxScore - a.maxScore);
  return groups;
}

export function CommandMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const isAdmin = pathname?.startsWith("/admin");

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
    previouslyFocused.current?.focus?.();
  }, []);

  // Global ⌘K / Ctrl+K listener. Must beat the browser's own binding, so
  // preventDefault fires unconditionally on the combo (pattern per
  // components/MediaCarousel.tsx: guard INPUT/TEXTAREA for other keys, but
  // the open shortcut itself must work everywhere, including from an input).
  useEffect(() => {
    if (isAdmin) return;
    function onKey(e: KeyboardEvent) {
      const isCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCombo) {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) return prev;
          previouslyFocused.current = document.activeElement as HTMLElement;
          return true;
        });
        return;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAdmin]);

  // Escape closes; Tab is trapped on the single focusable input (there's
  // nothing else tabbable inside the panel — items are keyboard-navigated
  // via cmdk's arrow keys, not Tab).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      } else if (e.key === "Tab") {
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // See app/globals.css `html.cmdk-open` — drops the reserved
  // scrollbar-gutter while the overlay covers the viewport, otherwise the
  // mobile full-screen takeover renders narrower than the true viewport.
  useEffect(() => {
    document.documentElement.classList.toggle("cmdk-open", open);
    return () => document.documentElement.classList.remove("cmdk-open");
  }, [open]);

  // cmdk's own scrollIntoView-the-selected-item behavior doesn't reliably
  // keep pace with rapid typing: when the rendered group set changes on
  // every keystroke (a full re-sort via rankGroups), the list can settle
  // scrolled to a stale position that hides the very top (best) match until
  // the user nudges the arrow keys. Force the list back to the top whenever
  // the query changes so the best match is always the first visible row.
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0 });
  }, [search]);

  const navigate = useCallback(
    (item: SearchItem) => {
      if (item.id === "action-theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        close();
        return;
      }
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
        close();
        return;
      }
      router.push(item.href);
      close();
    },
    [close, resolvedTheme, router, setTheme],
  );

  const query = search.trim();
  const showingSuggested = query.length === 0;
  const rankedGroups = useMemo(
    () => (showingSuggested ? [] : rankGroups(query)),
    [query, showingSuggested],
  );

  // Semantic tier: debounced call to /api/search (cosine over build-time
  // vectors, same bge-m3 model both sides). Keyword results render instantly
  // above; this group streams in ~250-500ms later. Any failure (no keys, rate
  // limit, offline) resolves to [] — the palette silently stays keyword-only.
  const [semantic, setSemantic] = useState<{ item: SearchItem; score: number }[]>([]);
  useEffect(() => {
    if (query.length < 2) {
      setSemantic([]);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setSemantic([]);
          return;
        }
        const { results } = (await res.json()) as {
          results: { id: string; score: number }[];
        };
        setSemantic(
          results
            .map((r) => ({ item: searchIndex.find((i) => i.id === r.id), score: r.score }))
            .filter((x): x is { item: SearchItem; score: number } => Boolean(x.item)),
        );
      } catch {
        setSemantic([]); // aborted or network error — keyword tier stands alone
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  // Multi-signal agreement (Mare pattern): an item the keyword tier already
  // surfaced doesn't repeat in the semantic group.
  const keywordIds = useMemo(
    () => new Set(rankedGroups.flatMap((g) => g.items.map((i) => i.id))),
    [rankedGroups],
  );
  const semanticShown = showingSuggested
    ? []
    : semantic.filter((s) => !keywordIds.has(s.item.id));

  if (isAdmin) return null;

  const fadeTransition = reduceMotion ? { duration: 0 } : { duration: 0.15 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          // Inline on purpose: the CSS optimizer strips backdrop-filter from
          // stylesheets (see the --glass-bg note in globals.css).
          style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={fadeTransition}
          onClick={close}
        >
          <motion.div
            className="cmd-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fadeTransition}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
          >
            <Command shouldFilter={false} label="Search" loop>
              <div className="cmd-input-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ color: "var(--text-muted)", flexShrink: 0 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <Command.Input
                  ref={inputRef}
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search projects, CV, skills…"
                  autoFocus
                />
                <span className="cmd-kbd">ESC</span>
              </div>

              <Command.List ref={listRef}>
                <Command.Empty>
                  No results — try a project name, tool, or role.
                </Command.Empty>

                {showingSuggested ? (
                  <>
                    <Command.Group heading="Jump to">
                      {suggestedItems.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => navigate(item)}
                        >
                          <span className="cmd-item-title">{item.title}</span>
                          {item.meta && <ItemMeta text={item.meta} />}
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Group heading="Actions">
                      {actionItems.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => navigate(item)}
                        >
                          <span className="cmd-item-title">{item.title}</span>
                          {item.meta && <ItemMeta text={item.meta} />}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                ) : (
                  <>
                    {rankedGroups.map(({ group, items }) => (
                      <Command.Group key={group} heading={GROUP_LABELS[group]}>
                        {items.map((item) => (
                          <Command.Item
                            key={item.id}
                            value={item.id}
                            onSelect={() => navigate(item)}
                            // Breadcrumb metas ("CV → Experience → Org") run
                            // long enough to overflow a narrow row on mobile
                            // — stack title/meta there. Short metas
                            // ("project · year", "action") stay single-line.
                            className={item.meta?.includes("→") ? "cmd-item-stack" : undefined}
                          >
                            <HighlightedTitle title={item.title} query={query} />
                            {item.meta && <ItemMeta text={item.meta} />}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                    {semanticShown.length > 0 && (
                      <Command.Group
                        heading={
                          rankedGroups.length === 0
                            ? "No keyword hit — nearest by embedding"
                            : "Semantic matches · vector search"
                        }
                      >
                        {semanticShown.map(({ item, score }) => (
                          <Command.Item
                            key={`sem-${item.id}`}
                            value={`sem-${item.id}`}
                            onSelect={() => navigate(item)}
                          >
                            <span className="cmd-item-title">{item.title}</span>
                            <ItemMeta text={`similarity ${score.toFixed(2)}`} />
                          </Command.Item>
                        ))}
                      </Command.Group>
                    )}
                  </>
                )}
              </Command.List>
              <ResultCountLive />
            </Command>

            <div className="cmd-footer">
              <span>↑↓ navigate · ↵ open · ESC close</span>
              <span>keyword + vector search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ResultCountLive() {
  const count = useCommandState((state) => state.filtered.count);
  return (
    <span className="sr-only" role="status" aria-live="polite">
      {count} result{count === 1 ? "" : "s"}
    </span>
  );
}

// Finds the longest contiguous substring of `query` that appears (case-
// insensitively) anywhere in `title`, and returns its position IN the
// title (original casing preserved for render). Deliberately substrings of
// the query only — not an arbitrary longest-common-substring — so "unreal
// engine" against "Unreal Engine" prefers matching the full run rather than
// some coincidental shorter overlap. No match (pure fuzzy/keyword-alias hit,
// e.g. an alias word that isn't in the title at all) returns null, and the
// caller renders the title plainly rather than highlighting something wrong.
//
// Two guards keep this from bolding noise (found by web-verify's evaluator
// pass against a real screenshot: query "kermit" was bolding "er" mid-word
// inside "experience" — a coincidental letter run with no relation to the
// query):
// - A three-character floor. Below that, shared letters are too likely to
//   be coincidental (short queries still get a lower floor so e.g. "ai"
//   can match).
// - A word-start requirement: the match must begin at index 0 or right
//   after a non-alphanumeric character. "Real" matching the start of
//   "Reality" is a real match; "er" matching mid-word inside "experience"
//   is not.
const MIN_MATCH_LEN = 3;

function isWordStart(text: string, idx: number): boolean {
  if (idx === 0) return true;
  return !/[a-z0-9]/i.test(text[idx - 1]);
}

function findQueryMatchRange(title: string, query: string): [number, number] | null {
  if (!query) return null;
  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const minLen = Math.min(MIN_MATCH_LEN, lowerQuery.length);
  for (let len = lowerQuery.length; len >= minLen; len--) {
    for (let start = 0; start + len <= lowerQuery.length; start++) {
      const sub = lowerQuery.slice(start, start + len);
      let searchFrom = 0;
      for (;;) {
        const idx = lowerTitle.indexOf(sub, searchFrom);
        if (idx === -1) break;
        if (isWordStart(lowerTitle, idx)) return [idx, idx + len];
        searchFrom = idx + 1;
      }
    }
  }
  return null;
}

// Marks the matched span. This USED to be font-weight 600, but the type
// system (Sheet U) has no bold — with `font-synthesis: none` that rule now
// renders identically to the surrounding text, i.e. no highlight at all.
// Re-encoded as an underline plus a lift to full --text: still monochrome
// (design.md), still not a colour/background fill, and it survives a
// single-weight family. Semantic-tier rows never pass through here: they
// matched by meaning, not text, so a text highlight would lie about why
// the result surfaced.
function HighlightedTitle({ title, query }: { title: string; query: string }) {
  const range = useMemo(() => findQueryMatchRange(title, query), [title, query]);
  if (!range) return <span className="cmd-item-title">{title}</span>;
  const [start, end] = range;
  return (
    <span className="cmd-item-title">
      {title.slice(0, start)}
      <span
        style={{
          color: "var(--text)",
          textDecoration: "underline",
          textDecorationThickness: "1px",
          textUnderlineOffset: "2px",
        }}
      >
        {title.slice(start, end)}
      </span>
      {title.slice(end)}
    </span>
  );
}

function ItemMeta({ text }: { text: string }) {
  return <span className="cmd-item-meta">{text}</span>;
}
