"""
For every .gif in public/images/, extract the first frame and save it
as a sibling .thumb.webp. This sibling is used by the grid and featured
strip so we don't ship a 9MB GIF as a 56x40 thumbnail. The original
.gif is preserved for the project detail page where animation is wanted.

Run from personal-site-v2:
  python scripts/extract-gif-thumbs.py
"""

from pathlib import Path
from PIL import Image

PUBLIC = Path("D:/DocumentsD/cs-projects/personal-site-v2/public/images")


def main():
    count = 0
    for gif in PUBLIC.rglob("*.gif"):
        out = gif.with_suffix(".thumb.webp")
        if out.exists():
            print(f"skip (exists): {out.relative_to(PUBLIC)}")
            continue
        with Image.open(gif) as img:
            img.seek(0)
            frame = img.convert("RGB")
            # Keep aspect ratio, max 600px on the long edge
            frame.thumbnail((600, 600))
            frame.save(out, "WEBP", quality=80)
        count += 1
        print(f"wrote: {out.relative_to(PUBLIC)} ({out.stat().st_size // 1024}KB)")
    print(f"done — {count} thumbs created")


if __name__ == "__main__":
    main()
