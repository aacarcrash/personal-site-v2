"""
Optimize all images in public/images/ in place.

Strategy:
  - JPEG / PNG / WebP: resize so long edge <= 1920px (web doesn't need bigger),
    re-encode at quality 82 (JPEG) or palette-compressed (PNG)
  - GIF: resize so long edge <= 800px and re-encode (preserves animation)
  - Skip files already <300KB
  - Skip already-optimized .thumb.webp siblings (those were generated separately)

Run from personal-site-v2:
  python scripts/optimize-images.py [--dry-run]

Originals are NOT preserved — this script overwrites in place. Run on a clean
git tree so you can `git diff` to see what changed and `git checkout` to revert.
"""

from pathlib import Path
from PIL import Image, ImageSequence, ImageFile
import sys

ImageFile.LOAD_TRUNCATED_IMAGES = True

PUBLIC = Path("D:/DocumentsD/cs-projects/personal-site-v2/public/images")
MAX_DIM_RASTER = 1920
MAX_DIM_GIF = 800
SKIP_BELOW_BYTES = 300 * 1024  # 300KB
JPEG_QUALITY = 82
WEBP_QUALITY = 82
DRY = "--dry-run" in sys.argv


def optimize_jpeg(path: Path):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    if max(w, h) > MAX_DIM_RASTER:
        img.thumbnail((MAX_DIM_RASTER, MAX_DIM_RASTER), Image.Resampling.LANCZOS)
    if not DRY:
        img.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)


def optimize_png(path: Path):
    img = Image.open(path)
    if img.mode == "P":
        img = img.convert("RGBA")
    w, h = img.size
    if max(w, h) > MAX_DIM_RASTER:
        img.thumbnail((MAX_DIM_RASTER, MAX_DIM_RASTER), Image.Resampling.LANCZOS)
    if not DRY:
        # PNG: keep transparency. Use optimize=True for zlib best compression.
        img.save(path, "PNG", optimize=True)


def optimize_webp(path: Path):
    img = Image.open(path)
    w, h = img.size
    if max(w, h) > MAX_DIM_RASTER:
        img.thumbnail((MAX_DIM_RASTER, MAX_DIM_RASTER), Image.Resampling.LANCZOS)
    if not DRY:
        img.save(path, "WEBP", quality=WEBP_QUALITY, method=6)


def optimize_gif(path: Path):
    img = Image.open(path)
    frames = []
    durations = []
    for frame in ImageSequence.Iterator(img):
        f = frame.copy()
        if max(f.size) > MAX_DIM_GIF:
            f.thumbnail((MAX_DIM_GIF, MAX_DIM_GIF), Image.Resampling.LANCZOS)
        frames.append(f)
        durations.append(frame.info.get("duration", 100))
    if not frames or DRY:
        return
    frames[0].save(
        path,
        "GIF",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=img.info.get("loop", 0),
        optimize=True,
        disposal=2,
    )


def main():
    total_before = 0
    total_after = 0
    skipped = 0
    converted = 0
    errors = []
    rows = []

    for path in sorted(PUBLIC.rglob("*")):
        if not path.is_file():
            continue
        if path.name.endswith(".thumb.webp"):
            continue
        size_before = path.stat().st_size
        ext = path.suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".gif", ".webp"}:
            continue
        if size_before < SKIP_BELOW_BYTES:
            skipped += 1
            continue

        try:
            if ext in {".jpg", ".jpeg"}:
                optimize_jpeg(path)
            elif ext == ".png":
                optimize_png(path)
            elif ext == ".gif":
                optimize_gif(path)
            elif ext == ".webp":
                optimize_webp(path)
            size_after = path.stat().st_size
            total_before += size_before
            total_after += size_after
            converted += 1
            rows.append((size_before, size_after, path.relative_to(PUBLIC)))
        except Exception as e:
            errors.append(f"{path.relative_to(PUBLIC)}: {e}")

    rows.sort(reverse=True)
    print(f"\n{'BEFORE':>10}  {'AFTER':>10}  {'SAVED':>10}  PATH")
    for b, a, p in rows[:30]:
        saved_pct = (1 - a / b) * 100 if b else 0
        print(f"{b/1048576:9.2f}MB  {a/1048576:9.2f}MB  {saved_pct:9.1f}%  {p}")

    if len(rows) > 30:
        print(f"... and {len(rows)-30} more")

    print(f"\nTotal: {converted} files optimized, {skipped} small files skipped")
    print(f"Before: {total_before/1048576:.1f} MB  →  After: {total_after/1048576:.1f} MB")
    if total_before:
        print(f"Saved:  {(total_before - total_after)/1048576:.1f} MB ({(1 - total_after/total_before)*100:.1f}%)")
    if errors:
        print(f"\n{len(errors)} errors:")
        for e in errors[:10]:
            print(f"  {e}")


if __name__ == "__main__":
    main()
