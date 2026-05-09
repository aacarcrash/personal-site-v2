// Atomic JSON read/write for content/*.json. Validate on both read and
// write via Zod (passed in from the action). Atomic write = write to
// .tmp then rename, so a crashed write can't leave a half-flushed file.

import { readFileSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import type { ZodType } from "zod";

const CONTENT_DIR = resolve(process.cwd(), "content");

function fullPath(rel: string): string {
  if (rel.includes("..") || rel.startsWith("/") || rel.startsWith("\\")) {
    throw new Error(`bad content path: ${rel}`);
  }
  return resolve(CONTENT_DIR, rel);
}

export function readJson<T>(rel: string, schema: ZodType<T>): T {
  const path = fullPath(rel);
  const raw = readFileSync(path, "utf8");
  return schema.parse(JSON.parse(raw));
}

export function writeJson<T>(rel: string, schema: ZodType<T>, data: T): number {
  const validated = schema.parse(data);
  const path = fullPath(rel);
  const tmp = path + ".tmp";
  mkdirSync(dirname(path), { recursive: true });
  const body = JSON.stringify(validated, null, 2) + "\n";
  writeFileSync(tmp, body, "utf8");
  renameSync(tmp, path);
  return Buffer.byteLength(body, "utf8");
}
