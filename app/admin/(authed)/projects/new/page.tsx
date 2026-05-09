import { Shell } from "@/components/admin/Shell";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { AxesConfigSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function NewProjectPage() {
  const axes = readJson("axes.json", AxesConfigSchema);
  return (
    <Shell title="New project">
      <ProjectForm axes={axes} mode="create" />
    </Shell>
  );
}
