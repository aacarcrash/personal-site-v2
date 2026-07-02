"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type ViewMode = "grid" | "list" | "cluster";

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
      className="page-gutter"
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
              padding: "2px 8px",
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
