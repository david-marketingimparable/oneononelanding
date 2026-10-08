from pathlib import Path
from PIL import Image

ROOT = Path(".")
ASSETS = ROOT / "assets"

# Keep the visual appearance and existing URLs, but avoid shipping pixels far
# beyond the largest size the landing page needs.
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
            save_kwargs = {}

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
            else:
                print(f"{name}: kept original ({len(original_bytes)} bytes)")
    except Exception as exc:
        print(f"Skipped {name}: {exc}")
