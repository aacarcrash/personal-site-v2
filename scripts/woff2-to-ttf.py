"""Regenerate the .ttf siblings of app/fonts/*.woff2.

The browser bundle ships woff2 and only woff2 — that is what next/font/local
loads and what should stay canonical. But the Open Graph card is rendered by
satori (inside next/og), and satori reads ttf, otf and woff. It cannot read
woff2. So the card needs a second copy of the same faces in a format it can
parse, and app/opengraph-image.tsx reads those.

The output is the identical font, decompressed — not a subset, not a
re-hint. Same OFL-1.1 licence, covered by app/fonts/OFL-*.txt, which must
keep travelling with the files.

Run after replacing any font:

    uv run --with fonttools --with brotli python scripts/woff2-to-ttf.py
"""

from pathlib import Path

from fontTools.ttLib import TTFont

FONT_DIR = Path(__file__).resolve().parent.parent / "app" / "fonts"

# Only the two the OG card actually sets. Absans is included because the card
# may pick up body copy later; drop it if that never happens.
FACES = ["Aujournuit-Regular", "Absans-Regular", "NectoMono-Regular"]


def main() -> None:
    for name in FACES:
        src = FONT_DIR / f"{name}.woff2"
        dst = FONT_DIR / f"{name}.ttf"
        font = TTFont(src)
        font.flavor = None  # drop the woff2 wrapper, keep the tables
        font.save(dst)
        print(f"{src.name} -> {dst.name}  ({dst.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
