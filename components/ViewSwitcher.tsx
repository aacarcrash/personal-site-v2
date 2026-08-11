"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type ViewMode = "grid" | "list" | "cluster";

/** What loads with no ?view= param. Deliberately NOT the first item in the
 *  picker: the picker's order is grid / list / cluster because that is
 *  increasing abstraction, and list stays in position 2. Two components
 *  resolve this fallback (ResponsiveGrid and ViewBar) and they must agree,
 *  or the bar would highlight a mode the page is not rendering. */
export const DEFAULT_VIEW: ViewMode = "grid";

const VIEWS: { key: ViewMode; label: string }[] = [
  { key: "grid", label: "grid" },
  { key: "list", label: "list" },
  { key: "cluster", label: "cluster" },
];

export function isViewMode(value: string | null): value is ViewMode {
  return value === "grid" || value === "list" || value === "cluster";
}

type Props = {
  current: ViewMode;
};

export function ViewSwitcher({ current }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = useCallback(
    (view: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      // Omit the param for whatever the DEFAULT is, not for a hardcoded
      // mode. This used to test `view === "grid"`, so the moment the default
      // moved to list, clicking grid deleted the param and the page fell
      // straight back to list — grid was unreachable from the bar.
      if (view === DEFAULT_VIEW) {
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
      className="page-gutter view-switcher-row"
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        paddingBottom: "16px",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--text-muted)",
          letterSpacing: "0.3px",
        }}
      >
        view
      </span>
      {VIEWS.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: active ? "var(--text)" : "var(--text-muted)",
              letterSpacing: "0.3px",
              padding: "6px 8px",
              background: active ? "var(--surface)" : "transparent",
              border: "none",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
