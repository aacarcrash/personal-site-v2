"use client";

import { useState, useTransition } from "react";
import { Field, TextInput, Button, Banner } from "@/components/admin/ui";
import { saveFeaturedAction } from "@/app/admin/_actions/featured";
import type { Featured } from "@/data/types";

export function FeaturedEditor({
  initial,
  allProjects,
}: {
  initial: Featured;
  allProjects: { slug: string; name: string }[];
}) {
  const [draft, setDraft] = useState<Featured>(initial);
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [picker, setPicker] = useState("");

  const known = new Set(allProjects.map((p) => p.slug));

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.slugs.length) return;
    const slugs = [...draft.slugs];
    [slugs[i], slugs[j]] = [slugs[j], slugs[i]];
    setDraft({ ...draft, slugs });
  }
  function remove(i: number) {
    setDraft({ ...draft, slugs: draft.slugs.filter((_, j) => j !== i) });
  }
  function add() {
    if (!picker || draft.slugs.includes(picker)) return;
    setDraft({ ...draft, slugs: [...draft.slugs, picker] });
    setPicker("");
  }
  function save() {
    startTransition(async () => {
      const res = await saveFeaturedAction(draft);
      setMsg("error" in res ? { tone: "error", text: res.error } : { tone: "success", text: "Saved." });
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {msg ? <Banner tone={msg.tone}>{msg.text}</Banner> : null}

      <Field label="Columns (wide-screen)">
        <TextInput
          type="number"
          min={1}
          max={6}
          value={draft.columns}
          onChange={(e) => setDraft({ ...draft, columns: Number(e.target.value) || 3 })}
          className="max-w-[100px]"
        />
      </Field>

      <div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
          Featured slugs
        </span>
        <ul className="border-y border-border divide-y divide-border mt-2">
          {draft.slugs.map((slug, i) => {
            const proj = allProjects.find((p) => p.slug === slug);
            return (
              <li key={slug} className="flex items-center gap-3 py-3 px-2">
                <span className="font-mono text-[11px] text-text-muted w-4">{i + 1}</span>
                <span className="flex-1 font-serif text-lg">
                  {proj?.name ?? slug}
                </span>
                <span className="font-mono text-[11px] text-text-muted">{slug}</span>
                {!known.has(slug) ? (
                  <span className="font-mono text-[11px] text-text">⚠ unknown</span>
                ) : null}
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex gap-2">
        <select
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="flex-1 border border-border bg-surface px-3 py-2 font-mono text-sm focus:outline-none focus:border-text"
        >
          <option value="">— add a project —</option>
          {allProjects
            .filter((p) => !draft.slugs.includes(p.slug))
            .map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name} ({p.slug})
              </option>
            ))}
        </select>
        <Button type="button" variant="secondary" onClick={add}>
          + Add
        </Button>
      </div>

      <div className="border-t border-border pt-6">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
