"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { isViewMode, type ViewMode } from "../ViewSwitcher";

/**
 * PROTOTYPE — not production code. Four placement variants (A/B/C/D) for a
 * homepage view-picker + search stub, switchable at runtime so the owner can
 * pick one in the browser. Delete this whole `components/proto/` directory
 * (and its two call sites in app/page.tsx + ResponsiveGrid.tsx) once a
 * decision is made.
 */

type ProtoVariant = "A" | "B" | "C" | "D";
const STORAGE_KEY = "proto-variant";
const CHANGE_EVENT = "protovariantchange";
const VARIANTS: ProtoVariant[] = ["A", "B", "C", "D"];

function readStoredVariant(): ProtoVariant {
  if (typeof window === "undefined") return "A";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "A" || v === "B" || v === "C" || v === "D" ? v : "A";
}

/** Shared localStorage-backed variant state, kept in sync across the
 *  separately-mounted ControlBarProto (page top) and ControlBarRowA
 *  (rendered inside ResponsiveGrid) via a custom window event. */
function useProtoVariant(): [ProtoVariant, (v: ProtoVariant) => void] {
  const [variant, setVariantState] = useState<ProtoVariant>("A");

  useEffect(() => {
    const initial = readStoredVariant();
    setVariantState(initial);
    document.documentElement.setAttribute("data-proto", initial);
    const onChange = () => {
      const v = readStoredVariant();
      setVariantState(v);
      document.documentElement.setAttribute("data-proto", v);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(CHANGE_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const setVariant = useCallback((v: ProtoVariant) => {
    window.localStorage.setItem(STORAGE_KEY, v);
    document.documentElement.setAttribute("data-proto", v);
    setVariantState(v);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return [variant, setVariant];
}

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "grid", label: "grid" },
  { key: "list", label: "list" },
  { key: "cluster", label: "cluster" },
];

function GridIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0" y="0" width="5" height="5" />
      <rect x="7" y="0" width="5" height="5" />
      <rect x="0" y="7" width="5" height="5" />
      <rect x="7" y="7" width="5" height="5" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="0" y="1" width="12" height="1.4" />
      <rect x="0" y="5.3" width="12" height="1.4" />
      <rect x="0" y="9.6" width="12" height="1.4" />
    </svg>
  );
}

function ClusterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <circle cx="3.2" cy="3.4" r="2.2" />
      <circle cx="9" cy="4.4" r="1.6" />
      <circle cx="5" cy="9" r="1.6" />
      <circle cx="10" cy="9.6" r="1.1" />
    </svg>
  );
}

function ViewIcon({ view }: { view: ViewMode }) {
  if (view === "grid") return <GridIcon />;
  if (view === "list") return <ListIcon />;
  return <ClusterIcon />;
}

function SearchIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="5" stroke="var(--text-muted)" strokeWidth="1.3" />
      <line x1="10.3" y1="10.3" x2="14.2" y2="14.2" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Segmented grid/list/cluster picker — same URL-switching logic as
 *  ViewSwitcher.tsx, restyled per variant (bordered vs. glass-borderless). */
function SegmentedPicker({ glass = false }: { glass?: boolean }) {
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
      style={{
        display: "flex",
        border: glass ? "none" : "0.5px solid var(--border)",
        borderRadius: "2px",
        overflow: "hidden",
      }}
    >
      {VIEWS.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 12px",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: active ? 700 : 400,
              color: active ? "var(--text)" : "var(--text-muted)",
              background: active
                ? glass
                  ? "color-mix(in srgb, var(--bg) 62%, transparent)"
                  : "var(--surface)"
                : "transparent",
              border: "none",
              borderRadius: glass ? "18px" : 0,
              cursor: "pointer",
            }}
          >
            <ViewIcon view={v.key} />
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

/** Non-functional search stub — visual only, no-op onClick. */
function SearchBoxStub({ glass = false }: { glass?: boolean }) {
  return (
    <div
      onClick={() => {}}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        width: "220px",
        border: glass ? "none" : "0.5px solid var(--border)",
        borderRadius: "2px",
        padding: "7px 10px",
        cursor: "pointer",
        background: "transparent",
      }}
    >
      <SearchIcon />
      <span
        style={{
          flexGrow: 1,
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        search
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
          background: "var(--surface)",
          borderRadius: "2px",
          padding: "2px 5px",
        }}
      >
        ⌘K
      </span>
    </div>
  );
}

