"use client";

import { useState, useTransition } from "react";
import { Button, Banner, TextInput, TextArea, Field } from "@/components/admin/ui";
import { saveCvAction } from "@/app/admin/_actions/cv";
import type { Cv, CvRole, CvShow, CvPress, CvAward, CvSkill } from "@/data/types";

const TABS = ["experience", "shows", "residencies", "teaching", "press", "education", "awards", "skills"] as const;
type Tab = typeof TABS[number];

const ROLE_TABS = new Set<Tab>(["experience", "residencies", "teaching", "education"]);

function emptyRow(tab: Tab): unknown {
  if (ROLE_TABS.has(tab)) return { title: "", org: "", date: "" } satisfies CvRole;
  if (tab === "shows") return { title: "", kind: "", venue: "", location: "", year: "" } satisfies CvShow;
  if (tab === "press") return { title: "", outlet: "", date: "" } satisfies CvPress;
  if (tab === "awards") return { name: "" } satisfies CvAward;
  if (tab === "skills") return { category: "", items: "" } satisfies CvSkill;
  return {};
}

export function CvEditor({ initial }: { initial: Cv }) {
  const [draft, setDraft] = useState<Cv>(initial);
  const [tab, setTab] = useState<Tab>("experience");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  function updateRow(i: number, patch: Record<string, unknown>) {
    setDraft((d) => {
      const arr = [...(d[tab] as unknown[])];
      arr[i] = { ...(arr[i] as object), ...patch };
      return { ...d, [tab]: arr } as Cv;
    });
  }
  function removeRow(i: number) {
    setDraft((d) => {
      const arr = (d[tab] as unknown[]).filter((_, j) => j !== i);
      return { ...d, [tab]: arr } as Cv;
    });
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    setDraft((d) => {
      const arr = [...(d[tab] as unknown[])];
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, [tab]: arr } as Cv;
    });
  }
  function addRow() {
    setDraft((d) => ({ ...d, [tab]: [...(d[tab] as unknown[]), emptyRow(tab)] }) as Cv);
  }
  function save() {
    startTransition(async () => {
      const res = await saveCvAction(draft);
      setMsg("error" in res ? { tone: "error", text: res.error } : { tone: "success", text: "Saved." });
    });
  }

  const rows = draft[tab] as unknown[];

  return (
    <div className="flex flex-col gap-6">
      {msg ? <Banner tone={msg.tone}>{msg.text}</Banner> : null}

      <nav className="flex flex-wrap gap-2 border-b border-border pb-3">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="font-mono text-xs uppercase tracking-wider px-3 py-1 border"
            style={
              t === tab
                ? { background: "var(--text)", color: "var(--bg)", borderColor: "var(--text)" }
                : undefined
            }
          >
            {t} ({(draft[t] as unknown[]).length})
          </button>
        ))}
      </nav>

      <ul className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <li key={i} className="border border-border p-3 flex gap-3 items-start">
            <span className="font-mono text-[11px] text-text-muted w-6 pt-2">{i + 1}</span>
            <div className="flex-1 flex flex-col gap-2">
              {ROLE_TABS.has(tab) ? (
                <RoleFields row={row as CvRole} onChange={(p) => updateRow(i, p)} />
              ) : tab === "shows" ? (
                <ShowFields row={row as CvShow} onChange={(p) => updateRow(i, p)} />
              ) : tab === "press" ? (
                <PressFields row={row as CvPress} onChange={(p) => updateRow(i, p)} />
              ) : tab === "awards" ? (
                <AwardFields row={row as CvAward} onChange={(p) => updateRow(i, p)} />
              ) : tab === "skills" ? (
                <SkillFields row={row as CvSkill} onChange={(p) => updateRow(i, p)} />
              ) : null}
            </div>
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↓</button>
              <button type="button" onClick={() => removeRow(i)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">✕</button>
            </div>
          </li>
        ))}
      </ul>

      <Button type="button" variant="secondary" onClick={addRow}>
        + Add {tab.replace(/s$/, "")}
      </Button>

      <div className="border-t border-border pt-6 sticky bottom-0 bg-bg pb-2">
        <Button onClick={save} disabled={pending}>
          {pending ? "..." : "Save CV"}
        </Button>
      </div>
    </div>
  );
}

function RoleFields({ row, onChange }: { row: CvRole; onChange: (p: Partial<CvRole>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Title"><TextInput value={row.title} onChange={(e) => onChange({ title: e.target.value })} /></Field>
        <Field label="Org"><TextInput value={row.org} onChange={(e) => onChange({ org: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Date"><TextInput value={row.date} onChange={(e) => onChange({ date: e.target.value })} /></Field>
        <Field label="Location"><TextInput value={row.location ?? ""} onChange={(e) => onChange({ location: e.target.value || undefined })} /></Field>
      </div>
      <Field label="Link"><TextInput value={row.link ?? ""} onChange={(e) => onChange({ link: e.target.value || undefined })} /></Field>
      <Field label="Bullets" hint="one per line">
        <TextArea
          value={(row.bullets ?? []).join("\n")}
          onChange={(e) => {
            const lines = e.target.value.split("\n").map((s) => s.trimEnd()).filter((s) => s.length > 0);
            onChange({ bullets: lines.length ? lines : undefined });
          }}
        />
      </Field>
    </>
  );
}

function ShowFields({ row, onChange }: { row: CvShow; onChange: (p: Partial<CvShow>) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Title"><TextInput value={row.title} onChange={(e) => onChange({ title: e.target.value })} /></Field>
        <Field label="Kind"><TextInput value={row.kind} onChange={(e) => onChange({ kind: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Venue"><TextInput value={row.venue} onChange={(e) => onChange({ venue: e.target.value })} /></Field>
        <Field label="Location"><TextInput value={row.location} onChange={(e) => onChange({ location: e.target.value })} /></Field>
        <Field label="Year"><TextInput value={row.year} onChange={(e) => onChange({ year: e.target.value })} /></Field>
      </div>
    </>
  );
}

function PressFields({ row, onChange }: { row: CvPress; onChange: (p: Partial<CvPress>) => void }) {
  return (
    <>
      <Field label="Title"><TextInput value={row.title} onChange={(e) => onChange({ title: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Outlet"><TextInput value={row.outlet} onChange={(e) => onChange({ outlet: e.target.value })} /></Field>
        <Field label="Date"><TextInput value={row.date} onChange={(e) => onChange({ date: e.target.value })} /></Field>
        <Field label="Link"><TextInput value={row.link ?? ""} onChange={(e) => onChange({ link: e.target.value || undefined })} /></Field>
      </div>
    </>
  );
}

function AwardFields({ row, onChange }: { row: CvAward; onChange: (p: Partial<CvAward>) => void }) {
  return (
    <div className="grid grid-cols-[2fr_1fr] gap-2">
      <Field label="Name"><TextInput value={row.name} onChange={(e) => onChange({ name: e.target.value })} /></Field>
      <Field label="Date"><TextInput value={row.date ?? ""} onChange={(e) => onChange({ date: e.target.value || undefined })} /></Field>
    </div>
  );
}

function SkillFields({ row, onChange }: { row: CvSkill; onChange: (p: Partial<CvSkill>) => void }) {
  return (
    <div className="grid grid-cols-[1fr_3fr] gap-2">
      <Field label="Category"><TextInput value={row.category} onChange={(e) => onChange({ category: e.target.value })} /></Field>
      <Field label="Items"><TextInput value={row.items} onChange={(e) => onChange({ items: e.target.value })} /></Field>
    </div>
  );
}
