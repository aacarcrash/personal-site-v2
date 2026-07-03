"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, TextInput, TextArea, Button, Checkbox, Banner } from "./ui";
import { MediaListEditor } from "./MediaListEditor";
import { ThumbnailPicker } from "./ThumbnailPicker";
import { BlocksEditor } from "./BlocksEditor";
import { AxisMultiSelect } from "./AxisMultiSelect";
import { CaseStudyEditor } from "./CaseStudyEditor";
import type { Project, AxesConfig, AxisKey, CaseStudy } from "@/data/types";
import {
  saveProjectAction,
  createProjectAction,
  deleteProjectAction,
} from "@/app/admin/_actions/projects";

const TIERS = ["case-study", "light", "art"] as const;

function emptyProject(): Project {
  return {
    id: "",
    slug: "",
    name: "",
    type: "project",
    axes: { year: "", medium: [], concern: [], technology: [], context: [] },
    thumbnail: "",
    subtitle: "",
    date: "",
    technology: "",
    description: [],
    media: [],
  };
}

export function ProjectForm({
  project,
  axes,
  mode,
}: {
  project?: Project;
  axes: AxesConfig;
  mode: "edit" | "create";
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Project>(project ?? emptyProject());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function patch<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function patchAxis(key: AxisKey, value: string | string[]) {
    setDraft((d) => ({ ...d, axes: { ...d.axes, [key]: value } }));
  }

  function setTools(input: string) {
    const tools = input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    patch("tools", tools.length ? tools : undefined);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const action = mode === "edit" ? saveProjectAction : createProjectAction;
      const res = await action(draft);
      if ("error" in res) {
        setMessage({ tone: "error", text: res.error });
      } else {
        setMessage({ tone: "success", text: mode === "edit" ? "Saved." : "Created." });
        if (mode === "create") {
          router.push(`/admin/projects/${draft.slug}`);
        }
        router.refresh();
      }
    });
  }

  function onDelete() {
    if (mode !== "edit") return;
    if (!confirm(`Delete "${draft.name}"? This cannot be undone (except via git).`)) return;
    startTransition(async () => {
      const res = await deleteProjectAction(draft.id);
      if ("error" in res) {
        setMessage({ tone: "error", text: res.error });
      } else {
        router.push("/admin/projects");
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {message ? <Banner tone={message.tone}>{message.text}</Banner> : null}

      <div className="grid grid-cols-2 gap-4">
        <Field label="ID" hint="immutable; used for URLs and ordering">
          <TextInput
            value={draft.id}
            onChange={(e) => patch("id", e.target.value)}
            disabled={mode === "edit"}
            required
          />
        </Field>
        <Field label="Slug" hint="URL path: /projects/[slug]">
          <TextInput
            value={draft.slug}
            onChange={(e) => patch("slug", e.target.value)}
            required
          />
        </Field>
      </div>

      <Field label="Name">
        <TextInput value={draft.name} onChange={(e) => patch("name", e.target.value)} required />
      </Field>

      <Field label="Subtitle" hint="One-line tagline shown in featured strip + project header">
        <TextInput value={draft.subtitle} onChange={(e) => patch("subtitle", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date" hint='freeform: "May 2024 — Dec 2024"'>
          <TextInput value={draft.date} onChange={(e) => patch("date", e.target.value)} />
        </Field>
        <Field label="Technology (display)" hint="freeform display string">
          <TextInput value={draft.technology} onChange={(e) => patch("technology", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role">
          <TextInput value={draft.role ?? ""} onChange={(e) => patch("role", e.target.value || undefined)} />
        </Field>
        <Field label="Company">
          <TextInput value={draft.company ?? ""} onChange={(e) => patch("company", e.target.value || undefined)} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Location">
          <TextInput value={draft.location ?? ""} onChange={(e) => patch("location", e.target.value || undefined)} />
        </Field>
        <Field label="Tier">
          <select
            value={draft.tier ?? ""}
            onChange={(e) => patch("tier", (e.target.value || undefined) as Project["tier"])}
            className="border border-border bg-surface px-3 py-2 font-mono text-sm focus:outline-none focus:border-text"
          >
            <option value="">—</option>
            {TIERS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Source code URL">
          <TextInput value={draft.sourceCode ?? ""} onChange={(e) => patch("sourceCode", e.target.value || undefined)} />
        </Field>
        <Field label="Live link">
          <TextInput value={draft.liveLink ?? ""} onChange={(e) => patch("liveLink", e.target.value || undefined)} />
        </Field>
      </div>

      <Field label="Tools" hint="comma-separated, e.g. Unreal Engine, TouchDesigner, Cinema4D">
        <TextInput
          value={(draft.tools ?? []).join(", ")}
          onChange={(e) => setTools(e.target.value)}
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
              {axes.year.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
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
        <p className="font-mono text-[11px] text-text-subtle mb-3">
          Path under /public, e.g. /images/mare/cover.webp
        </p>
        <MediaListEditor
          slug={draft.slug || "misc"}
          single
          items={draft.thumbnail ? [{ link: draft.thumbnail, type: "image" }] : []}
          onChange={(items) => patch("thumbnail", items[0]?.link ?? "")}
        />
        <div className="mt-3">
          <ThumbnailPicker
            media={draft.media}
            value={draft.thumbnail}
            onChange={(link) => patch("thumbnail", link)}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-4">Media</h2>
        <MediaListEditor
          slug={draft.slug || "misc"}
          items={draft.media}
          onChange={(items) => patch("media", items)}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-4">Description</h2>
        <BlocksEditor
          blocks={draft.description}
          onChange={(b) => patch("description", b)}
        />
      </div>

      <div className="border-t border-border pt-6">
        <h2 className="font-serif text-2xl mb-1">Case study</h2>
        <p className="font-mono text-[11px] text-text-subtle mb-4">
          Renders between the project hero and description on the detail page.
          Use for design-engineering decisions with optional walkthrough video and per-decision images.
        </p>
        <CaseStudyEditor
          value={draft.caseStudy}
          onChange={(v: CaseStudy | undefined) => patch("caseStudy", v)}
          slug={draft.slug || "misc"}
        />
      </div>

      <div className="flex gap-3 border-t border-border pt-6 sticky bottom-0 bg-bg pb-2">
        <Button type="submit" disabled={pending}>
          {pending ? "..." : mode === "edit" ? "Save" : "Create"}
        </Button>
        {mode === "edit" ? (
          <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
            Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
