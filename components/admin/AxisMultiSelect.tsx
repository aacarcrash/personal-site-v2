"use client";

import { Checkbox } from "./ui";

export function AxisMultiSelect({
  label,
  axisKey: _axisKey,
  values,
  current,
  onChange,
}: {
  label: string;
  axisKey: string;
  values: readonly string[];
  current: string | readonly string[];
  onChange: (next: string[]) => void;
}) {
  const arr = Array.isArray(current) ? [...(current as string[])] : current ? [current as string] : [];

  function toggle(v: string, on: boolean) {
    const next = on ? [...arr, v] : arr.filter((x) => x !== v);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {values.map((v) => (
          <Checkbox
            key={v}
            checked={arr.includes(v)}
            onChange={(on) => toggle(v, on)}
            label={v}
          />
        ))}
      </div>
    </div>
  );
}
