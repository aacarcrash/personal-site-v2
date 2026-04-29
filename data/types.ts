// Axis values used by the AxisGrid. Coarsened so most projects sit in exactly
// one cell. Source of design: Aakarsh_Portfolio_Site_Specification.md.

export const YEARS = ["2025", "2024", "2023", "2022"] as const;
export const MEDIUMS = [
  "Web",
  "XR",
  "Film",
  "Shader",
  "Installation",
  "Sound",
  "Visualisation",
] as const;
export const CONCERNS = [
  "Interface",
  "Spatial",
  "Archive",
  "Performance",
  "Visual study",
] as const;
export const TECHNOLOGIES = [
  "Web",
  "Game engine",
  "Creative coding",
  "Shader/GPU",
  "Hardware",
  "3D/Render",
] as const;
export const CONTEXTS = ["Product", "Art", "Client", "Education"] as const;

export type Year = (typeof YEARS)[number];
export type Medium = (typeof MEDIUMS)[number];
export type Concern = (typeof CONCERNS)[number];
export type Technology = (typeof TECHNOLOGIES)[number];
export type Context = (typeof CONTEXTS)[number];

export type AxisKey = "year" | "medium" | "concern" | "technology" | "context";

export type AxisValueMap = {
  year: Year;
  medium: Medium;
  concern: Concern;
  technology: Technology;
  context: Context;
};

export type Axes = {
  year: Year;
  medium: Medium;
  concern: Concern;
  technology: Technology;
  context: Context;
};

export const AXIS_VALUES: { [K in AxisKey]: readonly AxisValueMap[K][] } = {
  year: YEARS,
  medium: MEDIUMS,
  concern: CONCERNS,
  technology: TECHNOLOGIES,
  context: CONTEXTS,
};

// Description blocks for project pages. Optional `header` for section titles.
export type Block = {
  header?: string;
  text: string; // may contain inline HTML for links
};

export type MediaItem = {
  link: string;
  type: "image" | "video";
  caption?: string;
  sourceLink?: string;
};

// A full project — has a dedicated detail page.
export type Project = {
  id: string;
  slug: string;
  name: string;
  type: "project";
  axes: Axes;
  featured: boolean;
  thumbnail: string;
  subtitle: string; // shown in featured strip
  date: string; // freeform display string e.g. "May 2024 — Dec 2024"
  technology: string; // freeform display
  description: Block[];
  media: MediaItem[];
  // Role/company badge for tier-1 case-study projects
  role?: string;
  company?: string;
  location?: string;
  sourceCode?: string;
  liveLink?: string;
  // Tier hint for the detail page renderer
  tier?: "case-study" | "light" | "art";
};

// A cluster expands inline as a lightbox — no detail page.
export type ClusterItem = {
  title: string;
  link?: string; // may be image, video iframe URL
  type?: "image" | "video";
  source?: string;
};

export type Cluster = {
  id: string;
  name: string;
  type: "cluster";
  axes: Axes;
  featured: false;
  thumbnail: string;
  subtitle?: string;
  count: number;
  items: ClusterItem[];
  technology?: string;
  date?: string;
};

export type ProjectOrCluster = Project | Cluster;
