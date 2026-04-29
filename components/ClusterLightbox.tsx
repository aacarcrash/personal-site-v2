"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import type { Cluster } from "@/data/types";

type Props = {
  cluster: Cluster | null;
  onClose: () => void;
};

export function ClusterLightbox({ cluster, onClose }: Props) {
  useEffect(() => {
    if (!cluster) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cluster, onClose]);

  return (
    <AnimatePresence>
      {cluster && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "color-mix(in srgb, var(--bg) 80%, transparent)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "64px 32px",
            overflowY: "auto",
          }}
        >
          <motion.article
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "920px",
              background: "var(--bg)",
              border: "0.5px solid var(--border)",
              borderRadius: "8px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            <header
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                paddingBottom: "16px",
                borderBottom: "0.5px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h2
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "32px",
                    color: "var(--text)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {cluster.name}
                </h2>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text-muted)",
                  }}
                >
                  {cluster.count} {cluster.count === 1 ? "piece" : "pieces"}
                  {cluster.technology ? ` · ${cluster.technology}` : ""}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  padding: "4px 8px",
                }}
              >
                ✕ ESC
              </button>
            </header>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
              {cluster.items.map((item, i) => {
                const isVideo = item.type === "video" || /^https?:\/\//i.test(item.link ?? "");
                return (
                  <figure
                    key={i}
                    style={{ display: "flex", flexDirection: "column", gap: "8px" }}
                  >
                    {isVideo && item.link ? (
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "16 / 9",
                          borderRadius: "4px",
                          overflow: "hidden",
                          background: "#000",
                        }}
                      >
                        <iframe
                          src={item.link}
                          title={item.title}
                          allow="autoplay; fullscreen; picture-in-picture"
                          style={{ width: "100%", height: "100%", border: 0 }}
                        />
                      </div>
                    ) : item.link ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.link}
                        alt={item.title}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: "4px",
                          background: "var(--surface)",
                        }}
                      />
                    ) : null}
                    <figcaption
                      style={{
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                      }}
                    >
                      {item.title}
                      {item.source && (
                        <>
                          {" · "}
                          <a
                            href={item.source}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "underline", textUnderlineOffset: "2px" }}
                          >
                            source ↗
                          </a>
                        </>
                      )}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
