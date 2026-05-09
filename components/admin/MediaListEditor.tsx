"use client";

import { useRef, useState } from "react";
import { TextInput, Button } from "./ui";
import type { MediaItem } from "@/data/types";
import { uploadMediaAction } from "@/app/admin/_actions/uploadMedia";

export function MediaListEditor({
  items,
  onChange,
  slug,
  single = false,
}: {
  items: MediaItem[];
  onChange: (next: MediaItem[]) => void;
  slug: string;
  single?: boolean;
}) {
  const [uploading, setUploading] = useState<number | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function update(i: number, patch: Partial<MediaItem>) {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i: number) {
    onChange(items.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }
  function addBlank() {
    onChange([...items, { link: "", type: "image" }]);
  }

  async function uploadOne(file: File): Promise<MediaItem | { error: string }> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const res = await uploadMediaAction(fd);
    if ("error" in res) return res;
    return {
      link: res.path,
      type: file.type.startsWith("video/") ? "video" : "image",
    };
  }

  async function handleNewFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading("new");
    try {
      const next: MediaItem[] = single ? [] : [...items];
      for (const file of Array.from(files)) {
        const res = await uploadOne(file);
        if ("error" in res) {
          setError(res.error);
          break;
        }
        next.push(res);
        if (single) break;
      }
      onChange(next);
    } finally {
      setUploading(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function replaceItemFile(i: number, file: File) {
    setError(null);
    setUploading(i);
    try {
      const res = await uploadOne(file);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      update(i, { link: res.link, type: res.type });
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 items-start border border-border p-3">
          <div className="flex-1 flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2">
              <TextInput
                value={item.link}
                onChange={(e) => update(i, { link: e.target.value })}
                placeholder="/images/slug/file.webp or https://…"
              />
              <PerItemUploadButton
                disabled={uploading !== null}
                pending={uploading === i}
                onFile={(f) => replaceItemFile(i, f)}
                label={item.link ? "Replace" : "Upload"}
              />
              <select
                value={item.type}
                onChange={(e) => update(i, { type: e.target.value as MediaItem["type"] })}
                className="border border-border bg-surface px-2 py-2 font-mono text-xs"
              >
                <option value="image">image</option>
                <option value="video">video</option>
              </select>
            </div>
            {!single ? (
              <>
                <TextInput
                  value={item.caption ?? ""}
                  onChange={(e) => update(i, { caption: e.target.value || undefined })}
                  placeholder="caption (optional)"
                />
                <TextInput
                  value={item.sourceLink ?? ""}
                  onChange={(e) => update(i, { sourceLink: e.target.value || undefined })}
                  placeholder="source link (optional)"
                />
              </>
            ) : null}
            {item.link ? (
              <p className="font-mono text-[10px] text-text-subtle break-all">{item.link}</p>
            ) : null}
          </div>
          {!single ? (
            <div className="flex flex-col gap-1">
              <button type="button" onClick={() => move(i, -1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↑</button>
              <button type="button" onClick={() => move(i, 1)} className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text">↓</button>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => remove(i)}
            className="font-mono text-[10px] px-2 py-1 border border-border hover:border-text self-start"
          >
            ✕
          </button>
        </div>
      ))}

      {error ? <p className="font-mono text-xs text-text">⚠ {error}</p> : null}

      <div className="flex gap-2 items-center flex-wrap">
        <PerItemUploadButton
          disabled={uploading !== null}
          pending={uploading === "new"}
          onFile={(file) => handleNewFiles(toFileList([file]))}
          label={single && items.length ? "Replace" : "+ Upload file"}
          multiple={!single}
          onFiles={!single ? (files) => handleNewFiles(files) : undefined}
          inputRef={fileRef}
        />
        {!single ? (
          <Button type="button" variant="secondary" onClick={addBlank}>
            + Manual entry
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function toFileList(files: File[]): FileList {
  const dt = new DataTransfer();
  for (const f of files) dt.items.add(f);
  return dt.files;
}

function PerItemUploadButton({
  onFile,
  onFiles,
  label,
  pending,
  disabled,
  multiple = false,
  inputRef: externalRef,
}: {
  onFile: (file: File) => void;
  onFiles?: (files: FileList) => void;
  label: string;
  pending?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const internalRef = useRef<HTMLInputElement>(null);
  const ref = externalRef ?? internalRef;
  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={disabled}
        className="font-mono text-[11px] uppercase tracking-wider px-3 py-2 border border-border hover:border-text disabled:opacity-40 whitespace-nowrap"
      >
        {pending ? "…" : label}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          if (multiple && onFiles) onFiles(files);
          else onFile(files[0]);
        }}
      />
    </>
  );
}
