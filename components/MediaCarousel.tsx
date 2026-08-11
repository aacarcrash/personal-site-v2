"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem as MediaItemType } from "@/data/types";

type Props = {
  items: MediaItemType[];
  /** Optional starting index */
  initialIndex?: number;
};

function isExternalEmbed(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

/**
 * Media carousel that respects each item's natural aspect ratio.
 * - Click thumbnails OR arrow buttons OR ←/→ keys to navigate
 * - Images shown via Next.js <Image> with intrinsic sizing (no forced crop)
 * - Videos render as iframes at 16:9
 * - Click image to zoom (full-screen modal)
 */
export function MediaCarousel({ items, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Don't hijack keys when the user is typing in a field
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (zoomed) setZoomed(false);
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (zoomed) setZoomed(false);
        prev();
      } else if (e.key === "Escape" && zoomed) {
        setZoomed(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, zoomed]);

  if (items.length === 0) return null;

  const current = items[index];
  const currentIsImage = current.type === "image";
  const currentIsExternal = isExternalEmbed(current.link);

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Stage: shows the active item at its natural ratio */}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: "400px",
          maxHeight: "75vh",
          background: "var(--surface)",
          borderRadius: "6px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {currentIsImage && !currentIsExternal ? (
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label={`Zoom: ${current.caption ?? "image"}`}
                style={{
                  display: "block",
                  cursor: "zoom-in",
                  padding: 0,
                  background: "transparent",
                  border: "none",
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  position: "relative",
                  lineHeight: 0,
                }}
              >
                {/* Use width:auto/height:auto so the natural aspect ratio is honored */}
                <Image
                  src={current.link}
                  alt={current.caption ?? ""}
                  width={1600}
                  height={1200}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "100%",
                    maxHeight: "75vh",
                    objectFit: "contain",
                  }}
                  priority={index === 0}
                />
              </button>
            ) : currentIsImage && currentIsExternal ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.link}
                alt={current.caption ?? ""}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : current.link.endsWith(".mp4") || current.link.endsWith(".webm") ? (
              // Local video file — use <video> with autoplay loop
              <video
                src={current.link}
                autoPlay
                loop
                muted
                playsInline
                controls={false}
                aria-label={current.caption ?? "video"}
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            ) : (
              // External embed (vimeo/youtube) — iframe at 16:9
              <div
                style={{
                  width: "min(100%, 1280px)",
                  aspectRatio: "16 / 9",
                  maxHeight: "75vh",
                }}
              >
                <iframe
                  src={current.link}
                  title={current.caption ?? ""}
                  allow="autoplay; fullscreen; picture-in-picture"
                  style={{ width: "100%", height: "100%", border: 0 }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Prev / next buttons */}
        {items.length > 1 && (
          <>
            <ArrowButton side="left" onClick={prev} />
            <ArrowButton side="right" onClick={next} />
          </>
        )}

        {/* Counter */}
        {items.length > 1 && (
          <span
            style={{
              position: "absolute",
              bottom: "12px",
              right: "16px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
              background: "color-mix(in srgb, var(--bg) 70%, transparent)",
              padding: "3px 8px",
              borderRadius: "3px",
              backdropFilter: "blur(4px)",
            }}
          >
            {index + 1} / {items.length}
          </span>
        )}
      </div>

      {/* Caption */}
      {current.caption && (
        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--text-muted)",
            textAlign: "center",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          {current.caption}
          {current.sourceLink && (
            <>
              {" · "}
              <a
                href={current.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline"
              >
                source ↗
              </a>
            </>
          )}
        </p>
      )}

      {/* Thumbnail strip */}
      {items.length > 1 && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "8px",
            scrollbarWidth: "thin",
          }}
        >
          {items.map((m, i) => {
            const isActive = i === index;
            const isLocalVideo = (m.link.endsWith(".mp4") || m.link.endsWith(".webm"));
            const thumbIsImage = m.type === "image" && !isExternalEmbed(m.link);
            // For local MP4s we generated a .poster.webp sibling — use that
            const posterSrc = isLocalVideo ? m.link.replace(/\.(mp4|webm)$/, ".poster.webp") : null;
            return (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to media ${i + 1}`}
                aria-current={isActive ? "true" : undefined}
                style={{
                  flexShrink: 0,
                  width: "84px",
                  height: "60px",
                  borderRadius: "3px",
                  overflow: "hidden",
                  background: "var(--surface)",
                  border: isActive
                    ? "1.5px solid var(--text)"
                    : "1px solid var(--border)",
                  padding: 0,
                  cursor: "pointer",
                  position: "relative",
                  opacity: isActive ? 1 : 0.55,
                  transition: "opacity 0.15s ease, border-color 0.15s ease",
                }}
              >
                {thumbIsImage ? (
                  <Image
                    src={m.link}
                    alt=""
                    fill
                    sizes="84px"
                    style={{ objectFit: "cover" }}
                  />
                ) : posterSrc ? (
                  <>
                    <Image
                      src={posterSrc}
                      alt=""
                      fill
                      sizes="84px"
                      style={{ objectFit: "cover" }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.9)",
                        textShadow: "0 0 4px rgba(0,0,0,0.6)",
                      }}
                      aria-hidden
                    >
                      ▶
                    </span>
                  </>
                ) : (
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                    }}
                  >
                    ▶
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomed && currentIsImage && !currentIsExternal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setZoomed(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "color-mix(in srgb, var(--bg) 92%, transparent)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px",
              cursor: "zoom-out",
            }}
          >
            <Image
              src={current.link}
              alt={current.caption ?? ""}
              width={2400}
              height={1800}
              sizes="100vw"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "calc(100vh - 64px)",
                objectFit: "contain",
              }}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      style={{
        position: "absolute",
        top: "50%",
        [side]: "12px",
        transform: "translateY(-50%)",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        background: "color-mix(in srgb, var(--bg) 70%, transparent)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: "var(--text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 10,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {side === "left" ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}
