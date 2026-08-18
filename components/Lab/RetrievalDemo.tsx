"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchIndex } from "@/lib/searchIndex";

/**
 * The site's own semantic search, with the guards showing.
 *
 * The command palette (⌘K) runs this exact route and renders only the rows
 * that survive. Here the route returns its working as well — every candidate
 * it scored, in rank order, and for each one it dropped, the rule that did
 * it. The point of the section is that "similarity floor" and "gap cutoff"
 * are things you can watch happen to a query you chose, not two nouns in a
 * paragraph about retrieval.
 *
 * Nothing here is a second implementation. `/api/search/route.ts` is the same
 * file that serves the palette; this component only asks it for the
 * diagnostics block it already computes.
 */

type DropReason = "floor" | "gap" | "cap";
type Candidate = { id: string; score: number; kept: boolean; reason?: DropReason };
type Diagnostics = {
  corpus: number;
  floor: number;
  gapRatio: number;
  maxResults: number;
  candidates: Candidate[];
};

/* Chosen by running them. Between them these four make each guard fire at
   least once: "compute shader" keeps two rows and cuts the rest on the gap,
   "Sydney Opera House" and "asdfgh" are held back almost entirely by the
   floor, and the first one fills the cap. */
const PRESETS = [
  "compute shader",
  "reference tool for designers",
  "Sydney Opera House",
  "asdfgh",
];

/* Why each rule exists, in the order the route applies them. Kept beside the
   table because a reason code without a reason is just a label. */
const REASON_COPY: Record<DropReason, string> = {
  floor: "below the similarity floor — scored, but not close enough to show",
  gap: "the score curve dropped here, so the tail is cut",
  cap: "past the result cap",
};

const REASON_LABEL: Record<DropReason, string> = {
  floor: "FLOOR",
  gap: "GAP",
  cap: "CAP",
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "down" }
  | { status: "ok"; diagnostics: Diagnostics; kept: number };

function titleFor(id: string): { title: string; href: string | null } {
  const item = searchIndex.find((i) => i.id === id);
  return item ? { title: item.title, href: item.href } : { title: id, href: null };
}

export function RetrievalDemo() {
  const [query, setQuery] = useState(PRESETS[0]);
  const [state, setState] = useState<State>({ status: "idle" });
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async (q: string, signal: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q }),
        signal,
      });
      if (!res.ok) {
        setState({ status: "down" });
        return;
      }
      const json = (await res.json()) as {
        results: { id: string }[];
        diagnostics?: Diagnostics;
      };
      if (!json.diagnostics) {
        setState({ status: "down" });
        return;
      }
      setState({
        status: "ok",
        diagnostics: json.diagnostics,
        kept: json.results.length,
      });
    } catch {
      // Aborted by the next keystroke, or the network went away. Either way
      // there is nothing to draw, and the abort case is about to be replaced.
      if (!signal.aborted) setState({ status: "down" });
    }
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setState({ status: "idle" });
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    const t = setTimeout(() => void run(q, controller.signal), 400);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query, run]);

  const diagnostics = state.status === "ok" ? state.diagnostics : null;
  const top = diagnostics?.candidates[0]?.score ?? 1;

  return (
    <div className="lab-demo">
      <label className="lab-field">
        <span className="eyebrow">Query</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe something you want to find"
          className="lab-input"
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <div className="lab-presets">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className="lab-preset"
            aria-pressed={p === query}
            onClick={() => setQuery(p)}
          >
            {p}
          </button>
        ))}
      </div>

      {/* The parameters are read off the response, not hardcoded here, so this
          line cannot drift from the route the way a copied constant would. */}
      {diagnostics && (
        <p className="lab-params">
          {diagnostics.corpus} items embedded · floor {diagnostics.floor.toFixed(2)} ·
          gap {Math.round(diagnostics.gapRatio * 100)}% · cap {diagnostics.maxResults} ·
          <span className="lab-params-kept"> {state.status === "ok" ? state.kept : 0} shown</span>
        </p>
      )}

      <div className="lab-table" aria-live="polite" aria-busy={state.status === "loading"}>
        {state.status === "loading" && <p className="lab-note">Embedding the query…</p>}
        {state.status === "idle" && <p className="lab-note">Type at least two characters.</p>}
        {state.status === "down" && (
          <p className="lab-note">
            The embedding service did not answer. This is the failure the route is
            built for: it returns a 503 and the palette carries on with keyword
            matching, so search degrades instead of breaking.
          </p>
        )}
        {state.status === "ok" && state.diagnostics.candidates.length === 0 && (
          <p className="lab-note">Nothing scored high enough to be worth showing.</p>
        )}
        {state.status === "ok" &&
          state.diagnostics.candidates.map((c) => {
            const { title, href } = titleFor(c.id);
            return (
              <div key={c.id} className={c.kept ? "lab-row lab-row-kept" : "lab-row"}>
                <span className="lab-row-title">
                  {href ? (
                    <Link href={href} className="link-underline">
                      {title}
                    </Link>
                  ) : (
                    title
                  )}
                </span>
                <span className="lab-bar" aria-hidden>
                  <span
                    className="lab-bar-fill"
                    style={{ width: `${Math.max(2, (c.score / top) * 100)}%` }}
                  />
                </span>
                <span className="lab-row-score">{c.score.toFixed(2)}</span>
                <span className="lab-row-reason">
                  {c.kept ? "SHOWN" : REASON_LABEL[c.reason ?? "cap"]}
                </span>
              </div>
            );
          })}
      </div>

      {state.status === "ok" && (
        <ul className="lab-legend">
          {(Object.keys(REASON_COPY) as DropReason[]).map((r) => (
            <li key={r}>
              <span className="lab-legend-key">{REASON_LABEL[r]}</span> {REASON_COPY[r]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
