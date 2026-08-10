"use client";

// Floating glass control bar — homepage only, placement D. Search lives in
// the header (HeaderSearchTrigger); this bar carries only the segmented
// grid/list/cluster picker. Same URL-switching logic as the old
// ViewSwitcher.tsx (router.replace, delete `view` for grid, scroll:false) —
// that component's isViewMode/ViewMode helpers are reused here, but its own
// row is no longer rendered anywhere.

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isViewMode, type ViewMode } from "./ViewSwitcher";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "grid", label: "grid" },
  { key: "list", label: "list" },
  { key: "cluster", label: "cluster" },
];

// All three icons share a 12×12 viewBox and fill="currentColor" so their
// optical weight and vertical centering match exactly — verified by
// screenshot per the build spec (design engineers notice icon drift first).
function GridIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="0" width="5" height="5" />
      <rect x="7" y="0" width="5" height="5" />
      <rect x="0" y="7" width="5" height="5" />
      <rect x="7" y="7" width="5" height="5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <rect x="0" y="1" width="12" height="1.4" />
      <rect x="0" y="5.3" width="12" height="1.4" />
      <rect x="0" y="9.6" width="12" height="1.4" />
    </svg>
  );
}

// Radii nudged up from the initial spec (2.2/1.6/1.6/1.1 -> 2.6/1.9/1.9/1.3):
// the smaller circles left the icon's ink area and bounding box visibly
// short of grid/list's, reading as faint punctuation next to them in a
// side-by-side check. Centers unchanged.
function ClusterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <circle cx="3.2" cy="3.4" r="2.6" />
      <circle cx="9" cy="4.4" r="1.9" />
      <circle cx="5" cy="9" r="1.9" />
      <circle cx="10" cy="9.6" r="1.3" />
    </svg>
  );
}

function ViewIcon({ view }: { view: ViewMode }) {
  if (view === "grid") return <GridIcon />;
  if (view === "list") return <ListIcon />;
  return <ClusterIcon />;
}

function ViewBarInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const param = searchParams.get("view");
  const current: ViewMode = isViewMode(param) ? param : "grid";

  const setView = useCallback(
    (view: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (view === "grid") {
        params.delete("view");
      } else {
        params.set("view", view);
      }
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div
      className="view-bar"
      role="group"
      aria-label="View"
      // Inline on purpose: the CSS optimizer strips backdrop-filter from
      // stylesheets (see the --glass-bg note in globals.css).
      style={{ backdropFilter: "blur(20px) saturate(1.6)", WebkitBackdropFilter: "blur(20px) saturate(1.6)" }}
    >
      {VIEWS.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            aria-pressed={active}
            className={`view-bar-seg${active ? " active" : ""}`}
          >
            <ViewIcon view={v.key} />
            {v.label}
          </button>
        );
      })}
      <style jsx>{`
        .view-bar {
          --hi: rgba(255, 255, 255, 0.55);
          --active-bg: var(--glass-active);
          position: fixed;
          left: 50%;
          bottom: calc(24px + env(safe-area-inset-bottom));
          transform: translateX(-50%);
          z-index: 100;
          display: flex;
          gap: 2px;
          padding: 4px;
          border-radius: 12px;
          /* Spec called for --bg 35%; raised to 55% — at 35% the segment
             labels dropped under the 4.5:1 contrast floor design.md itself
             requires when the bar drifts over a bright thumbnail. Blur/
             saturate/border/shadow are unchanged from spec. */
          background: var(--glass-bg);
          border: 0.5px solid var(--glass-border);
          box-shadow:
            inset 0 1px 1px var(--hi),
            0 8px 24px rgba(17, 17, 17, 0.1);
        }
        :global([data-theme="dark"]) .view-bar {
          --hi: rgba(255, 255, 255, 0.12);
        }
        .view-bar-seg {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text-secondary);
          background: transparent;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .view-bar-seg.active {
          background: var(--active-bg);
          color: var(--text);
          font-weight: 700;
        }
        @media (prefers-reduced-motion: reduce) {
          .view-bar-seg {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export function ViewBar() {
  return (
    <Suspense fallback={null}>
      <ViewBarInner />
    </Suspense>
  );
}
