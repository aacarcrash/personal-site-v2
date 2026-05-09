import { notFound } from "next/navigation";
import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ProjectSchema, AxesConfigSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = readJson("projects.json", z.array(ProjectSchema));
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const axes = readJson("axes.json", AxesConfigSchema);

  return (
    <Shell title={project.name} subtitle={`/projects/${project.slug}`}>
      <ProjectForm project={project} axes={axes} mode="edit" />
    </Shell>
  );
}
