"use client";

import { TextInput, TextArea, Button } from "./ui";
import type { Block } from "@/data/types";

export function BlocksEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (next: Block[]) => void;
}) {
  function update(i: number, patch: Partial<Block>) {
    const next = [...blocks];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(blocks.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function add() {
    onChange([...blocks, { text: "" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => (
        <div key={i} className="border border-border p-3 flex gap-2 items-start">
          <div className="flex-1 flex flex-col gap-2">
            <TextInput
              value={b.header ?? ""}
              onChange={(e) => update(i, { header: e.target.value || undefined })}
              placeholder="header (optional)"
            />
            <TextArea
              value={b.text}
              onChange={(e) => update(i, { text: e.target.value })}
              placeholder="paragraph text — inline HTML for links allowed"
            />
          </div>
          <div className="flex flex-col gap-1">
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
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add}>
        + Add block
      </Button>
    </div>
  );
}
