"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { FilterPanel } from "./FilterPanel";
import { Picker } from "@/components/Picker";
import { useCycleKeys } from "@/components/useCycleKeys";

const SORT_KEYS: SortKey[] = ["year", "name"];
import { ProjectRow } from "./ProjectRow";
import {
  applyFiltersToParams,
  countAxisValues,
  countTools,
  filterProjects,
  filtersFromParams,
  type Filters,
} from "./filterProjects";

type Props = {
  projects: ProjectOrCluster[];
};

type SortKey = "year" | "name";

export function FacetedListView({ projects }: Props) {
  /* Filters are seeded from the query string so a filtered list can be linked
     to — `/?view=list&context=Product` is the homepage's Product entry point,
     and it has to work at every viewport, which the axis grid's `x`/`y` pair
     does not (phones get MobileGroupedList instead). Read once, on mount:
     after that the filters are client state and the URL follows them. */
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString()), projects),
  );
  const [sort, setSort] = useState<SortKey>("year");
  // Mobile-only: the filter sidebar collapses behind a toggle (see .flv-* in globals.css).
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  /* history.replaceState, NOT router.replace — the same call AxisGrid settled
     on. Nothing on the server reads these params, so there is nothing to
     navigate to, and routing here would hand the page back to Next's
     ScrollAndFocusHandler, which resets scrollTop on the first client
     navigation after a load. Reading window.location.search rather than the
     useSearchParams snapshot keeps the other params (`view`, the grid's
     `x`/`y`) intact as they change underneath us. */
  useEffect(() => {
    const next = applyFiltersToParams(
      new URLSearchParams(window.location.search),
      filters,
    );
    const query = next.toString();
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, [filters]);

  const filtered = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  // A / D only — the list sorts on one key, so there is no second axis for
  // W / S to drive.
  useCycleKeys<SortKey>([
    { back: "a", fwd: "d", options: SORT_KEYS, current: sort, onChange: setSort },
  ]);

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
    <section className="page-gutter" style={{ paddingBottom: "64px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          /* Matches the grid and cluster control rows — one rhythm for the
             same control across all three view modes. */
          paddingBottom: "36px",
          gap: "12px",
          flexWrap: "wrap",
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
          <button
            type="button"
            className="flv-filter-toggle"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: filtersOpen ? "var(--text)" : "var(--text-muted)",
              letterSpacing: "0.3px",
              padding: "2px 8px",
              background: filtersOpen ? "var(--surface)" : "transparent",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            filters
          </button>
          {/* The same Picker the grid and cluster views use — this was a
              fourth hand-rolled copy of the control at 12px. */}
          <Picker
            label="sort"
            active={sort}
            onChange={setSort}
            options={[
              { key: "year" as SortKey, label: "year" },
              { key: "name" as SortKey, label: "name" },
            ]}
            keys={["A", "D"]}
            keysLabel="change sort"
            align="end"
          />
        </div>
      </div>

      <div className="flv-body">
        <FilterPanel
          className={`flv-filters${filtersOpen ? " flv-filters-open" : ""}`}
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
                fontFamily: "var(--font-sans)",
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
                toggleTool={toggleTool}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

