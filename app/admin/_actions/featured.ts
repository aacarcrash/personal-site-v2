"use server";

import { revalidatePath } from "next/cache";
import { FeaturedSchema, type Featured } from "@/data/types";
import { writeJson } from "@/lib/admin/storage";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

export async function saveFeaturedAction(input: Featured): Promise<{ ok: true } | { error: string }> {
  await assertAdminAccess();
  const parsed = FeaturedSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid featured" };
  const bytes = writeJson("featured.json", FeaturedSchema, parsed.data);
  audit({ action: "featured.save", bytes, ok: true });
  revalidatePath("/", "layout");
  return { ok: true };
}
