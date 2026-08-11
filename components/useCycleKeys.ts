"use client";

import { useEffect, useRef } from "react";

export type CycleBinding<T extends string> = {
  /** Key that steps backwards through `options` (e.g. "w", "a"). */
  back: string;
  /** Key that steps forwards (e.g. "s", "d"). */
  fwd: string;
  options: readonly T[];
  current: T;
  onChange: (next: T) => void;
  /** A value that cannot be selected — skipped rather than landed on. */
  skip?: T;
};

/**
 * WASD-style cycling for the axis pickers.
 *
 * Global rather than focus-scoped, unlike the view bar's arrow keys. The
 * distinction is deliberate: arrows already mean "scroll the page", so
 * capturing them globally would take a real navigation tool away from
 * anyone without a mouse. Letters carry no such default, so binding them
 * globally costs nothing — as long as they stay out of the way of typing,
 * which is what the guards below are for.
 */
export function useCycleKeys<T extends string>(
  bindings: CycleBinding<T>[],
  enabled = true,
) {
  // Callers pass a fresh array literal every render, so depending on its
  // identity would tear the listener down and rebuild it on every render.
  // The ref keeps one listener for the component's life while the handler
  // always reads current values — no stale closure either way.
  const latest = useRef(bindings);
  latest.current = bindings;

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      // Never steal a keystroke that belongs to typing or to a shortcut.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t) {
        const tag = t.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          t.isContentEditable
        ) {
          return;
        }
      }
      // The command menu is a modal — while it is open the page behind it
      // is not what the keyboard is addressing.
      if (document.querySelector("[cmdk-root]")) return;

      const key = e.key.toLowerCase();
      for (const b of latest.current) {
        if (key !== b.back && key !== b.fwd) continue;
        e.preventDefault();
        const delta = key === b.fwd ? 1 : -1;
        const n = b.options.length;
        let i = b.options.indexOf(b.current);
        // Step over a value that is taken on the other axis instead of
        // stopping on it, so repeated presses never appear to do nothing.
        for (let guard = 0; guard < n; guard++) {
          i = (i + delta + n) % n;
          if (b.options[i] !== b.skip) break;
        }
        const next = b.options[i];
        if (next !== b.current) b.onChange(next);
        return;
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}
