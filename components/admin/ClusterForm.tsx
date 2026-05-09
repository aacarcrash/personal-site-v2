"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput, Button, Banner } from "./ui";
import { MediaListEditor } from "./MediaListEditor";
import { AxisMultiSelect } from "./AxisMultiSelect";
import type { Cluster, ClusterItem, AxesConfig, AxisKey } from "@/data/types";
import {
  saveClusterAction,
  createClusterAction,
  deleteClusterAction,
} from "@/app/admin/_actions/projects";

function emptyCluster(): Cluster {
  return {
    id: "",
    name: "",
    type: "cluster",
    axes: { year: "", medium: [], concern: [], technology: [], context: [] },
    thumbnail: "",
    count: 0,
    items: [],
  };
}

export function ClusterForm({
  cluster,
  axes,
  mode,
}: {
  cluster?: Cluster;
  axes: AxesConfig;
  mode: "edit" | "create";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Cluster>(cluster ?? emptyCluster());
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function patch<K extends keyof Cluster>(key: K, value: Cluster[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function patchAxis(key: AxisKey, value: string | string[]) {
    setDraft((d) => ({ ...d, axes: { ...d.axes, [key]: value } }));
  }
  function updateItem(i: number, p: Partial<ClusterItem>) {
    const next = [...draft.items];
    next[i] = { ...next[i], ...p };
    patch("items", next);
    patch("count", next.length);
  }
  function removeItem(i: number) {
    const next = draft.items.filter((_, j) => j !== i);
    patch("items", next);
    patch("count", next.length);
  }
  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= draft.items.length) return;
    const next = [...draft.items];
    [next[i], next[j]] = [next[j], next[i]];
    patch("items", next);
  }
  function addItem() {
    const next = [...draft.items, { title: "", link: "", type: "image" as const }];
    patch("items", next);
    patch("count", next.length);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data: Cluster = { ...draft, count: draft.items.length };
    startTransition(async () => {
      const res = await (mode === "edit" ? saveClusterAction(data) : createClusterAction(data));
      if ("error" in res) {
        setMsg({ tone: "error", text: res.error });
      } else {
        setMsg({ tone: "success", text: mode === "edit" ? "Saved." : "Created." });
        if (mode === "create") router.push(`/admin/clusters/${data.id}`);
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (mode !== "edit") return;
    if (!confirm(`Delete cluster "${draft.name}"?`)) return;
    startTransition(async () => {
      const res = await deleteClusterAction(draft.id);
      if ("error" in res) setMsg({ tone: "error", text: res.error });
      else {
        router.push("/admin/clusters");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {msg ? <Banner tone={msg.tone}>{msg.text}</Banner> : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="ID"><TextInput value={draft.id} onChange={(e) => patch("id", e.target.value)} disabled={mode === "edit"} required /></Field>
        <Field label="Slug" hint="optional, defaults to id"><TextInput value={draft.slug ?? ""} onChange={(e) => patch("slug", e.target.value || undefined)} /></Field>
      </div>

      <Field label="Name"><TextInput value={draft.name} onChange={(e) => patch("name", e.target.value)} required /></Field>
      <Field label="Subtitle"><TextInput value={draft.subtitle ?? ""} onChange={(e) => patch("subtitle", e.target.value || undefined)} /></Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date"><TextInput value={draft.date ?? ""} onChange={(e) => patch("date", e.target.value || undefined)} /></Field>
        <Field label="Technology"><TextInput value={draft.technology ?? ""} onChange={(e) => patch("technology", e.target.value || undefined)} /></Field>
      </div>

      <Field label="Tools" hint="comma-separated">
        <TextInput
          value={(draft.tools ?? []).join(", ")}
          onChange={(e) => {
            const tools = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
            patch("tools", tools.length ? tools : undefined);
          }}
        />
      </Field>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-4">Axes</h2>
        <div className="flex flex-col gap-4">
          <Field label="Year">
            <select
              value={draft.axes.year}
              onChange={(e) => patchAxis("year", e.target.value)}
              className="border border-border bg-surface px-3 py-2 font-mono text-sm focus:outline-none focus:border-text"
            >
              <option value="">—</option>
              {axes.year.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <AxisMultiSelect label="Medium" axisKey="medium" values={axes.medium} current={draft.axes.medium} onChange={(v) => patchAxis("medium", v)} />
          <AxisMultiSelect label="Concern" axisKey="concern" values={axes.concern} current={draft.axes.concern} onChange={(v) => patchAxis("concern", v)} />
          <AxisMultiSelect label="Technology" axisKey="technology" values={axes.technology} current={draft.axes.technology} onChange={(v) => patchAxis("technology", v)} />
          <AxisMultiSelect label="Context" axisKey="context" values={axes.context} current={draft.axes.context} onChange={(v) => patchAxis("context", v)} />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-1">Thumbnail</h2>
        <MediaListEditor
          slug={draft.id || "misc"}
          single
          items={draft.thumbnail ? [{ link: draft.thumbnail, type: "image" }] : []}
          onChange={(items) => patch("thumbnail", items[0]?.link ?? "")}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-4">Items ({draft.items.length})</h2>
        <ul className="flex flex-col gap-2">
          {draft.items.map((it, i) => (
            <li key={i} className="border border-border p-3 flex gap-2 items-start">
              <div className="flex-1 flex flex-col gap-2">
                <TextInput value={it.title} onChange={(e) => updateItem(i, { title: e.target.value })} placeholder="title" />
                <TextInput value={it.link ?? ""} onChange={(e) => updateItem(i, { link: e.target.value || undefined })} placeholder="link (path or URL)" />
                <div className="flex gap-2">
                  <select
                    value={it.type ?? "image"}
                    onChange={(e) => updateItem(i, { type: e.target.value as ClusterItem["type"] })}
                    className="border border-border bg-surface px-2 py-2 font-mono text-xs"
                  >
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                  <TextInput
                    value={it.source ?? ""}
                    onChange={(e) => updateItem(i, { source: e.target.value || undefined })}
                    placeholder="source (optional)"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => moveItem(i, -1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↑</button>
                <button type="button" onClick={() => moveItem(i, 1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↓</button>
                <button type="button" onClick={() => removeItem(i)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">✕</button>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" variant="secondary" onClick={addItem} className="mt-3">
          + Add item
        </Button>
      </div>

      <div className="flex gap-3 border-t border-border pt-6 sticky bottom-0 bg-bg pb-2">
        <Button type="submit" disabled={pending}>{pending ? "..." : mode === "edit" ? "Save" : "Create"}</Button>
        {mode === "edit" ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>Delete</Button>
        ) : null}
      </div>
    </form>
  );
}
