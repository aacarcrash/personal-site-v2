type Point = { x: number; y: number };

export type Blob = {
  /** Center of the ellipse. */
  cx: number;
  cy: number;
  /** Semi-major and semi-minor axes (after padding). */
  rx: number;
  ry: number;
  /** Rotation angle in degrees, applied around (cx, cy). */
  rotation: number;
};

/**
 * Fit a smooth ellipse around a cluster of points using PCA on the
 * point-cloud's covariance matrix. Inspired by the wells in
 * giacomo.website — wells are always clean ovals that follow the
 * spread/orientation of the cluster.
 *
 * The eigenvectors of the 2D covariance matrix give the principal
 * axes (orientation), the eigenvalues give the variance along each
 * axis. We scale the axes by a factor and add padding so projects
 * sit comfortably inside the ellipse.
 */
export function fitBlob(
  points: Point[],
  padding = 60,
  maxRadius = 240,
): Blob | null {
  const n = points.length;
  if (n === 0) return null;

  if (n === 1) {
    return { cx: points[0].x, cy: points[0].y, rx: padding, ry: padding, rotation: 0 };
  }

  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  const cx = sx / n;
  const cy = sy / n;

  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - cx;
    const dy = p.y - cy;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  // Use n (not n-1) — these are population stats for layout, not inference.
  sxx /= n;
  syy /= n;
  sxy /= n;

  // Eigenvalues of [[sxx, sxy], [sxy, syy]]
  const half = (sxx + syy) / 2;
  const disc = Math.sqrt(((sxx - syy) / 2) ** 2 + sxy * sxy);
  const eig1 = half + disc; // larger
  const eig2 = Math.max(half - disc, 0); // smaller (clamp tiny negatives from float)

  // Eigenvector angle for the larger eigenvalue.
  let angle = 0;
  if (Math.abs(sxy) > 1e-9) {
    angle = Math.atan2(eig1 - sxx, sxy);
  } else if (syy > sxx) {
    angle = Math.PI / 2;
  }

  // Scale: ~2.0σ covers ~95% of a 2D Gaussian; we use a slightly tighter
  // factor and let `padding` handle the visual breathing room.
  const k = 1.9;
  let rx = k * Math.sqrt(eig1) + padding;
  let ry = k * Math.sqrt(eig2) + padding;
  // Clamp so that "spread-out" tags (whose projects are scattered because
  // they're all multi-tag and pulled by other attractors) don't produce
  // a blob that engulfs the canvas. Some projects will fall outside the
  // clamped ellipse — that's the honest signal that the tag has no
  // independent cluster, only overlap with other concerns.
  rx = Math.min(rx, maxRadius);
  ry = Math.min(ry, maxRadius);

  return {
    cx,
    cy,
    rx,
    ry,
    rotation: (angle * 180) / Math.PI,
  };
}

/**
 * Pick a label position for the blob, preferring above the ellipse but
 * flipping below if it would go off the canvas top. The label x is
 * clamped to keep the full text inside the canvas.
 */
export function blobLabelAnchor(
  blob: Blob,
  labelWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  gap = 22,
  margin = 12,
): Point {
  const a = (blob.rotation * Math.PI) / 180;
  // Topmost/bottommost Y extent of the rotated ellipse (in world coords).
  const yExtent = Math.sqrt(
    blob.rx * blob.rx * Math.sin(a) ** 2 + blob.ry * blob.ry * Math.cos(a) ** 2,
  );
  const above = blob.cy - yExtent - gap;
  const below = blob.cy + yExtent + gap;
  // Prefer above; flip to below if above clips the top edge.
  const y = above < margin + 12 ? below : above;
  const halfW = labelWidth / 2;
  const minX = margin + halfW;
  const maxX = canvasWidth - margin - halfW;
  const x = Math.max(minX, Math.min(maxX, blob.cx));
  // Clamp y to the bottom edge too, in case `below` goes off-screen.
  const clampedY = Math.min(canvasHeight - margin, Math.max(margin + 12, y));
  return { x, y: clampedY };
}
