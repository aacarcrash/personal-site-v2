/**
 * Map a media path to its compressed thumbnail variant if one exists.
 * GIFs get a .thumb.webp sibling extracted by scripts/extract-gif-thumbs.py.
 *
 * For non-GIF images, returns the path unchanged — Next.js Image already
 * resizes via the on-demand image optimizer (sized via the `sizes` prop).
 *
 * For external URLs (vimeo/youtube), returns empty string — caller treats
 * those as placeholders.
 */
export function thumbFor(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return "";
  if (path.toLowerCase().endsWith(".gif")) {
    return path.replace(/\.gif$/i, ".thumb.webp");
  }
  return path;
}
