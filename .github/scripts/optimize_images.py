from pathlib import Path
from PIL import Image
import re

ROOT = Path(".")
ASSETS = ROOT / "assets"
TEXT_EXTENSIONS = {".html", ".css", ".js"}
MIN_BYTES = 35_000

text_files = [p for p in ROOT.rglob("*") if p.is_file() and p.suffix.lower() in TEXT_EXTENSIONS and ".git" not in p.parts]
references = set()
for path in text_files:
    source = path.read_text(encoding="utf-8")
    references.update(re.findall(r"assets/[A-Za-z0-9_.-]+\.(?:png|jpe?g)", source, re.I))

mapping = {}
for rel in sorted(references):
    src = ROOT / rel
    if not src.exists() or src.stat().st_size < MIN_BYTES:
        continue
    try:
        with Image.open(src) as original:
            image = original.copy()
            image.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
            target = src.with_suffix(".webp")
            if "A" in image.getbands():
                image.save(target, "WEBP", quality=82, method=6)
            else:
                image.convert("RGB").save(target, "WEBP", quality=82, method=6)
            if target.stat().st_size < src.stat().st_size:
                mapping[rel] = target.relative_to(ROOT).as_posix()
            else:
                target.unlink(missing_ok=True)
    except Exception as exc:
        print(f"Skipped {rel}: {exc}")

for path in text_files:
    source = path.read_text(encoding="utf-8")
    updated = source
    for old, new in mapping.items():
        updated = updated.replace(old, new)
    if updated != source:
        path.write_text(updated, encoding="utf-8")

print(f"Optimized {len(mapping)} referenced images.")
for old, new in mapping.items():
    print(f"{old} -> {new}")
