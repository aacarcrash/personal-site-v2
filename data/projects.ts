// Thin shim: source of truth is content/projects.json + content/clusters.json.
// Validated at module load via Zod. The admin panel writes back to those
// JSON files. Exported as a single `projects: ProjectOrCluster[]` array
// (projects first, then clusters) so existing call sites work unchanged.

import { z } from "zod";
import projectsJson from "../content/projects.json";
import clustersJson from "../content/clusters.json";
import {
  ProjectSchema,
  ClusterSchema,
  type ProjectOrCluster,
} from "./types";

const validatedProjects = z.array(ProjectSchema).parse(projectsJson);
const validatedClusters = z.array(ClusterSchema).parse(clustersJson);

export const projects: ProjectOrCluster[] = [
  ...validatedProjects,
  ...validatedClusters,
];
