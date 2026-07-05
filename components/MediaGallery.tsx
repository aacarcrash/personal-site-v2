"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem as MediaItemType } from "@/data/types";

type Props = { items: MediaItemType[]; maxCols?: number };

function isExternal(link: string) {
  return /^https?:\/\//i.test(link);
}
function isLocalVideo(link: string) {
  return link.endsWith(".mp4") || link.endsWith(".webm");
}
function isEmbed(item: MediaItemType) {
  return item.type === "video" && isExternal(item.link) && !isLocalVideo(item.link);
}

/** Column count + width from the container's own width. Targets ~360px columns
 *  (clamped 2–4) so tiles stay large and breathable — a portfolio has ~10 items,
 *  not the hundreds a denser Cosmos-style board is tuned for. */
const GAP = 20;
const TARGET_COL = 360;
function useLayout(ref: React.RefObject<HTMLDivElement | null>, maxCols: number) {
  const [s, setS] = useState({ ncols: 3, colW: 320 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const ncols = Math.max(2, Math.min(maxCols, Math.floor((w + GAP) / (TARGET_COL + GAP))));
      const colW = Math.floor((w - (ncols - 1) * GAP) / ncols);
      setS((prev) => (prev.ncols === ncols && prev.colW === colW ? prev : { ncols, colW }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, maxCols]);
  return s;
}

/**
 * Breathable masonry gallery, Cosmos-style: every tile shows the WHOLE image at
 * its natural aspect (no cropping), balanced across 2–6 equal columns by a greedy
 * shortest-column pass so the columns end near the same height. Videos autoplay
 * muted; embeds are native YouTube/Vimeo iframes; every tile opens the lightbox,
 * which arrows through the whole set.
 */
export function MediaGallery({ items, maxCols = 4 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { ncols, colW } = useLayout(ref, maxCols);
  const capPx = Math.round(colW * 1.4); // caps only extreme (9:16) verticals; also the pre-measure estimate

  // Measured tile heights, keyed by item index. Columns are equal width, so a
  // tile's height is identical in any column — measure once, reuse for balancing.
  const [heights, setHeights] = useState<Record<number, number>>({});
  const reportHeight = useCallback((i: number, h: number) => {
    setHeights((prev) => (Math.abs((prev[i] ?? 0) - h) < 0.5 ? prev : { ...prev, [i]: h }));
  }, []);

  // Greedy masonry: walk items in order, drop each into the currently shortest
  // column. Until a tile is measured we estimate its height (capPx), so the first
  // paint is close; once real heights arrive the columns rebalance once and stick.
  const columns = useMemo(() => {
    const cols: number[][] = Array.from({ length: ncols }, () => []);
    const colH = new Array(ncols).fill(0);
    items.forEach((_, i) => {
      let shortest = 0;
      for (let c = 1; c < ncols; c++) if (colH[c] < colH[shortest]) shortest = c;
      cols[shortest].push(i);
      colH[shortest] += (heights[i] ?? capPx) + GAP;
    });
    return cols;
  }, [items, ncols, heights, capPx]);

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
      <div ref={ref} style={{ display: "flex", gap: `${GAP}px`, alignItems: "flex-start" }}>
        {columns.map((col, ci) => (
          <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: `${GAP}px` }}>
            {col.map((i) => (
              <Tile key={i} item={items[i]} index={i} capPx={capPx} onOpen={() => setOpen(i)} onMeasure={reportHeight} />
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

/**
 * Optimized gallery image. Local files go through next/image (edge resize +
 * AVIF/WebP + srcset), so a grid tile downloads ~column-width pixels instead of
 * the multi-MB source. The nominal 1920x1440 is only a pre-load aspect hint —
 * `aspect-ratio: auto` means the real intrinsic ratio wins once loaded, so the
 * variable-height masonry is preserved. External URLs aren't in next.config
 * `remotePatterns` (the admin lets you paste them), so those render raw to avoid
 * a runtime crash; there are none in the data today.
 */
type ImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => void;
function GalleryImage({ src, alt, sizes, style, onLoad }: { src: string; alt: string; sizes: string; style: React.CSSProperties; onLoad?: ImgLoad }) {
  if (isExternal(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={onLoad} style={style} />;
  }
  return <Image src={src} alt={alt} width={1920} height={1440} sizes={sizes} onLoad={onLoad} style={style} />;
}

function Caption({ item }: { item: MediaItemType }) {
  if (!item.caption) return null;
  return (
    <figcaption style={{ fontFamily: "var(--font-inter)", fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic", lineHeight: 1.5, paddingTop: "8px" }}>
      {item.caption}
      {item.sourceLink && (
        <>
          {" · "}
          <a href={item.sourceLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}>source ↗</a>
        </>
      )}
    </figcaption>
  );
}

/** The media element (embed / video / image). A generous max-height (capPx)
 *  keeps an extreme 9:16 vertical from towering over the grid; anything shorter
 *  shows whole — object-fit only crops once the cap is actually hit. */
function MediaInner({ item, onOpen, sizes, capPx }: { item: MediaItemType; onOpen: () => void; sizes: string; capPx: number }) {
  if (isEmbed(item)) {
    return (
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
    );
  }
  if (isLocalVideo(item.link)) {
    return (
      <video src={item.link} autoPlay loop muted playsInline preload="metadata" aria-label={item.caption ?? "video"}
        onClick={onOpen} style={{ display: "block", width: "100%", height: "auto", maxHeight: capPx, objectFit: "cover", borderRadius: RADIUS, cursor: "zoom-in" }} />
    );
  }
  return (
    <button type="button" onClick={onOpen} aria-label={`Zoom: ${item.caption ?? "image"}`}
      style={{ display: "block", width: "100%", padding: 0, border: "none", background: "transparent", cursor: "zoom-in", lineHeight: 0 }}>
      <GalleryImage src={item.link} alt={item.caption ?? ""} sizes={sizes}
        style={{ display: "block", width: "100%", height: "auto", maxHeight: capPx, objectFit: "cover", borderRadius: RADIUS }} />
    </button>
  );
}

const MASONRY_SIZES = "(max-width: 540px) 48vw, (max-width: 1000px) 47vw, (max-width: 1500px) 31vw, 24vw";

/** Masonry tile: fills its column, reports its full rendered height for balancing. */
function Tile({ item, index, capPx, onOpen, onMeasure }: { item: MediaItemType; index: number; capPx: number; onOpen: () => void; onMeasure: (i: number, h: number) => void }) {
  const figRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = figRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => onMeasure(index, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, onMeasure]);
  return (
    <figure ref={figRef} style={{ margin: 0 }}>
      <MediaInner item={item} onOpen={onOpen} sizes={MASONRY_SIZES} capPx={capPx} />
      <Caption item={item} />
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
          <GalleryImage src={item.link} alt={item.caption ?? ""} sizes="92vw"
            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 140px)", width: "auto", height: "auto", objectFit: "contain", borderRadius: RADIUS }} />
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
