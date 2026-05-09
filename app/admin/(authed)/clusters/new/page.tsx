import { Shell } from "@/components/admin/Shell";
import { ClusterForm } from "@/components/admin/ClusterForm";
import { AxesConfigSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function NewClusterPage() {
  const axes = readJson("axes.json", AxesConfigSchema);
  return (
    <Shell title="New sketch group">
      <ClusterForm axes={axes} mode="create" />
    </Shell>
  );
}
