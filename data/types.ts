// Source-of-truth types + Zod schemas for content/*.json. The admin
// panel writes JSON; the data shims (data/projects.ts, data/cv.ts,
// data/featured.ts) validate at module load. Axis values are no longer
// compile-time string-literal unions because the admin can rename them
// at runtime; AXIS_VALUES is now loaded from content/axes.json via
// data/axes.ts (re-exported here for back-compat with existing imports).

import { z } from "zod";

// ---------- Axes ----------

export type AxisKey = "year" | "medium" | "concern" | "technology" | "context";

export const AXIS_KEYS: readonly AxisKey[] = [
  "year",
  "medium",
  "concern",
  "technology",
  "context",
] as const;

// Loosened from string-literal unions. Admin can rename/add values.
export type Year = string;
export type Medium = string;
export type Concern = string;
export type Technology = string;
export type Context = string;

export type AxisValueMap = {
  year: Year;
  medium: Medium;
  concern: Concern;
  technology: Technology;
  context: Context;
};

export type Axes = {
  year: Year;
  medium: Medium | readonly Medium[];
  concern: Concern | readonly Concern[];
  technology: Technology | readonly Technology[];
  context: Context | readonly Context[];
};

// AXIS_VALUES is now provided by data/axes.ts (loads content/axes.json).
// Kept re-exported here so existing `import { AXIS_VALUES } from "@/data/types"`
// callers continue to work.
export { AXIS_VALUES } from "./axes";

// ---------- Block / MediaItem ----------

export const BlockSchema = z.object({
  header: z.string().optional(),
  text: z.string(),
});
export type Block = z.infer<typeof BlockSchema>;

export const MediaItemSchema = z.object({
  link: z.string(),
  type: z.enum(["image", "video"]),
  caption: z.string().optional(),
  sourceLink: z.string().optional(),
});
export type MediaItem = z.infer<typeof MediaItemSchema>;

// ---------- Axes (Zod) ----------

const AxisValueOrArray = z.union([z.string(), z.array(z.string())]);

export const AxesSchema = z.object({
  year: z.string(),
  medium: AxisValueOrArray,
  concern: AxisValueOrArray,
  technology: AxisValueOrArray,
  context: AxisValueOrArray,
});

// ---------- Project / Cluster ----------

export const CaseStudyDecisionSchema = z.object({
  title: z.string(),
  body: z.string(),
  image: z.string().optional(),
  imageCaption: z.string().optional(),
  placeholder: z.string().optional(),
  // Grid width out of 12 columns (desktop). Cards stack to full width on mobile.
  span: z.number().optional(),
  // How the image sits in its box: "cover" (fill, default) or "contain" (whole image).
  fit: z.enum(["cover", "contain"]).optional(),
});
export type CaseStudyDecision = z.infer<typeof CaseStudyDecisionSchema>;

export const CaseStudySchema = z.object({
  // Hero image shown at the top of the case study (until a walkthrough video exists).
  heroImage: z.string().optional(),
  heroCaption: z.string().optional(),
  walkthroughLabel: z.string().optional(),
  walkthroughVideo: z.string().optional(),
  walkthroughDuration: z.string().optional(),
  decisionsLabel: z.string().optional(),
  decisions: z.array(CaseStudyDecisionSchema),
});
export type CaseStudy = z.infer<typeof CaseStudySchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.literal("project"),
  axes: AxesSchema,
  thumbnail: z.string(),
  subtitle: z.string(),
  date: z.string(),
  technology: z.string(),
  tools: z.array(z.string()).optional(),
  description: z.array(BlockSchema),
  media: z.array(MediaItemSchema),
  role: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  sourceCode: z.string().optional(),
  liveLink: z.string().optional(),
  tier: z.enum(["case-study", "light", "art"]).optional(),
  caseStudy: CaseStudySchema.optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ClusterItemSchema = z.object({
  title: z.string(),
  link: z.string().optional(),
  type: z.enum(["image", "video"]).optional(),
  source: z.string().optional(),
});
export type ClusterItem = z.infer<typeof ClusterItemSchema>;

export const ClusterSchema = z.object({
  id: z.string(),
  slug: z.string().optional(),
  name: z.string(),
  type: z.literal("cluster"),
  axes: AxesSchema,
  thumbnail: z.string(),
  subtitle: z.string().optional(),
  count: z.number(),
  items: z.array(ClusterItemSchema),
  technology: z.string().optional(),
  tools: z.array(z.string()).optional(),
  date: z.string().optional(),
});
export type Cluster = z.infer<typeof ClusterSchema>;

export type ProjectOrCluster = Project | Cluster;

// ---------- Featured ----------

export const FeaturedSchema = z.object({
  slugs: z.array(z.string()),
  columns: z.number().int().positive().default(3),
});
export type Featured = z.infer<typeof FeaturedSchema>;

// ---------- Axes JSON ----------

export const AxesConfigSchema = z.object({
  year: z.array(z.string()),
  medium: z.array(z.string()),
  concern: z.array(z.string()),
  technology: z.array(z.string()),
  context: z.array(z.string()),
});
export type AxesConfig = z.infer<typeof AxesConfigSchema>;

// ---------- CV ----------

export const CvRoleSchema = z.object({
  title: z.string(),
  org: z.string(),
  date: z.string(),
  location: z.string().optional(),
  bullets: z.array(z.string()).optional(),
  link: z.string().optional(),
});
export type CvRole = z.infer<typeof CvRoleSchema>;

export const CvShowSchema = z.object({
  title: z.string(),
  kind: z.string(),
  venue: z.string(),
  location: z.string(),
  year: z.string(),
});
export type CvShow = z.infer<typeof CvShowSchema>;

export const CvPressSchema = z.object({
  title: z.string(),
  outlet: z.string(),
  date: z.string(),
  link: z.string().optional(),
});
export type CvPress = z.infer<typeof CvPressSchema>;

export const CvAwardSchema = z.object({
  name: z.string(),
  date: z.string().optional(),
});
export type CvAward = z.infer<typeof CvAwardSchema>;

export const CvSkillSchema = z.object({
  category: z.string(),
  items: z.string(),
});
export type CvSkill = z.infer<typeof CvSkillSchema>;

export const CvSchema = z.object({
  experience: z.array(CvRoleSchema),
  shows: z.array(CvShowSchema),
  residencies: z.array(CvRoleSchema),
  teaching: z.array(CvRoleSchema),
  press: z.array(CvPressSchema),
  education: z.array(CvRoleSchema),
  awards: z.array(CvAwardSchema),
  skills: z.array(CvSkillSchema),
});
export type Cv = z.infer<typeof CvSchema>;
