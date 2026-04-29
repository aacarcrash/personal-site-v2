import type { AxisKey, ProjectOrCluster } from "@/data/types";
import { AXIS_VALUES } from "@/data/types";

export type Cell = {
  xValue: string;
  yValue: string;
  items: ProjectOrCluster[];
};

/**
 * Group projects into a 2D cell map keyed by (yValue, xValue).
 * Featured projects appear in the grid too — the featured strip is just
 * an additional surfacing, not a removal.
 */
export function buildCellMap(
  projects: ProjectOrCluster[],
  yAxis: AxisKey,
  xAxis: AxisKey,
): Map<string, ProjectOrCluster[]> {
  const map = new Map<string, ProjectOrCluster[]>();
  for (const p of projects) {
    const yValue = p.axes[yAxis];
    const xValue = p.axes[xAxis];
    const key = `${yValue}::${xValue}`;
    const existing = map.get(key);
    if (existing) existing.push(p);
    else map.set(key, [p]);
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
