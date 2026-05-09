"use server";

import { revalidatePath } from "next/cache";
import { CvSchema, type Cv } from "@/data/types";
import { writeJson } from "@/lib/admin/storage";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

export async function saveCvAction(input: Cv): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = CvSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid cv" };
  const bytes = writeJson("cv.json", CvSchema, parsed.data);
  audit({ action: "cv.save", bytes, ok: true });
  revalidatePath("/cv");
  return { ok: true };
}
