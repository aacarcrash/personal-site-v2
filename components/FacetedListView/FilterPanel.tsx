"use client";

import { useState } from "react";
import type { AxisKey } from "@/data/types";
import type { Filters } from "./filterProjects";

type AxisDef = { key: AxisKey; label: string };

const AXES: AxisDef[] = [
  { key: "medium", label: "Medium" },
  { key: "concern", label: "Concern" },
  { key: "context", label: "Context" },
  { key: "technology", label: "Technology" },
];

type Props = {
  filters: Filters;
  toggleAxis: (axis: AxisKey, value: string) => void;
  toggleTool: (tool: string) => void;
  clearAll: () => void;
  axisCounts: Record<AxisKey, Map<string, number>>;
  toolCounts: Map<string, number>;
  axisOrder: Record<AxisKey, readonly string[]>;
  /** Mobile visibility classes from the parent (see .flv-filters in globals.css). */
  className?: string;
};

export function FilterPanel({
  filters,
  toggleAxis,
  toggleTool,
  clearAll,
  axisCounts,
  toolCounts,
  axisOrder,
  className,
}: Props) {
  const [showSingletons, setShowSingletons] = useState(false);
  const hasActive =
    AXES.some((a) => (filters[a.key]?.size ?? 0) > 0) ||
    (filters.tools?.size ?? 0) > 0;

  return (
    <aside
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        width: "240px",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingBottom: "12px",
          borderBottom: "0.5px solid var(--border)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text)",
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          Filters
        </span>
        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Clear
          </button>
        )}
      </div>

      {AXES.map(({ key, label }) => (
        <Facet
          key={key}
          label={label}
          values={axisOrder[key]}
          counts={axisCounts[key]}
          selected={filters[key] ?? new Set()}
          onToggle={(v) => toggleAxis(key, v)}
        />
      ))}

      <ToolsFacet
        counts={toolCounts}
        selected={filters.tools ?? new Set()}
        onToggle={toggleTool}
        showSingletons={showSingletons}
        toggleSingletons={() => setShowSingletons((v) => !v)}
      />
    </aside>
  );
}

function Facet({
  label,
  values,
  counts,
  selected,
  onToggle,
}: {
  label: string;
  values: readonly string[];
  counts: Map<string, number>;
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
          letterSpacing: "0.6px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {values.map((v) => {
          const count = counts.get(v) ?? 0;
          const active = selected.has(v);
          const disabled = count === 0;
          return (
            <FacetRow
              key={v}
              value={v}
              count={count}
              active={active}
              disabled={disabled}
              onClick={() => !disabled && onToggle(v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ToolsFacet({
  counts,
  selected,
  onToggle,
  showSingletons,
  toggleSingletons,
}: {
  counts: Map<string, number>;
  selected: Set<string>;
  onToggle: (v: string) => void;
  showSingletons: boolean;
  toggleSingletons: () => void;
}) {
  const sorted = [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });
  const visible = showSingletons ? sorted : sorted.filter(([, c]) => c > 1);
  const singletonCount = sorted.length - sorted.filter(([, c]) => c > 1).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--text-muted)",
          letterSpacing: "0.6px",
          textTransform: "uppercase",
        }}
      >
        Tools
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {visible.map(([tool, count]) => {
          const active = selected.has(tool);
          const isSingle = count === 1;
          return (
            <FacetRow
              key={tool}
              value={tool}
              count={count}
              active={active}
              disabled={isSingle}
              onClick={() => !isSingle && onToggle(tool)}
            />
          );
        })}
        {singletonCount > 0 && (
          <button
            type="button"
            onClick={toggleSingletons}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              padding: "6px 0 0",
              borderTop: "0.5px dashed var(--border)",
              background: "transparent",
              border: "none",
              borderTopWidth: "0.5px",
              borderTopStyle: "dashed",
              borderTopColor: "var(--border)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--text-muted)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            <span>{showSingletons ? "Hide" : "Show"} {singletonCount} single-item groups</span>
            <span>{showSingletons ? "▴" : "▾"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function FacetRow({
  value,
  count,
  active,
  disabled,
  onClick,
}: {
  value: string;
  count: number;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: active ? "4px 8px" : "0",
        margin: active ? "0 -8px" : "0",
        background: active ? "var(--text)" : "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        textAlign: "left",
        width: active ? "calc(100% + 16px)" : "100%",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: "14px",
          color: active ? "var(--bg)" : "var(--text)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: active ? "var(--bg)" : "var(--text-muted)",
        }}
      >
        {count}
      </span>
    </button>
  );
}
