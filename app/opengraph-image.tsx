import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { projects } from "@/data/projects";

// Node runtime (not edge): we read the featured thumbnails off disk and inline
// them as data URIs. Edge can't touch the filesystem — that (plus generic
// system fonts) is why the previous card looked like AI slop.
export const alt = "Aakarsh Singh — Product Engineer & New Media Artist";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// A montage of works that echoes the homepage AxisGrid — the thumbnails are the
// only colour on an otherwise monochrome card, exactly the site's design
// language. Curated art-forward with the flagship (Mare) leading. Edit this
// list to re-curate the card; it regenerates automatically.
const MONTAGE = [
  "mare",
  "land",
  "latent-space",
  "to-water-a-dying-garden",
  "abandoned-hotels-of-zangsti",
  "electronicos-fantasticos",
  "cryoponics",
  "mutek-ae",
];

const THUMBS: string[] = MONTAGE.map((slug) => {
  const p = projects.find((x) => x.type === "project" && x.slug === slug);
  return p && "thumbnail" in p ? p.thumbnail : undefined;
})
  .filter((t): t is string => Boolean(t))
  .map((t) => t.replace(/^\//, "")); // "/images/..." -> "images/..." for join()

function mime(path: string) {
  return path.endsWith(".png") ? "image/png" : "image/jpeg";
}

async function thumbDataUri(rel: string): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), "public", rel));
    return `data:${mime(rel)};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

// Fetch only the glyphs we need from Google Fonts (the documented next/og
// pattern). Returns null on failure so the card still renders in a system font.
async function loadFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(
      text,
    )}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
    if (!src) return null;
    return await (await fetch(src[1])).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image() {
  const [thumbs, serif, mono] = await Promise.all([
    Promise.all(THUMBS.map(thumbDataUri)),
    loadFont("Instrument+Serif", "Aakarsh Singh"),
    loadFont(
      "JetBrains+Mono",
      "Product Engineer & New Media Artist aakarsh.dev",
    ),
  ]);

  const fonts = [
    ...(serif ? [{ name: "Instrument Serif", data: serif, weight: 400 as const }] : []),
    ...(mono ? [{ name: "JetBrains Mono", data: mono, weight: 400 as const }] : []),
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#FAFAFA",
        }}
      >
        {/* Montage grid echoing the homepage AxisGrid: a 4x2 mosaic of works,
            small gaps letting the light background show through like the grid's
            gutters. Fills the frame — no dead whitespace. */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignContent: "center",
            gap: 8,
            padding: "0 32px",
          }}
        >
          {thumbs.map((src, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                width: 278,
                height: 196,
                overflow: "hidden",
                border: "1px solid #EBEBEB",
              }}
            >
              {src ? (
                <img
                  src={src}
                  width={278}
                  height={196}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "#EDEDED" }} />
              )}
            </div>
          ))}
        </div>

        {/* Caption band */}
        <div
          style={{
            height: 196,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 56px 44px",
            borderTop: "1px solid #E5E5E5",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                fontFamily: serif ? "Instrument Serif" : "serif",
                fontSize: 76,
                lineHeight: 1,
                color: "#111111",
                letterSpacing: "-1px",
              }}
            >
              Aakarsh Singh
            </span>
            <span
              style={{
                fontFamily: mono ? "JetBrains Mono" : "monospace",
                fontSize: 21,
                color: "#666666",
                letterSpacing: "0.3px",
              }}
            >
              Product Engineer & New Media Artist
            </span>
          </div>
          <span
            style={{
              fontFamily: mono ? "JetBrains Mono" : "monospace",
              fontSize: 21,
              color: "#999999",
              paddingBottom: 6,
            }}
          >
            aakarsh.dev
          </span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
