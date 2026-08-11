"use client";

import type { AxisKey } from "@/data/types";
import { Picker } from "@/components/Picker";

export const AXIS_OPTIONS: { key: AxisKey; label: string }[] = [
  { key: "year", label: "time" },
  { key: "medium", label: "medium" },
  { key: "concern", label: "concern" },
  { key: "technology", label: "tech" },
  { key: "context", label: "context" },
];

type Props = {
  /** What sits before the options — "Y" or "X". */
  label: string;
  active: AxisKey;
  onChange: (next: AxisKey) => void;
  /** The axis already drawn on the other side, so it cannot be picked twice. */
  disabled?: AxisKey;
  /** Which side that disabled option is in use on, for its accessible name. */
  takenOn?: string;
  keys?: [string, string];
  keysLabel?: string;
  align?: "start" | "end";
};

/** Thin wrapper over the shared Picker that supplies the axis vocabulary. */
export function AxisSwitcher({
  label,
  active,
  onChange,
  disabled,
  takenOn,
  keys,
  keysLabel,
  align,
}: Props) {
  return (
    <Picker
      label={label}
      options={AXIS_OPTIONS}
      active={active}
      onChange={onChange}
      disabled={disabled}
      takenOn={takenOn}
      keys={keys}
      keysLabel={keysLabel}
      align={align}
    />
  );
}
