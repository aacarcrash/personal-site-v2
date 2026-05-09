// Thin shim: source of truth is content/cv.json. Validated at module
// load via Zod. Same named exports as before so the /cv page and any
// other callers don't change.
//
// CV types live in data/types.ts (CvRole, CvShow, CvPress, CvAward,
// CvSkill, Cv) — re-exported here for back-compat with existing
// `import { CvRole } from "@/data/cv"` usage if any.

import cvJson from "../content/cv.json";
import { CvSchema } from "./types";

export type {
  CvRole,
  CvShow,
  CvPress,
  CvAward,
  CvSkill,
} from "./types";

const cv = CvSchema.parse(cvJson);

export const experience = cv.experience;
export const shows = cv.shows;
export const residencies = cv.residencies;
export const teaching = cv.teaching;
export const press = cv.press;
export const education = cv.education;
export const awards = cv.awards;
export const skills = cv.skills;
