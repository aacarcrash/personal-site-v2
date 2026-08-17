import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { getProjectAxisValues } from "@/lib/axes";

export type Filters = {
  // For each axis, a set of selected values. Empty = no filter on that axis.
  [K in AxisKey]?: Set<string>;
} & {
  tools?: Set<string>;
};

export const FILTER_AXES: AxisKey[] = [
  "year",
  "medium",
  "concern",
  "technology",
  "context",
];

/** Every param key this view owns. Anything else in the query string — `view`,
 *  the grid's `x`/`y` — is left alone when the URL is rewritten. */
export const FILTER_PARAM_KEYS = [...FILTER_AXES, "tools"];

/**
 * Read filters out of a query string so a filtered list can be linked to.
 * `/?view=list&context=Product` is the homepage's Product entry point.
 *
 * Values are validated against the axis vocabulary (and, for tools, against
 * the tools that actually appear in the data). An unknown value is dropped
 * rather than kept, because keeping it filters the list down to nothing and a
 * mistyped link then looks like an empty portfolio.
 */
export function filtersFromParams(
  params: URLSearchParams,
  projects: ProjectOrCluster[],
): Filters {
  const filters: Filters = {};

  for (const axis of FILTER_AXES) {
    const raw = params.get(axis);
    if (!raw) continue;
    const allowed = new Set<string>(AXIS_VALUES[axis]);
    const picked = raw.split(",").filter((v) => allowed.has(v));
    if (picked.length > 0) filters[axis] = new Set(picked);
  }

  const rawTools = params.get("tools");
  if (rawTools) {
    const allowed = new Set<string>();
    for (const p of projects) for (const t of getProjectTools(p)) allowed.add(t);
    const picked = rawTools.split(",").filter((t) => allowed.has(t));
    if (picked.length > 0) filters.tools = new Set(picked);
  }

  return filters;
}

/** Apply `filters` onto an existing query string, preserving params this view
 *  does not own. Comma-separated so several values on one axis stay readable. */
export function applyFiltersToParams(
  params: URLSearchParams,
  filters: Filters,
): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of FILTER_PARAM_KEYS) next.delete(key);
  for (const key of FILTER_PARAM_KEYS) {
    const set = filters[key as keyof Filters];
    if (set && set.size > 0) next.set(key, [...set].join(","));
  }
  return next;
}

export function getProjectTools(item: ProjectOrCluster): string[] {
  return (item.tools ?? []) as string[];
}

/**
 * AND across facets, OR within a facet.
 * If the user picks Web + XR on Medium, projects matching either pass the
 * Medium check. If they also pick Tools/interface on Concern, projects must
 * match BOTH the Medium check AND the Concern check.
 */
export function filterProjects(
  projects: ProjectOrCluster[],
  filters: Filters,
): ProjectOrCluster[] {
  const axes: AxisKey[] = ["year", "medium", "concern", "technology", "context"];
  return projects.filter((p) => {
    for (const axis of axes) {
      const selected = filters[axis];
      if (selected && selected.size > 0) {
        const values = getProjectAxisValues(p, axis);
        const hit = values.some((v) => selected.has(v));
        if (!hit) return false;
      }
    }
    if (filters.tools && filters.tools.size > 0) {
      const tools = getProjectTools(p);
      const hit = tools.some((t) => filters.tools!.has(t));
      if (!hit) return false;
    }
    return true;
  });
}

/**
 * Returns a map of value → count, scoped to projects matching the *other*
 * filters. This is what the filter panel displays next to each chip.
 *
 * Counts include singletons. UI decides whether to hide them.
 */
export function countAxisValues(
  projects: ProjectOrCluster[],
  axis: AxisKey,
  filters: Filters,
): Map<string, number> {
  // Apply all filters EXCEPT the one on the current axis (so toggling values
  // within an axis doesn't make others disappear).
  const others = { ...filters };
  delete others[axis];
  const scoped = filterProjects(projects, others);
  const counts = new Map<string, number>();
  for (const p of scoped) {
    for (const v of getProjectAxisValues(p, axis)) {
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
  }
  return counts;
}

export function countTools(
  projects: ProjectOrCluster[],
  filters: Filters,
): Map<string, number> {
  const others = { ...filters };
  delete others.tools;
  const scoped = filterProjects(projects, others);
  const counts = new Map<string, number>();
  for (const p of scoped) {
    for (const t of getProjectTools(p)) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return counts;
}
