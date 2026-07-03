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

/** Column count from the container's own width (not the viewport). */
function useColumns(ref: React.RefObject<HTMLDivElement | null>) {
  const [n, setN] = useState(3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      setN(w < 520 ? 1 : w < 820 ? 2 : 3);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return n;
}

/**
 * Row-wise masonry gallery (cosmos.so / Pinterest). Items flow left-to-right and
 * wrap, so the order you set is preserved (unlike CSS column-fill). Videos are
 * native YouTube/Vimeo embeds; every tile opens a full-screen lightbox that
 * arrows through the whole set — images and videos alike.
 */
export function MediaGallery({ items }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const ncols = useColumns(ref);

  // Round-robin distribution keeps strict row-wise reading order (0,1,2 / 3,4,5)
  // while each column stays a clean vertical stack with no balancing gaps.
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
              <Tile key={i} item={items[i]} onOpen={() => setOpen(i)} />
            ))}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <Lightbox
            item={items[open]}
            index={open}
            count={items.length}
            onClose={close}
            onNext={() => step(1)}
            onPrev={() => step(-1)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const RADIUS = "6px";

function Tile({ item, onOpen }: { item: MediaItemType; onOpen: () => void }) {
  return (
    <figure style={{ margin: 0 }}>
      {isEmbed(item) ? (
        <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", background: "var(--surface)", borderRadius: RADIUS, overflow: "hidden" }}>
          <iframe
            src={item.link}
            title={item.caption ?? ""}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
          />
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
          onClick={onOpen} style={{ display: "block", width: "100%", height: "auto", borderRadius: RADIUS, cursor: "zoom-in" }} />
      ) : (
        <button type="button" onClick={onOpen} aria-label={`Zoom: ${item.caption ?? "image"}`}
          style={{ display: "block", width: "100%", padding: 0, border: "none", background: "transparent", cursor: "zoom-in", lineHeight: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.link} alt={item.caption ?? ""} loading="lazy" decoding="async"
            style={{ display: "block", width: "100%", height: "auto", borderRadius: RADIUS }} />
        </button>
      )}
      {/* Caption slot is always rendered (min-height reserves one line) so tiles
          with and without captions keep the same vertical rhythm. */}
      <figcaption style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, padding: "8px 2px 0", minHeight: "28px" }}>
        {item.caption}
        {item.caption && item.sourceLink && (
          <>
            {" · "}
            <a href={item.sourceLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>source ↗</a>
          </>
        )}
      </figcaption>
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
