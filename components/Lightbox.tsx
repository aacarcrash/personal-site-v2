"use client";

// Shared lightbox: a framer-motion overlay with prev/next + keyboard nav, used by
// both the media gallery (images/video/embeds) and the Mare case study (images).
// The caller supplies the media element as children; this owns the chrome + cycle.

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/** Open-index state + wrap-around stepping + Escape/Arrow keyboard handling. */
export function useLightbox(count: number) {
  const [open, setOpen] = useState<number | null>(null);
  const openAt = useCallback((i: number) => setOpen(i), []);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null ? i : (i + dir + count) % count)),
    [count]
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
  return {
    open,
    openAt,
    close,
    next: useCallback(() => step(1), [step]),
    prev: useCallback(() => step(-1), [step]),
  };
}

export const lightboxBtn: CSSProperties = {
  position: "fixed", width: "40px", height: "40px", borderRadius: "50%",
  background: "color-mix(in srgb, var(--bg) 70%, transparent)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
  color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid var(--border)", zIndex: 210,
};

/** Overlay shell. Wrap in <AnimatePresence> at the call-site and render only when open. */
export function LightboxShell({
  index, count, caption, onClose, onPrev, onNext, children,
}: {
  index: number;
  count: number;
  caption?: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 200,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", cursor: "zoom-out",
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100%", cursor: "default" }}>
        {children}
      </div>
      {(caption || count > 1) && (
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "6px", alignItems: "center", fontFamily: "var(--font-inter)", fontSize: "14px", color: "var(--text-muted)", cursor: "default", textAlign: "center", maxWidth: "80vw" }}>
          {caption && <span style={{ fontStyle: "italic" }}>{caption}</span>}
          {count > 1 && <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>{index + 1} / {count}</span>}
        </div>
      )}
      <button onClick={onClose} aria-label="Close" style={{ ...lightboxBtn, top: "20px", right: "20px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
      </button>
      {count > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous" style={{ ...lightboxBtn, top: "50%", left: "16px", transform: "translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next" style={{ ...lightboxBtn, top: "50%", right: "16px", transform: "translateY(-50%)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}
    </motion.div>
  );
}
