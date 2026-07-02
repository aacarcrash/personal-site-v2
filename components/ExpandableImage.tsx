"use client";

// A case-study image that expands to a full-screen lightbox on click.
// Thumbnail uses next/image; the lightbox uses a plain <img> for full res.

import Image from "next/image";
import { useState, useEffect } from "react";

export function ExpandableImage({
  src,
  alt,
  caption,
  aspectRatio = "16 / 10",
  heightPx,
  maxWidth,
  fit = "contain",
  sizes = "(max-width: 820px) 100vw, 50vw",
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: string;
  heightPx?: number;
  maxWidth?: number;
  fit?: "cover" | "contain";
  sizes?: string;
  priority?: boolean;
  /** When set, the class is expected to control the box size (see .cs-decision-img). */
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Expand image: ${alt}`}
        className={className}
        style={{
          display: "block",
          width: "100%",
          padding: 0,
          margin: 0,
          border: "0.5px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
          background: "#141210",
          cursor: "zoom-in",
          position: "relative",
          ...(maxWidth ? { maxWidth: `${maxWidth}px`, marginInline: "auto" } : {}),
          // With a size-controlling class, the CSS owns the box dimensions.
          ...(className ? {} : heightPx ? { height: `${heightPx}px` } : { aspectRatio }),
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          style={{ objectFit: fit }}
          priority={priority}
        />
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "40px",
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "100%",
              maxHeight: "86vh",
              objectFit: "contain",
              borderRadius: "6px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          />
          {caption ? (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                maxWidth: "620px",
              }}
            >
              {caption}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
