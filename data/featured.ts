/**
 * Single source of truth for the homepage Featured strip.
 *
 * Edit `featuredSlugs` to reorder, swap, or change which projects are
 * featured. Edit `featuredColumns` to control how many tiles per row.
 */

/**
 * Ordered list of project slugs (matching `slug` in data/projects.ts).
 * The strip renders the first N tiles where N = featuredColumns × any
 * extra rows you want; here we render exactly featuredSlugs.length tiles.
 */
export const featuredSlugs: string[] = [
  "mare",
  "callback",
  "land",
];

/**
 * How many tiles per row on a wide screen. Tiles wrap to fewer columns
 * on narrower screens automatically.
 */
export const featuredColumns = 3;
