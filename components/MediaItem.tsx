"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { MediaItem as MediaItemType } from "@/data/types";

type Props = {
  item: MediaItemType;
};

function isExternalEmbed(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

export function MediaItem({ item }: Props) {
  const [zoomed, setZoomed] = useState(false);
  const isImage = item.type === "image";
  const isExternal = isExternalEmbed(item.link);

  return (
    <figure style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 10",
          borderRadius: "6px",
          overflow: "hidden",
          background: "var(--surface)",
          position: "relative",
        }}
      >
        {isImage && !isExternal ? (
          <button
            onClick={() => setZoomed(true)}
            aria-label={`Zoom: ${item.caption ?? "image"}`}
            style={{
              width: "100%",
              height: "100%",
              padding: 0,
              cursor: "zoom-in",
              display: "block",
              position: "relative",
            }}
          >
            <Image
              src={item.link}
              alt={item.caption ?? ""}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ objectFit: "cover" }}
            />
          </button>
        ) : isImage && isExternal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.link}
            alt={item.caption ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          // Video — iframe for vimeo/youtube embeds
          <iframe
            src={item.link}
            title={item.caption ?? ""}
            allow="autoplay; fullscreen; picture-in-picture"
            style={{ width: "100%", height: "100%", border: 0 }}
          />
        )}
      </div>
      {item.caption && (
        <figcaption
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: "13px",
            color: "var(--text-muted)",
            textAlign: "center",
            fontStyle: "italic",
          }}
        >
          {item.caption}
          {item.sourceLink && (
            <>
              {" · "}
              <a
                href={item.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}
              >
                source ↗
              </a>
            </>
          )}
        </figcaption>
      )}

      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setZoomed(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "color-mix(in srgb, var(--bg) 90%, transparent)",
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
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1280px",
                aspectRatio: "16 / 10",
              }}
            >
              <Image
                src={item.link}
                alt={item.caption ?? ""}
                fill
                sizes="100vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  );
}
