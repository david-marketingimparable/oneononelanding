from pathlib import Path
from PIL import Image

ROOT = Path(".")
ASSETS = ROOT / "assets"

# Reduce oversized source files without changing their visual appearance.
MAX_DIMENSIONS = {
    "hero-executive-wide.webp": 800,
    "testimonial-new-1.webp": 768,
    "testimonial-new-2.webp": 768,
    "testimonial-new-3.webp": 768,
    "testimonial-new-5.webp": 768,
    "logo-chubb.webp": 512,
    "logo-autozone.webp": 512,
    "logo-softtek.webp": 256,
    "logo-cemex.jpg": 600,
    "logo-banorte.webp": 768,
    "logo-benavides.png": 600,
    "logo-pepsico.webp": 600,
    "logo-alen.png": 256,
    "logo-one-on-one.png": 512,
    "fit-person.webp": 1200,
}

# Generate only the pixel dimensions actually useful to the responsive layout.
# This avoids downloading 2x-10x more pixels than the mobile viewport needs.
RESPONSIVE_WIDTHS = {
    "hero-executive-wide.webp": [480, 800],
    "testimonial-new-1.webp": [560, 768],
    "testimonial-new-2.webp": [560, 768],
    "testimonial-new-3.webp": [560, 768],
    "testimonial-new-5.webp": [560, 768],
    "logo-chubb.webp": [192, 320],
    "logo-autozone.webp": [320, 480],
    "logo-softtek.webp": [192, 320],
    "logo-cemex.jpg": [320, 520],
    "logo-banorte.webp": [320, 520],
    "logo-benavides.png": [320, 520],
    "logo-pepsico.webp": [320, 480],
    "logo-alen.png": [192, 320],
    "logo-one-on-one.png": [320, 455],
}

def save_webp(image, destination, width):
    ratio = min(1, width / image.width)
    target = image.resize((max(1, round(image.width * ratio)), max(1, round(image.height * ratio))), Image.Resampling.LANCZOS) if ratio < 1 else image.copy()
    if target.mode not in ("RGB", "RGBA"):
        target = target.convert("RGBA" if "A" in target.getbands() else "RGB")
    destination.parent.mkdir(parents=True, exist_ok=True)
    tmp = destination.with_suffix(destination.suffix + ".tmp")
    target.save(tmp, format="WEBP", quality=82, method=6)
    optimized = tmp.read_bytes()
    tmp.unlink(missing_ok=True)
    if not destination.exists() or len(optimized) < destination.stat().st_size:
        destination.write_bytes(optimized)
        print(f"{destination.name}: {len(optimized)} bytes")
    else:
        print(f"{destination.name}: kept existing")

# First optimize the existing files in place.
for name, max_dimension in MAX_DIMENSIONS.items():
    src = ASSETS / name
    if not src.exists():
        continue
    try:
        original_bytes = src.read_bytes()
        with Image.open(src) as original:
            image = original.copy()
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
            ext = src.suffix.lower()
            if ext == ".webp":
                save_kwargs = {"format": "WEBP", "quality": 84, "method": 6}
                if image.mode not in ("RGB", "RGBA"):
                    image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
            elif ext in (".jpg", ".jpeg"):
                if image.mode != "RGB":
                    image = image.convert("RGB")
                save_kwargs = {"format": "JPEG", "quality": 84, "optimize": True, "progressive": True}
            elif ext == ".png":
                save_kwargs = {"format": "PNG", "optimize": True, "compress_level": 9}
            else:
                continue
            tmp = src.with_suffix(src.suffix + ".tmp")
            image.save(tmp, **save_kwargs)
            optimized = tmp.read_bytes()
            tmp.unlink(missing_ok=True)
            if len(optimized) < len(original_bytes):
                src.write_bytes(optimized)
                print(f"{name}: {len(original_bytes)} -> {len(optimized)} bytes")
    except Exception as exc:
        print(f"Skipped {name}: {exc}")

# Then generate responsive WebP variants from the now-optimized source files.
for name, widths in RESPONSIVE_WIDTHS.items():
    src = ASSETS / name
    if not src.exists():
        continue
    try:
        with Image.open(src) as original:
            image = original.copy()
            for width in widths:
                stem = src.stem
                destination = ASSETS / f"{stem}-{width}.webp"
                save_webp(image, destination, width)
    except Exception as exc:
        print(f"Skipped responsive variants for {name}: {exc}")
