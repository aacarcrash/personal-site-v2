import type { AxisKey, ProjectOrCluster } from "@/data/types";

export function toArray<T>(value: T | readonly T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? [...(value as readonly T[])] : [value as T];
}

export function getProjectAxisValues(
  item: ProjectOrCluster,
  axis: AxisKey,
): string[] {
  return toArray(item.axes[axis] as string | readonly string[] | undefined);
}

export function projectMatchesCell(
  item: ProjectOrCluster,
  yAxis: AxisKey,
  yValue: string,
  xAxis: AxisKey,
  xValue: string,
): boolean {
  return (
    getProjectAxisValues(item, yAxis).includes(yValue) &&
    getProjectAxisValues(item, xAxis).includes(xValue)
  );
}

export function projectHasAxisValue(
  item: ProjectOrCluster,
  axis: AxisKey,
  value: string,
): boolean {
  return getProjectAxisValues(item, axis).includes(value);
}
