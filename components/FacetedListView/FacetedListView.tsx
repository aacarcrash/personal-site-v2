"use client";

import { useCallback, useMemo, useState } from "react";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { FilterPanel } from "./FilterPanel";
import { ProjectRow } from "./ProjectRow";
import {
  countAxisValues,
  countTools,
  filterProjects,
  type Filters,
} from "./filterProjects";

type Props = {
  projects: ProjectOrCluster[];
};

type SortKey = "year" | "name";

export function FacetedListView({ projects }: Props) {
  const [filters, setFilters] = useState<Filters>({});
  const [sort, setSort] = useState<SortKey>("year");

  const toggleAxis = useCallback((axis: AxisKey, value: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      const set = new Set(prev[axis] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[axis] = set;
      return next;
    });
  }, []);

  const toggleTool = useCallback((tool: string) => {
    setFilters((prev) => {
      const next = { ...prev };
      const set = new Set(prev.tools ?? []);
      if (set.has(tool)) set.delete(tool);
      else set.add(tool);
      next.tools = set;
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setFilters({}), []);

  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sort === "year") {
      arr.sort((a, b) => {
        const ya = String(a.axes.year);
        const yb = String(b.axes.year);
        return yb.localeCompare(ya);
      });
    } else {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [filtered, sort]);

  const axisCounts = useMemo(
    () => ({
      year: countAxisValues(projects, "year", filters),
      medium: countAxisValues(projects, "medium", filters),
      concern: countAxisValues(projects, "concern", filters),
      technology: countAxisValues(projects, "technology", filters),
      context: countAxisValues(projects, "context", filters),
    }),
    [projects, filters],
  );

  const toolCounts = useMemo(() => countTools(projects, filters), [projects, filters]);

  const axisOrder: Record<AxisKey, readonly string[]> = AXIS_VALUES;

  const activeFilterSummary = useMemo(() => {
    const bits: string[] = [];
    (["medium", "concern", "context", "technology"] as AxisKey[]).forEach((axis) => {
      const set = filters[axis];
      if (set && set.size > 0) bits.push([...set].join(" / "));
    });
    if (filters.tools && filters.tools.size > 0) {
      bits.push([...filters.tools].join(" / "));
    }
    return bits.join(" · ");
  }, [filters]);

  return (
    <section style={{ padding: "0 64px 64px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
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
          {sorted.length} of {projects.length}
          {activeFilterSummary ? ` — filtered by ${activeFilterSummary}` : ""}
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
              letterSpacing: "0.3px",
            }}
          >
            sort
          </span>
          <SortToggle value="year" current={sort} setSort={setSort} label="year" />
          <SortToggle value="name" current={sort} setSort={setSort} label="name" />
        </div>
      </div>

      <div style={{ display: "flex", gap: "56px" }}>
        <FilterPanel
          filters={filters}
          toggleAxis={toggleAxis}
          toggleTool={toggleTool}
          clearAll={clearAll}
          axisCounts={axisCounts}
          toolCounts={toolCounts}
          axisOrder={axisOrder}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          {sorted.length === 0 ? (
            <div
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "16px",
                color: "var(--text-muted)",
                padding: "48px 0",
              }}
            >
              No projects match these filters.
            </div>
          ) : (
            sorted.map((item) => (
              <ProjectRow
                key={item.id}
                item={item}
                filters={filters}
                toggleAxis={toggleAxis}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function SortToggle({
  value,
  current,
  setSort,
  label,
}: {
  value: SortKey;
  current: SortKey;
  setSort: (s: SortKey) => void;
  label: string;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => setSort(value)}
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
      {label}
    </button>
  );
}
