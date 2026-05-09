// Runtime axis values loaded from content/axes.json. The admin panel
// edits this JSON file; consumers in components/AxisGrid, ClusterView,
// etc. import AXIS_VALUES from here (re-exported by data/types.ts for
// existing callers).
//
// IMPORTANT: only type-only imports from "./types" — this module is
// re-exported BY types.ts, so any value import would create a cycle.

import { z } from "zod";
import axesJson from "../content/axes.json";
import type { AxisKey } from "./types";

const AxesConfigSchema = z.object({
  year: z.array(z.string()),
  medium: z.array(z.string()),
  concern: z.array(z.string()),
  technology: z.array(z.string()),
  context: z.array(z.string()),
});

const parsed = AxesConfigSchema.parse(axesJson);

export const YEARS = parsed.year;
export const MEDIUMS = parsed.medium;
export const CONCERNS = parsed.concern;
export const TECHNOLOGIES = parsed.technology;
export const CONTEXTS = parsed.context;

export const AXIS_VALUES: { [K in AxisKey]: readonly string[] } = {
  year: YEARS,
  medium: MEDIUMS,
  concern: CONCERNS,
  technology: TECHNOLOGIES,
  context: CONTEXTS,
};
