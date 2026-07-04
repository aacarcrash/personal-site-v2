"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem as MediaItemType } from "@/data/types";

type Props = { items: MediaItemType[] };

function isExternal(link: string) {
  return /^https?:\/\//i.test(link);
}
function isLocalVideo(link: string) {
  return link.endsWith(".mp4") || link.endsWith(".webm");
}
function isEmbed(item: MediaItemType) {
  return item.type === "video" && isExternal(item.link) && !isLocalVideo(item.link);
}

/** Column count + column width from the container's own width. */
function useLayout(ref: React.RefObject<HTMLDivElement | null>) {
  const [s, setS] = useState({ ncols: 3, colW: 400 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const ncols = w < 520 ? 1 : w < 820 ? 2 : 3;
      const colW = Math.floor((w - (ncols - 1) * 16) / ncols);
      setS((prev) => (prev.ncols === ncols && prev.colW === colW ? prev : { ncols, colW }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return s;
}

/**
 * Row-wise masonry gallery. Items wrap predictably (item N -> column N % cols),
 * and a max-height cap keeps a single very-tall portrait from creating a long
 * hanging tail (the full image still opens in the lightbox). Row and column gaps
 * are both 16px. Videos are native YouTube/Vimeo embeds; every tile opens the
 * lightbox, which arrows through the whole set.
 */
export function MediaGallery({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { ncols, colW } = useLayout(ref);
  const capPx = Math.round(colW * 1.5); // portrait tiles cropped past 2:3

  const columns = useMemo(() => {
    const cols: number[][] = Array.from({ length: ncols }, () => []);
    items.forEach((_, i) => cols[i % ncols].push(i));
    return cols;
  }, [items, ncols]);

  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length]
  );
  useEffect(() => {
    if (open === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  if (items.length === 0) return null;

  return (
    <>
      <div ref={ref} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
            {col.map((i) => (
              <Tile key={i} item={items[i]} capPx={capPx} onOpen={() => setOpen(i)} />
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <Lightbox item={items[open]} index={open} count={items.length} onClose={close} onNext={() => step(1)} onPrev={() => step(-1)} />
        )}
      </AnimatePresence>
    </>
  );
}

const RADIUS = "6px";

function Tile({ item, capPx, onOpen }: { item: MediaItemType; capPx: number; onOpen: () => void }) {
  return (
    <figure style={{ margin: 0 }}>
      {isEmbed(item) ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "var(--surface)", borderRadius: RADIUS, overflow: "hidden" }}>
          <iframe src={item.link} title={item.caption ?? ""} loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} />
          <button type="button" onClick={onOpen} aria-label="Open full screen" title="Full screen"
            style={{ position: "absolute", top: "8px", right: "8px", width: "30px", height: "30px", borderRadius: "5px",
              background: "color-mix(in srgb, var(--bg) 55%, transparent)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              border: "1px solid var(--border)", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      ) : isLocalVideo(item.link) ? (
        <video src={item.link} autoPlay loop muted playsInline preload="metadata" aria-label={item.caption ?? "video"}
          onClick={onOpen} style={{ display: "block", width: "100%", height: "auto", maxHeight: capPx, objectFit: "cover", borderRadius: RADIUS, cursor: "zoom-in" }} />
      ) : (
        <button type="button" onClick={onOpen} aria-label={`Zoom: ${item.caption ?? "image"}`}
          style={{ display: "block", width: "100%", padding: 0, border: "none", background: "transparent", cursor: "zoom-in", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.link} alt={item.caption ?? ""} loading="lazy" decoding="async"
            style={{ display: "block", width: "100%", height: "auto", maxHeight: capPx, objectFit: "cover", borderRadius: RADIUS }} />
        </button>
      )}
      {item.caption && (
        <figcaption style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, paddingTop: "8px" }}>
          {item.caption}
          {item.sourceLink && (
            <>
              {" · "}
              <a href={item.sourceLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>source ↗</a>
            </>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function Lightbox({ item, index, count, onClose, onNext, onPrev }: {
  item: MediaItemType; index: number; count: number; onClose: () => void; onNext: () => void; onPrev: () => void;
}) {
  const embed = isEmbed(item);
  const localVid = isLocalVideo(item.link);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "color-mix(in srgb, var(--bg) 92%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", cursor: "zoom-out" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100%", cursor: "default" }}>
        {embed ? (
          <div style={{ width: "min(92vw, 1280px)", aspectRatio: "16 / 9", maxHeight: "calc(100vh - 140px)" }}>
            <iframe src={item.link} title={item.caption ?? ""} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen
              style={{ width: "100%", height: "100%", border: 0, borderRadius: RADIUS }} />
          </div>
        ) : localVid ? (
          <video src={item.link} controls autoPlay loop playsInline style={{ maxWidth: "100%", maxHeight: "calc(100vh - 140px)", borderRadius: RADIUS }} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.link} alt={item.caption ?? ""} style={{ maxWidth: "100%", maxHeight: "calc(100vh - 140px)", width: "auto", height: "auto", objectFit: "contain", borderRadius: RADIUS }} />
        )}
      </div>
      {(item.caption || count > 1) && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: "14px", color: "var(--text-muted)", cursor: "default", textAlign: "center", maxWidth: "80vw" }}>
          {item.caption && <span style={{ fontStyle: "italic" }}>{item.caption}</span>}
          {count > 1 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{index + 1} / {count}</span>}
        </div>
      )}
      <button onClick={onClose} aria-label="Close" style={{ ...btn, top: "20px", right: "20px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      {count > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous" style={{ ...btn, top: "50%", left: "16px", transform: "translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next" style={{ ...btn, top: "50%", right: "16px", transform: "translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}
    </motion.div>
  );
}

const btn: React.CSSProperties = {
  position: "fixed", width: "40px", height: "40px", borderRadius: "50%",
  background: "color-mix(in srgb, var(--bg) 70%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid var(--border)", zIndex: 210,
};
