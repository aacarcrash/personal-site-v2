import { notFound } from "next/navigation";
import { z } from "zod";
import { Shell } from "@/components/admin/Shell";
import { ClusterForm } from "@/components/admin/ClusterForm";
import { ClusterSchema, AxesConfigSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";

export default async function EditClusterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clusters = readJson("clusters.json", z.array(ClusterSchema));
  const cluster = clusters.find((c) => c.id === id);
  if (!cluster) notFound();
  const axes = readJson("axes.json", AxesConfigSchema);
  return (
    <Shell title={cluster.name} subtitle={`sketch group · ${cluster.id} · /sketches/${cluster.slug ?? cluster.id}`}>
      <ClusterForm cluster={cluster} axes={axes} mode="edit" />
    </Shell>
  );
}
