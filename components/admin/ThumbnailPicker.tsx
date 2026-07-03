"use client";

import type { MediaItem } from "@/data/types";

/** Derive a preview image URL for a media item, or null if we can't. */
function previewFor(item: MediaItem): string | null {
  if (item.type === "image" && item.link) return item.link;
  // YouTube embed/watch/short → poster frame
  const m = item.link.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  if (m) return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
  // Local video → optimizer's poster sibling, if any
  if (/\.(mp4|webm)$/.test(item.link)) return item.link.replace(/\.(mp4|webm)$/, ".poster.webp");
  return null;
}

/**
 * Pick a project's thumbnail from the media it already has — no re-upload or
 * hand-typed path needed. Clicking a tile sets `value`; the active one is ringed.
 */
export function ThumbnailPicker({
  media,
  value,
  onChange,
}: {
  media: MediaItem[];
  value: string;
  onChange: (link: string) => void;
}) {
  const options = media
    .map((m) => ({ item: m, preview: previewFor(m) }))
    .filter((o): o is { item: MediaItem; preview: string } => o.preview !== null);

  if (options.length === 0) {
    return (
      <p className="font-mono text-[11px] text-text-subtle">
        Add media below, then pick a thumbnail from it here.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] text-text-subtle">Or pick from this project&apos;s media:</p>
      <div className="flex flex-wrap gap-2">
        {options.map(({ item, preview }, i) => {
          const active = preview === value || item.link === value;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(preview)}
              title={item.caption ?? item.link}
              aria-pressed={active}
              className={`relative h-16 w-24 overflow-hidden border ${
                active ? "border-text ring-1 ring-text" : "border-border hover:border-text"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={item.caption ?? ""} className="h-full w-full object-cover" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
