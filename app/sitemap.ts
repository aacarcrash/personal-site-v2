import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { clusterSlug } from "@/components/AxisGrid/axisGridUtils";
import type { Project, Cluster } from "@/data/types";

const BASE = "https://aakarsh.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${BASE}/cv`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects
    .filter((p): p is Project => p.type === "project")
    .map((p) => ({
      url: `${BASE}/projects/${p.slug}`,
      changeFrequency: "yearly",
      priority: 0.7,
    }));

  const sketchRoutes: MetadataRoute.Sitemap = projects
    .filter((p): p is Cluster => p.type === "cluster")
    .map((c) => ({
      url: `${BASE}/sketches/${clusterSlug(c)}`,
      changeFrequency: "yearly",
      priority: 0.6,
    }));

  return [...staticRoutes, ...projectRoutes, ...sketchRoutes];
}
