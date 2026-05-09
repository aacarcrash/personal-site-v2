"use server";

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { assertAdminAccess } from "@/lib/admin/lockdown";
import { audit } from "@/lib/admin/audit";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
]);

const MAX_BYTES = 50 * 1024 * 1024; // 50MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "misc";
}

function sanitizeFilename(name: string, fallbackExt: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : fallbackExt;
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "media";
  const cleanExt = /^\.[a-z0-9]{1,5}$/.test(ext) ? ext : fallbackExt;
  return cleanBase + cleanExt;
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<{ path: string } | { error: string }> {
  await assertAdminAccess();

  const file = formData.get("file");
  const slugRaw = String(formData.get("slug") ?? "misc");
  if (!(file instanceof File)) return { error: "no file" };
  if (file.size === 0) return { error: "empty file" };
  if (file.size > MAX_BYTES) return { error: `file > ${MAX_BYTES} bytes` };
  if (!ALLOWED_TYPES.has(file.type)) return { error: `type ${file.type} not allowed` };

  const slug = sanitizeSlug(slugRaw);
  const filename = sanitizeFilename(file.name, EXT_BY_TYPE[file.type] ?? "");

  const dir = resolve(process.cwd(), "public", "images", slug);
  mkdirSync(dir, { recursive: true });

  // If a file with this name already exists, suffix with a counter.
  let final = filename;
  let i = 1;
  while (existsSync(resolve(dir, final))) {
    const dot = filename.lastIndexOf(".");
    const base = dot > 0 ? filename.slice(0, dot) : filename;
    const ext = dot > 0 ? filename.slice(dot) : "";
    final = `${base}-${i}${ext}`;
    i++;
  }

  const buf = Buffer.from(await file.arrayBuffer());
  writeFileSync(resolve(dir, final), buf);

  const path = `/images/${slug}/${final}`;
  audit({ action: "media.upload", target: path, bytes: buf.length, ok: true });
  return { path };
}
