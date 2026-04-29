"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProjectOrCluster } from "@/data/types";

const PLACEHOLDER_GRADIENTS: Record<string, string> = {
  mare: "linear-gradient(135deg, #1a1a1a 0%, #333 50%, #1f1f1f 100%)",
  "date-0-0": "linear-gradient(135deg, #1a1a2e 0%, #2a2a4e 50%, #1a1a3e 100%)",
  "aa-warsaw": "linear-gradient(135deg, #2a2a1a 0%, #3a3a2a 50%, #2a2a1a 100%)",
};

function isPlaceholder(thumbnail: string): boolean {
  if (thumbnail === "" || thumbnail.includes("/placeholder.")) return true;
  // External URLs (vimeo/youtube embeds etc.) aren't images we can render
  if (/^https?:\/\//i.test(thumbnail)) return true;
  return false;
}

type Props = {
  item: ProjectOrCluster;
  onClusterClick?: (cluster: Extract<ProjectOrCluster, { type: "cluster" }>) => void;
};

export function ProjectCell({ item, onClusterClick }: Props) {
  const isCluster = item.type === "cluster";
  const placeholder = isPlaceholder(item.thumbnail);

  // Sketch clusters render smaller than full projects
  const width = isCluster ? 56 : 80;
  const height = isCluster ? 38 : 54;

  const inner = (
    <motion.div
      layout
      layoutId={item.id}
      whileHover={{ scale: 1.4, zIndex: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        position: "relative",
        width,
        height,
        borderRadius: "3px",
        overflow: "hidden",
        background: placeholder
          ? PLACEHOLDER_GRADIENTS[item.id] ?? "var(--surface)"
          : "var(--surface)",
        cursor: "pointer",
      }}
      title={item.name}
    >
      {!placeholder && (
        <Image
          src={item.thumbnail}
          alt={item.name}
          fill
          sizes="120px"
          style={{ objectFit: "cover" }}
        />
      )}
      {isCluster && (
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "var(--text)",
            color: "var(--bg)",
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid var(--bg)",
          }}
        >
          {item.count}
        </span>
      )}
    </motion.div>
  );

  if (isCluster) {
    return (
      <button
        type="button"
        onClick={() => onClusterClick?.(item)}
        style={{ display: "block", lineHeight: 0 }}
        aria-label={`View ${item.name} cluster (${item.count} pieces)`}
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={`/projects/${(item as Extract<ProjectOrCluster, { type: "project" }>).slug}`}
      style={{ display: "block", lineHeight: 0 }}
      aria-label={item.name}
    >
      {inner}
    </Link>
  );
}
