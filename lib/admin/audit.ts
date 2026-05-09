// Append-only local audit log: one JSON line per admin write. Never
// commit (.admin-log/ is gitignored). Useful trace if something looks
// off ("when did I last edit Mare?").

import { appendFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const LOG_DIR = resolve(process.cwd(), ".admin-log");
const LOG_FILE = resolve(LOG_DIR, "audit.jsonl");

export type AuditEntry = {
  ts: string;
  action: string;
  target?: string;
  bytes?: number;
  ok: boolean;
  error?: string;
};

export function audit(entry: Omit<AuditEntry, "ts">): void {
  try {
    mkdirSync(LOG_DIR, { recursive: true });
    const full: AuditEntry = { ts: new Date().toISOString(), ...entry };
    appendFileSync(LOG_FILE, JSON.stringify(full) + "\n", "utf8");
  } catch {
    // Audit must never break the action.
  }
}
