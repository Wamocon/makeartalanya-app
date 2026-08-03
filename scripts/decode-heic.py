#!/usr/bin/env python
"""
Decodes the studio's HEIC photos into full-resolution JPEGs that sharp can read.

Why a second tool: sharp's prebuilt binary can parse a HEIC container (it
reports the right dimensions from the header) but cannot decode the pixels —
every attempt fails with "bad seek to N". That silently cost us 90 of the 160
photos. pillow-heif ships the actual HEIF decoder, so it handles the decode and
sharp still does all the resizing and WebP encoding downstream.

Output goes to .gallery-cache/, mirroring the source tree. That folder is
disposable — build-gallery.mjs reads from it and it can be deleted at any time.

Usage:  python scripts/decode-heic.py
"""

from pathlib import Path
import sys

try:
    import pillow_heif
except ImportError:
    sys.exit("pillow-heif is not installed. Run: pip install pillow-heif")

from PIL import Image, ImageOps

pillow_heif.register_heif_opener()

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source-photos" / "Фотографии Make Art Studio"
CACHE = ROOT / ".gallery-cache"

if not SRC.exists():
    sys.exit(f"Source folder not found: {SRC}")

heic_files = sorted(SRC.rglob("*.[hH][eE][iI][cC]"))
if not heic_files:
    print("No HEIC files found — nothing to decode.")
    sys.exit(0)

print(f"Decoding {len(heic_files)} HEIC files…")

decoded = skipped = failed = 0

for src in heic_files:
    rel = src.relative_to(SRC)
    out = CACHE / rel.with_suffix(".jpg")

    # Re-runnable: leave anything already newer than its source alone.
    if out.exists() and out.stat().st_mtime >= src.stat().st_mtime:
        skipped += 1
        continue

    out.parent.mkdir(parents=True, exist_ok=True)

    try:
        with Image.open(src) as im:
            # Phone photos carry an EXIF orientation flag; without applying it
            # every portrait shot lands on its side.
            im = ImageOps.exif_transpose(im)
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            # Quality 95 because this is an intermediate — sharp re-encodes to
            # WebP afterwards and we don't want to stack two lossy passes.
            im.save(out, "JPEG", quality=95, optimize=True)
        decoded += 1
        print(".", end="", flush=True)
    except Exception as exc:  # noqa: BLE001 - report and continue
        failed += 1
        print(f"\n  ! {rel}: {exc}")

print(f"\n\n✓ {decoded} decoded, {skipped} already current, {failed} failed")
print(f"cache: {CACHE.relative_to(ROOT)}")