/** Variant A: sticky row above the grid, rendered from inside ResponsiveGrid
 *  so it lands where the old ViewSwitcher row used to sit. Renders nothing
 *  for the other three variants. */
export function ControlBarRowA() {
  const [variant] = useProtoVariant();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (variant !== "A") return null;

  return (
    <div
      className="page-gutter"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "var(--bg)",
        borderBottom: scrolled ? "0.5px solid var(--border)" : "0.5px solid transparent",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <SegmentedPicker />
      <SearchBoxStub />
    </div>
  );
}

/** Variants B and C share the "glass bar" look; C adds scroll auto-hide. */
function GlassBar({ hidden = false }: { hidden?: boolean }) {
  return (
    <div
      className="proto-glass-bar"
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: hidden ? "translate(-50%, 150%)" : "translate(-50%, 0)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "10px 16px",
        borderRadius: "28px",
        background: "color-mix(in srgb, var(--bg) 35%, transparent)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        border: "0.5px solid color-mix(in srgb, var(--text) 12%, transparent)",
        boxShadow:
          "inset 0 1px 1px var(--proto-glass-hi), inset 0 -1px 1px rgba(17,17,17,0.06), 0 8px 24px rgba(17,17,17,0.10)",
        transition: "transform 0.25s ease",
      } as React.CSSProperties}
    >
      <SegmentedPicker glass />
      <div
        style={{
          width: "0.5px",
          alignSelf: "stretch",
          background: "color-mix(in srgb, var(--text) 12%, transparent)",
        }}
      />
      <SearchBoxStub glass />
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .proto-glass-bar {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

/** Variant D: glass capsule with picker only; search box floats up in the
 *  header nav lane (approximate alignment, desktop only). */
function GlassBarD() {
  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translate(-50%, 0)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: "28px",
          background: "color-mix(in srgb, var(--bg) 35%, transparent)",
          backdropFilter: "blur(20px) saturate(1.6)",
          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
          border: "0.5px solid color-mix(in srgb, var(--text) 12%, transparent)",
          boxShadow:
            "inset 0 1px 1px var(--proto-glass-hi), inset 0 -1px 1px rgba(17,17,17,0.06), 0 8px 24px rgba(17,17,17,0.10)",
        }}
      >
        <SegmentedPicker glass />
      </div>
      <div className="proto-d-search">
        <SearchBoxStub />
        <style jsx>{`
          .proto-d-search {
            display: none;
          }
          @media (min-width: 821px) {
            .proto-d-search {
              display: block;
              position: fixed;
              top: 44px;
              right: calc(64px + 130px);
              z-index: 60;
            }
          }
        `}</style>
      </div>
    </>
  );
}

/** Variant C: glass bar that hides on scroll-down (>40px cumulative) and
 *  reappears on any scroll-up. */
function GlassBarC() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const cumulativeDown = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (delta > 0) {
        cumulativeDown.current += delta;
        if (cumulativeDown.current > 40) setHidden(true);
      } else if (delta < 0) {
        cumulativeDown.current = 0;
        setHidden(false);
      }
      lastY.current = y;
      void reduceMotion; // instant vs. animated toggle handled purely in CSS
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <GlassBar hidden={hidden} />;
}

/** Mounted once at the top of app/page.tsx. Owns the variant switcher pill,
 *  the global CSS that hides the old ViewSwitcher row, and renders the
 *  position:fixed variants (B/C/D) directly — variant A instead renders via
 *  ControlBarRowA from inside ResponsiveGrid, see that export above. */
export default function ControlBarProto() {
  const [variant, setVariant] = useProtoVariant();

  return (
    <>
      <style jsx global>{`
        .view-switcher-row {
          display: none !important;
        }
        :root {
          --proto-glass-hi: rgba(255, 255, 255, 0.55);
        }
        [data-theme="dark"] {
          --proto-glass-hi: rgba(255, 255, 255, 0.12);
        }
      `}</style>

      {variant === "B" && <GlassBar />}
      {variant === "C" && <GlassBarC />}
      {variant === "D" && <GlassBarD />}

      <div
        style={{
          position: "fixed",
          bottom: "12px",
          right: "12px",
          zIndex: 999,
          display: "flex",
          gap: "2px",
          padding: "4px",
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: "4px",
        }}
      >
        {VARIANTS.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setVariant(v)}
            style={{
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              background: v === variant ? "var(--text)" : "transparent",
              color: v === variant ? "var(--bg)" : "var(--text-muted)",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </>
  );
}
