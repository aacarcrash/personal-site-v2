"use client";

import { useState, useTransition } from "react";
import { Button, Banner, TextInput } from "@/components/admin/ui";
import { saveAxesAction } from "@/app/admin/_actions/axes";
import type { AxesConfig, AxisKey } from "@/data/types";

const AXES: AxisKey[] = ["year", "medium", "concern", "technology", "context"];

export function AxesEditor({
  initial,
  counts,
}: {
  initial: AxesConfig;
  counts: Record<string, Record<string, number>>;
}) {
  // For each axis, track value list + a parallel `originalIndex` array so
  // we can detect renames (same slot, new label).
  const [draft, setDraft] = useState<AxesConfig>(initial);
  const [origPositions] = useState(() => {
    const m: Record<AxisKey, string[]> = {
      year: [...initial.year],
      medium: [...initial.medium],
      concern: [...initial.concern],
      technology: [...initial.technology],
      context: [...initial.context],
    };
    return m;
  });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  // Each input keeps a stable react key via the original label or a synthetic
  // suffix for newly-added rows. Track per-axis row keys here.
  const [keys, setKeys] = useState<Record<AxisKey, string[]>>(() => ({
    year: initial.year.map((v) => `o:${v}`),
    medium: initial.medium.map((v) => `o:${v}`),
    concern: initial.concern.map((v) => `o:${v}`),
    technology: initial.technology.map((v) => `o:${v}`),
    context: initial.context.map((v) => `o:${v}`),
  }));

  function update(axis: AxisKey, i: number, label: string) {
    setDraft((d) => {
      const next = [...d[axis]];
      next[i] = label;
      return { ...d, [axis]: next };
    });
  }
  function remove(axis: AxisKey, i: number) {
    setDraft((d) => ({ ...d, [axis]: d[axis].filter((_, j) => j !== i) }));
    setKeys((k) => ({ ...k, [axis]: k[axis].filter((_, j) => j !== i) }));
  }
  function add(axis: AxisKey) {
    setDraft((d) => ({ ...d, [axis]: [...d[axis], ""] }));
    setKeys((k) => ({ ...k, [axis]: [...k[axis], `n:${Date.now()}-${Math.random()}`] }));
  }

  // Compute renames: a row is a rename if its react key is `o:<originalLabel>`
  // and its current label differs from `<originalLabel>`.
  function computeRenames() {
    const renames: { axis: AxisKey; from: string; to: string }[] = [];
    for (const axis of AXES) {
      const curList = draft[axis];
      const keyList = keys[axis];
      for (let i = 0; i < curList.length; i++) {
        const k = keyList[i];
        if (!k.startsWith("o:")) continue;
        const original = k.slice(2);
        if (curList[i] !== original) {
          renames.push({ axis, from: original, to: curList[i] });
        }
      }
    }
    return renames;
  }

  function save() {
    // Validate non-empty + unique within axis.
    for (const axis of AXES) {
      const list = draft[axis];
      const seen = new Set<string>();
      for (const v of list) {
        if (!v.trim()) {
          setMsg({ tone: "error", text: `${axis}: empty value not allowed` });
          return;
        }
        if (seen.has(v)) {
          setMsg({ tone: "error", text: `${axis}: duplicate "${v}"` });
          return;
        }
        seen.add(v);
      }
    }
    const renames = computeRenames();
    const total = renames.reduce((n, r) => n + (counts[r.axis]?.[r.from] ?? 0), 0);
    if (renames.length && !confirm(
      `${renames.length} rename(s) will retag ${total} project/cluster axis reference(s). Continue?`,
    )) {
      return;
    }
    startTransition(async () => {
      const res = await saveAxesAction(draft, renames);
      setMsg(
        "error" in res
          ? { tone: "error", text: res.error }
          : { tone: "success", text: `Saved. ${res.updated} item(s) updated.` },
      );
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {msg ? <Banner tone={msg.tone}>{msg.text}</Banner> : null}

      <Banner>
        Renaming a value updates every project/cluster that references it.
        Adding/removing axes is non-destructive (removed values just disappear from the picker).
      </Banner>

      {AXES.map((axis) => (
        <section key={axis} className="border-t border-border pt-6">
          <h2 className="font-serif text-2xl mb-1 capitalize">{axis}</h2>
          <p className="font-mono text-[11px] text-text-subtle mb-3">
            {origPositions[axis].length} value(s)
          </p>
          <ul className="flex flex-col gap-2">
            {draft[axis].map((label, i) => {
              const k = keys[axis][i];
              const original = k.startsWith("o:") ? k.slice(2) : null;
              const refs = original ? counts[axis]?.[original] ?? 0 : 0;
              return (
                <li key={k} className="flex items-center gap-2">
                  <TextInput
                    value={label}
                    onChange={(e) => update(axis, i, e.target.value)}
                    className="flex-1"
                  />
                  {original ? (
                    <span className="font-mono text-[10px] text-text-muted w-24 text-right">
                      {refs} ref{refs === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-text-muted w-24 text-right">new</span>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(axis, i)}
                    className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
          <Button type="button" variant="secondary" onClick={() => add(axis)} className="mt-3">
            + Add
          </Button>
        </section>
      ))}

      <div className="border-t border-border pt-6 sticky bottom-0 bg-bg pb-2">
        <Button onClick={save} disabled={pending}>
          {pending ? "..." : "Save axes"}
        </Button>
      </div>
    </div>
  );
}
