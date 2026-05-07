import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";
import { getProjectAxisValues } from "@/lib/axes";

export type Cell = {
  xValue: string;
  yValue: string;
  items: ProjectOrCluster[];
};

/**
 * Group projects into a 2D cell map keyed by (yValue, xValue). A project
 * with multiple values on the X or Y axis is placed into every matching
 * cell — duplicates across cells are intentional. Within a single cell,
 * a project appears at most once (deduped).
 */
export function buildCellMap(
  projects: ProjectOrCluster[],
  yAxis: AxisKey,
  xAxis: AxisKey,
): Map<string, ProjectOrCluster[]> {
  const map = new Map<string, ProjectOrCluster[]>();
  for (const p of projects) {
    const yValues = getProjectAxisValues(p, yAxis);
    const xValues = getProjectAxisValues(p, xAxis);
    for (const yv of yValues) {
      for (const xv of xValues) {
        const key = `${yv}::${xv}`;
        const existing = map.get(key);
        if (existing) {
          if (!existing.includes(p)) existing.push(p);
        } else {
          map.set(key, [p]);
        }
      }
    }
  }
  return map;
}

/**
 * Get the ordered list of values for a given axis.
 * For YEAR, descending (newest first). For all others, the declared order.
 */
export function getAxisValues(axis: AxisKey): readonly string[] {
  return AXIS_VALUES[axis] as readonly string[];
}

export function cellKey(yValue: string, xValue: string): string {
  return `${yValue}::${xValue}`;
}

/**
 * One-line summary used for the hover preview card.
 * Truncates the first description block (or subtitle for clusters)
 * to roughly one line.
 */
export function getCardSummary(
  item: ProjectOrCluster,
  maxChars = 110,
): string {
  let raw = "";
  if (item.type === "project") {
    raw = item.description?.[0]?.text ?? item.subtitle ?? "";
  } else {
    raw = item.subtitle ?? item.technology ?? `${item.count} pieces`;
  }
  // Strip any inline HTML from description text.
  const stripped = raw.replace(/<[^>]+>/g, "").trim();
  if (stripped.length <= maxChars) return stripped;
  // Truncate at the nearest word boundary before maxChars.
  const slice = stripped.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  return (lastSpace > 40 ? slice.slice(0, lastSpace) : slice) + "…";
}

export function clusterSlug(cluster: { id: string; slug?: string }): string {
  return cluster.slug ?? cluster.id;
}
