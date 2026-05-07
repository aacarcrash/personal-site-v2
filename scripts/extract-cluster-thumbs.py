"""
Derive cluster thumbnails from the first item's video URL.

Walks data/projects.ts looking for `type: 'cluster'` entries with empty
or missing thumbnails, takes the first item's link, and:

  - YouTube embeds (https://www.youtube.com/embed/<ID>): pulls
    https://img.youtube.com/vi/<ID>/maxresdefault.jpg (falls back to
    hqdefault.jpg if 404).
  - Vimeo (player.vimeo.com/video/<ID>): hits the Vimeo oEmbed API and
    downloads the resulting thumbnail_url.

Saves to public/images/clusters/<cluster-id>.jpg. Prints a TS-ready
patch suggestion for each cluster so you can update data/projects.ts
by hand.

Idempotent — skips clusters that already have a thumbnail file.

Run:
    python scripts/extract-cluster-thumbs.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parent.parent
PROJECTS_TS = ROOT / "data" / "projects.ts"
OUT_DIR = ROOT / "public" / "images" / "clusters"


def parse_clusters(source: str) -> list[dict]:
    """Hacky-but-fine TS parser: find each `{ id: ... type: 'cluster' ... items: [...] }`."""
    out = []
    # Match a cluster block, lazily
    pattern = re.compile(
        r"\{\s*id:\s*\"([^\"]+)\"[^{}]*?type:\s*'cluster'.*?items:\s*\[(.*?)\]\s*,?\s*\}",
        re.DOTALL,
    )
    for m in pattern.finditer(source):
        block = m.group(0)
        cluster_id = m.group(1)
        items_block = m.group(2)
        # Find current thumbnail
        thumb_m = re.search(r"thumbnail:\s*\"([^\"]*)\"", block)
        thumbnail = thumb_m.group(1) if thumb_m else ""
        # First item link
        link_m = re.search(r"link:\s*\"([^\"]+)\"", items_block)
        first_link = link_m.group(1) if link_m else ""
        out.append({
            "id": cluster_id,
            "thumbnail": thumbnail,
            "first_link": first_link,
        })
    return out


def youtube_id(url: str) -> str | None:
    m = re.search(r"youtube\.com/embed/([\w\-]+)", url)
    return m.group(1) if m else None


def vimeo_id(url: str) -> str | None:
    m = re.search(r"player\.vimeo\.com/video/(\d+)", url)
    return m.group(1) if m else None


def fetch_url(url: str, headers: dict | None = None, timeout: int = 30) -> bytes:
    req = Request(url, headers=headers or {"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read()


def download_youtube_thumb(yt_id: str, out_path: Path) -> bool:
    for variant in ("maxresdefault", "hqdefault"):
        url = f"https://img.youtube.com/vi/{yt_id}/{variant}.jpg"
        try:
            data = fetch_url(url)
            if len(data) > 5000:  # filter the YouTube placeholder JPG (~1KB)
                out_path.write_bytes(data)
                print(f"  OK YouTube {variant}: {url}")
                return True
        except HTTPError as e:
            print(f"  .. {variant} → {e.code}")
            continue
    return False


def download_vimeo_thumb(vm_id: str, out_path: Path) -> bool:
    page_url = f"https://vimeo.com/{vm_id}"
    oembed_url = f"https://vimeo.com/api/oembed.json?url={quote(page_url)}"
    try:
        meta = json.loads(fetch_url(oembed_url).decode("utf-8"))
        thumb_url = meta.get("thumbnail_url")
        if not thumb_url:
            return False
        # Bump resolution if Vimeo returns a small one (URL contains _xxx.jpg)
        thumb_url = re.sub(r"_\d+x\d+\.jpg", "_1280.jpg", thumb_url)
        thumb_url = re.sub(r"_\d+\.jpg$", "_1280.jpg", thumb_url)
        data = fetch_url(thumb_url)
        out_path.write_bytes(data)
        print(f"  OK Vimeo: {thumb_url}")
        return True
    except Exception as e:
        print(f"  XX Vimeo error: {e}")
        return False


def main() -> int:
    if not PROJECTS_TS.exists():
        print(f"Cannot find {PROJECTS_TS}", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    source = PROJECTS_TS.read_text(encoding="utf-8")
    clusters = parse_clusters(source)

    if not clusters:
        print("No clusters parsed. Did the regex break?", file=sys.stderr)
        return 1

    print(f"Found {len(clusters)} clusters")
    patches: list[str] = []

    for c in clusters:
        cid = c["id"]
        out_path = OUT_DIR / f"{cid}.jpg"
        already_local = c["thumbnail"].startswith("/images/clusters/")

        if out_path.exists() and already_local:
            print(f"[skip] {cid} — already has local thumbnail")
            continue
        if not c["first_link"]:
            print(f"[skip] {cid} — no first item link")
            continue

        print(f"[fetch] {cid} <- {c['first_link']}")

        ok = False
        yt = youtube_id(c["first_link"])
        vm = vimeo_id(c["first_link"])
        if yt:
            ok = download_youtube_thumb(yt, out_path)
        elif vm:
            ok = download_vimeo_thumb(vm, out_path)
        else:
            print(f"  XX unrecognised link host")

        if ok:
            new_thumb = f"/images/clusters/{cid}.jpg"
            if c["thumbnail"] != new_thumb:
                patches.append(
                    f"  {cid}: thumbnail \"{c['thumbnail']}\" -> \"{new_thumb}\""
                )

    if patches:
        print("\nUpdate data/projects.ts thumbnail fields for these clusters:")
        for p in patches:
            print(p)
    else:
        print("\nAll clusters up to date.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
