import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { FeaturedSchema, ProjectSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";
import { FeaturedEditor } from "./FeaturedEditor";

export default async function FeaturedPage() {
  const featured = readJson("featured.json", FeaturedSchema);
  const projects = readJson("projects.json", z.array(ProjectSchema));
  const slugs = projects.map((p) => ({ slug: p.slug, name: p.name }));
  return (
    <Shell title="Featured" subtitle="Homepage strip">
      <FeaturedEditor initial={featured} allProjects={slugs} />
    </Shell>
  );
}
