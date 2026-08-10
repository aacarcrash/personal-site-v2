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
import { Command, defaultFilter, useCommandState } from "cmdk";
import { searchIndex, type SearchGroup, type SearchItem } from "@/lib/searchIndex";
import featured from "@/content/featured.json";

const GROUP_ORDER: SearchGroup[] = [
  "projects",
  "sketches",
  "experience",
  "skills",
  "pages",
  "actions",
];

const GROUP_LABELS: Record<SearchGroup, string> = {
  projects: "Projects",
  sketches: "Sketches",
  experience: "Experience",
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
// manual here (Command shouldFilter={false}) using cmdk's own scorer
// (defaultFilter, i.e. command-score) — both items-within-group AND which
// group appears first are ranked by score.
function rankGroups(query: string): RankedGroup[] {
  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of searchIndex) {
    const score = defaultFilter(item.title, query, item.keywords);
    if (score > 0) scored.push({ item, score });
  }
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

  if (isAdmin) return null;

  const fadeTransition = reduceMotion ? { duration: 0 } : { duration: 0.15 };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
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
                    <Command.Group heading="Suggested">
                      {suggestedItems.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => navigate(item)}
                        >
                          <span>{item.title}</span>
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
                          <span>{item.title}</span>
                          {item.meta && <ItemMeta text={item.meta} />}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                ) : (
                  rankedGroups.map(({ group, items }) => (
                    <Command.Group key={group} heading={GROUP_LABELS[group]}>
                      {items.map((item) => (
                        <Command.Item
                          key={item.id}
                          value={item.id}
                          onSelect={() => navigate(item)}
                        >
                          <span>{item.title}</span>
                          {item.meta && <ItemMeta text={item.meta} />}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))
                )}
              </Command.List>
              <ResultCountLive />
            </Command>

            <div className="cmd-footer">
              <span>↑↓ navigate ↵ open esc close</span>
              <span>keyword search</span>
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

function ItemMeta({ text }: { text: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--text-muted)",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}
