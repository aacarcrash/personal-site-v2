"use client";

import { TextInput, TextArea, Button, Field } from "./ui";
import { MediaListEditor } from "./MediaListEditor";
import type { CaseStudy } from "@/data/types";

export function CaseStudyEditor({
  value,
  onChange,
  slug,
}: {
  value: CaseStudy | undefined;
  onChange: (next: CaseStudy | undefined) => void;
  slug: string;
}) {
  if (!value) {
    return (
      <div className="border border-border p-4">
        <p className="font-mono text-xs text-text-muted mb-3">
          No case-study data on this project.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={() =>
            onChange({
              decisions: [{ title: "", body: "" }],
            })
          }
        >
          + Enable case-study
        </Button>
      </div>
    );
  }

  function patch<K extends keyof CaseStudy>(key: K, v: CaseStudy[K]) {
    onChange({ ...value!, [key]: v });
  }

  function updateDecision(i: number, p: Partial<CaseStudy["decisions"][number]>) {
    const decisions = [...value!.decisions];
    decisions[i] = { ...decisions[i], ...p };
    onChange({ ...value!, decisions });
  }
  function removeDecision(i: number) {
    onChange({ ...value!, decisions: value!.decisions.filter((_, j) => j !== i) });
  }
  function moveDecision(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value!.decisions.length) return;
    const decisions = [...value!.decisions];
    [decisions[i], decisions[j]] = [decisions[j], decisions[i]];
    onChange({ ...value!, decisions });
  }
  function addDecision() {
    onChange({ ...value!, decisions: [...value!.decisions, { title: "", body: "" }] });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border p-4 flex flex-col gap-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted">
          Walkthrough (optional)
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Section label" hint='e.g. "Product walkthrough"'>
            <TextInput
              value={value.walkthroughLabel ?? ""}
              onChange={(e) => patch("walkthroughLabel", e.target.value || undefined)}
            />
          </Field>
          <Field label="Duration tag" hint='e.g. "60–90s"'>
            <TextInput
              value={value.walkthroughDuration ?? ""}
              onChange={(e) => patch("walkthroughDuration", e.target.value || undefined)}
            />
          </Field>
        </div>
        <Field label="Walkthrough video" hint="path under /public, e.g. /images/mare/walkthrough.mp4">
          <MediaListEditor
            slug={slug || "misc"}
            single
            items={value.walkthroughVideo ? [{ link: value.walkthroughVideo, type: "video" }] : []}
            onChange={(items) => patch("walkthroughVideo", items[0]?.link || undefined)}
          />
        </Field>
      </div>

      <Field label="Decisions section label" hint='e.g. "Two decisions inside Mare"'>
        <TextInput
          value={value.decisionsLabel ?? ""}
          onChange={(e) => patch("decisionsLabel", e.target.value || undefined)}
        />
      </Field>

      <div className="flex flex-col gap-4">
        {value.decisions.map((d, i) => (
          <div key={i} className="border border-border p-4 flex gap-3 items-start">
            <span className="font-mono text-[11px] text-text-muted w-6 pt-2">{i + 1}</span>
            <div className="flex-1 flex flex-col gap-3">
              <Field label="Title">
                <TextInput value={d.title} onChange={(e) => updateDecision(i, { title: e.target.value })} />
              </Field>
              <Field label="Body">
                <TextArea
                  value={d.body}
                  onChange={(e) => updateDecision(i, { body: e.target.value })}
                  rows={8}
                />
              </Field>
              <Field label="Image" hint="optional — leave empty to show a placeholder">
                <MediaListEditor
                  slug={slug || "misc"}
                  single
                  items={d.image ? [{ link: d.image, type: "image" }] : []}
                  onChange={(items) => updateDecision(i, { image: items[0]?.link || undefined })}
                />
              </Field>
              <Field label="Image caption">
                <TextInput
                  value={d.imageCaption ?? ""}
                  onChange={(e) => updateDecision(i, { imageCaption: e.target.value || undefined })}
                />
              </Field>
              <Field label="Placeholder gradient" hint="CSS background; only used when no image set">
                <TextInput
                  value={d.placeholder ?? ""}
                  onChange={(e) => updateDecision(i, { placeholder: e.target.value || undefined })}
                  placeholder="linear-gradient(135deg, #1a1a1a, #2a2a2a)"
                />
              </Field>
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => moveDecision(i, -1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↑</button>
              <button type="button" onClick={() => moveDecision(i, 1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↓</button>
              <button type="button" onClick={() => removeDecision(i)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">✕</button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="secondary" onClick={addDecision}>
          + Add decision
        </Button>
        <Button type="button" variant="danger" onClick={() => onChange(undefined)}>
          Remove case-study
        </Button>
      </div>
    </div>
  );
}
