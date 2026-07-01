"use client";

// Unified tag board: projects + sketch clusters in one dense table with
// inline axis-tag toggles, multi-select, and a bulk add/remove bar. All
// edits stage locally; "Save" flushes them in one atomic action.

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { applyTagEditsAction } from "@/app/admin/_actions/tags";

export type BoardRow = {
  kind: "project" | "cluster";
  id: string;
  name: string;
  tier: string | null;
  axes: Record<string, string | string[]>;
};

const AXES: { key: string; label: string; single?: boolean }[] = [
  { key: "year", label: "Year", single: true },
  { key: "medium", label: "Medium" },
  { key: "concern", label: "Concern" },
  { key: "technology", label: "Tech" },
  { key: "context", label: "Context" },
];
const TIERS = ["case-study", "light", "art"] as const;

type RowEdit = { axes?: Record<string, string[]>; tier?: string | null };

function toArr(v: string | string[] | undefined): string[] {
  if (v == null) return [];
  return Array.isArray(v) ? [...v] : [v];
}

export function Board({ rows, axes }: { rows: BoardRow[]; axes: Record<string, string[]> }) {
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, RowEdit>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAxis, setBulkAxis] = useState<string>("medium");
  const [bulkValue, setBulkValue] = useState<string>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rowById = useMemo(() => {
    const m = new Map<string, BoardRow>();
    for (const r of rows) m.set(r.id, r);
    return m;
  }, [rows]);

  function values(row: BoardRow, axis: string): string[] {
    const e = edits[row.id]?.axes?.[axis];
    return e ?? toArr(row.axes[axis]);
  }
  function tierOf(row: BoardRow): string | null {
    const e = edits[row.id];
    return e && "tier" in e ? e.tier ?? null : row.tier;
  }

  function setAxis(id: string, axis: string, next: string[]) {
    setEdits((prev) => ({
      ...prev,
      [id]: { ...prev[id], axes: { ...prev[id]?.axes, [axis]: next } },
    }));
  }

  function toggle(row: BoardRow, axis: string, value: string, single?: boolean) {
    const cur = values(row, axis);
    let next: string[];
    if (single) next = [value];
    else next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setAxis(row.id, axis, next);
  }

  function setTier(id: string, tier: string | null) {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], tier } }));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function selectAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  function bulkApply(mode: "add" | "remove") {
    if (!bulkValue || selected.size === 0) return;
    const single = AXES.find((a) => a.key === bulkAxis)?.single;
    setEdits((prev) => {
      const next = { ...prev };
      for (const id of selected) {
        const row = rowById.get(id);
        if (!row) continue;
        const cur = next[id]?.axes?.[bulkAxis] ?? toArr(row.axes[bulkAxis]);
        let arr: string[];
        if (single) arr = mode === "add" ? [bulkValue] : [];
        else if (mode === "add") arr = cur.includes(bulkValue) ? cur : [...cur, bulkValue];
        else arr = cur.filter((v) => v !== bulkValue);
        next[id] = { ...next[id], axes: { ...next[id]?.axes, [bulkAxis]: arr } };
      }
      return next;
    });
  }

  const payload = useMemo(() => {
    const out: {
      kind: "project" | "cluster";
      id: string;
      axes?: Record<string, string | string[]>;
      tier?: string | null;
    }[] = [];
    for (const [id, e] of Object.entries(edits)) {
      const row = rowById.get(id);
      if (!row) continue;
      const item: (typeof out)[number] = { kind: row.kind, id };
      let has = false;
      if (e.axes) {
        item.axes = {};
        for (const [axis, arr] of Object.entries(e.axes)) {
          const single = AXES.find((a) => a.key === axis)?.single;
          item.axes[axis] = single ? arr[0] ?? "" : arr.length === 1 ? arr[0] : arr;
        }
        has = true;
      }
      if ("tier" in e) {
        item.tier = e.tier ?? null;
        has = true;
      }
      if (has) out.push(item);
    }
    return out;
  }, [edits, rowById]);

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await applyTagEditsAction(payload);
      if ("error" in res) {
        setMsg("Error: " + res.error);
      } else {
        setMsg(`Saved ${res.count} item${res.count === 1 ? "" : "s"}`);
        setEdits({});
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk bar */}
      <div className="flex flex-wrap items-center gap-2 border border-border p-2 font-mono text-xs">
        <span className="text-text-muted uppercase tracking-wider">
          {selected.size} selected
        </span>
        <select
          value={bulkAxis}
          onChange={(e) => {
            setBulkAxis(e.target.value);
            setBulkValue("");
          }}
          className="border border-border bg-surface px-2 py-1"
        >
          {AXES.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
        <select
          value={bulkValue}
          onChange={(e) => setBulkValue(e.target.value)}
          className="border border-border bg-surface px-2 py-1"
        >
          <option value="">— value —</option>
          {(axes[bulkAxis] ?? []).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
        <button
          onClick={() => bulkApply("add")}
          disabled={!bulkValue || selected.size === 0}
          className="border border-border px-2 py-1 hover:border-text disabled:opacity-40"
        >
          + Add
        </button>
        <button
          onClick={() => bulkApply("remove")}
          disabled={!bulkValue || selected.size === 0}
          className="border border-border px-2 py-1 hover:border-text disabled:opacity-40"
        >
          − Remove
        </button>
        <div className="ml-auto flex items-center gap-3">
          {msg ? <span className="text-text-secondary">{msg}</span> : null}
          <button
            onClick={save}
            disabled={payload.length === 0 || pending}
            className="px-4 py-1 border disabled:opacity-40"
            style={{ background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }}
          >
            {pending ? "Saving…" : `Save ${payload.length || ""}`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="p-2 w-8">
                <input
                  type="checkbox"
                  checked={selected.size === rows.length && rows.length > 0}
                  onChange={selectAll}
                  className="accent-text"
                  aria-label="Select all"
                />
              </th>
              <th className="p-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Item
              </th>
              {AXES.map((a) => (
                <th
                  key={a.key}
                  className="p-2 font-mono text-[10px] uppercase tracking-wider text-text-muted"
                >
                  {a.label}
                </th>
              ))}
              <th className="p-2 font-mono text-[10px] uppercase tracking-wider text-text-muted">
                Tier
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const dirty = !!edits[row.id];
              return (
                <tr
                  key={row.id}
                  className={"border-b border-border align-top " + (dirty ? "bg-surface" : "")}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleSelect(row.id)}
                      className="accent-text"
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="p-2">
                    <div className="font-serif text-sm leading-tight">{row.name}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-text-subtle">
                      {row.kind}
                      {dirty ? " · edited" : ""}
                    </div>
                  </td>
                  {AXES.map((a) => {
                    const active = values(row, a.key);
                    return (
                      <td key={a.key} className="p-2 align-top">
                        <div className="flex flex-col gap-1">
                          {(axes[a.key] ?? []).map((v) => {
                            const on = active.includes(v);
                            return (
                              <label
                                key={v}
                                className="flex items-center gap-1.5 cursor-pointer font-mono text-[11px] leading-none"
                              >
                                <input
                                  type={a.single ? "radio" : "checkbox"}
                                  name={a.single ? `${row.id}-${a.key}` : undefined}
                                  checked={on}
                                  onChange={() => toggle(row, a.key, v, a.single)}
                                  style={{ accentColor: "var(--text)" }}
                                />
                                <span className={on ? "text-text" : "text-text-muted"}>{v}</span>
                              </label>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-2">
                    {row.kind === "project" ? (
                      <select
                        value={tierOf(row) ?? ""}
                        onChange={(e) => setTier(row.id, e.target.value || null)}
                        className="border border-border bg-surface px-1.5 py-1 font-mono text-[10px]"
                      >
                        <option value="">—</option>
                        {TIERS.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="font-mono text-[10px] text-text-subtle">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
