import { Shell } from "@/components/admin/Shell";
import { CvSchema } from "@/data/types";
import { readJson } from "@/lib/admin/storage";
import { CvEditor } from "./CvEditor";

export default async function CvPage() {
  const cv = readJson("cv.json", CvSchema);
  return (
    <Shell title="CV" subtitle="content/cv.json">
      <CvEditor initial={cv} />
    </Shell>
  );
}
