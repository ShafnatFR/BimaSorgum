"""Pilih 1 foto terbaik per jenis menu dari folder dataset (1 kelas = 1 jenis menu).

Skoring: resolusi + ketajaman (variance of Laplacian) + rasio aspek + ukuran file.
Dedupe: average-hash, supaya tidak dua foto mirip terpilih untuk jenis berbeda.
Output: pool/<slug>.jpg (JPEG max 1200px), pool/manifest.json, pool/_alts/<slug>_2.jpg dst.
"""
import hashlib, json, os, re, sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

POOL = Path(r"C:\Users\shafnats\AppData\Local\Temp\pool")
ALTS = POOL / "_alts"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_W = 1200
JPEG_Q = 86


def slugify(s: str) -> str:
    s = s.lower().replace("_", " ").strip()
    s = re.sub(r"[^a-z0-9 ]+", "", s)
    return re.sub(r"\s+", "-", s) or "menu"


def ahash(img: Image.Image, size: int = 16) -> str:
    g = ImageOps.grayscale(img).resize((size, size), Image.LANCZOS)
    a = np.asarray(g, dtype=np.float32)
    bits = (a > a.mean()).flatten()
    return "".join("1" if b else "0" for b in bits)


def hamming(a: str, b: str) -> int:
    return sum(1 for x, y in zip(a, b) if x != y)


def score_image(p: Path):
    """Return (score, meta) atau (None, reason) kalau tidak layak."""
    try:
        size_kb = p.stat().st_size / 1024
        if size_kb < 20:
            return None, "file terlalu kecil"
        img = Image.open(p)
        img = ImageOps.exif_transpose(img)
        w, h = img.size
        if min(w, h) < 400:
            return None, "resolusi < 400px"
        # sampel untuk analisa ketajaman
        rgb = img.convert("RGB")
        small = np.asarray(rgb.resize((min(w, 512), int(min(w, 512) * h / w)), Image.BILINEAR))
        gray = cv2.cvtColor(small, cv2.COLOR_RGB2GRAY)
        sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness = float(gray.mean())
        ratio = w / h
        s_res = min(1.0, (min(w, h) / 1000.0)) * 2.0
        s_sharp = min(sharp / 500.0, 1.0) * 3.0
        s_ratio = 1.0 if 0.9 <= ratio <= 1.9 else (0.4 if 0.6 <= ratio <= 2.4 else 0.0)
        s_size = 1.0 if size_kb >= 80 else 0.3
        s_bright = 1.0 if 55 <= brightness <= 215 else 0.2
        total = s_res + s_sharp + s_ratio + s_size + s_bright
        return total, {"w": w, "h": h, "kb": round(size_kb, 1), "sharp": round(sharp, 1),
                       "brightness": round(brightness, 1), "score": round(total, 3)}
    except Exception as e:
        return None, f"gagal baca: {e}"


def save_pick(src: Path, dst: Path, meta: dict):
    img = Image.open(src)
    img = ImageOps.exif_transpose(img).convert("RGB")
    if img.width > MAX_W:
        img = img.resize((MAX_W, int(img.height * MAX_W / img.width)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "JPEG", quality=JPEG_Q, optimize=True, progressive=True)
    return {"file": dst.name, **meta, "out_kb": round(dst.stat().st_size / 1024, 1)}


def pick_from_folder(class_dir: Path, seen_hashes: list, source: str, license_: str, want_alts=2):
    files = [f for f in sorted(class_dir.rglob("*")) if f.suffix.lower() in EXTS]
    scored = []
    for f in files:
        s, meta = score_image(f)
        if s is None:
            continue
        img = Image.open(f)
        scored.append((s, f, meta, ahash(img)))
    if not scored:
        return None, "tidak ada kandidat layak"
    scored.sort(key=lambda x: -x[0])
    # hindari hash mirip dengan yang sudah dipilih
    picks, used = [], []
    for s, f, meta, h in scored:
        if any(hamming(h, u) < 12 for u in used + seen_hashes):
            continue
        picks.append((s, f, meta, h))
        used.append(h)
        if len(picks) >= 1 + want_alts:
            break
    if not picks:
        return None, "semua kandidat duplikat"
    slug = slugify(class_dir.name)
    info = []
    for i, (s, f, meta, h) in enumerate(picks):
        name = f"{slug}.jpg" if i == 0 else f"{slug}_{i+1}.jpg"
        dst = (POOL / name) if i == 0 else (ALTS / name)
        entry = save_pick(f, dst, meta)
        entry.update({"slug": slug, "class": class_dir.name, "source": source,
                      "license": license_, "origin_file": f.name, "rank": i + 1})
        info.append(entry)
    seen_hashes.extend(p[3] for p in picks)
    return info, None


def main(datasets):
    POOL.mkdir(parents=True, exist_ok=True)
    ALTS.mkdir(parents=True, exist_ok=True)
    manifest, seen, problems = [], [], []

    def norm_class(name: str) -> str:
        return name.replace("_", " ").strip()

    targets = []
    for ds_dir, source, lic in datasets:
        root = Path(ds_dir)
        subs = [d for d in root.iterdir() if d.is_dir()]
        # kalau cuma 1 subfolder (mis. dataset/ atau dataset_padang_food/), turun satu level
        if len(subs) == 1 and all(x.is_dir() for x in subs[0].iterdir()):
            root = subs[0]
            subs = [d for d in root.iterdir() if d.is_dir()]
        for d in sorted(subs):
            targets.append((d, source, lic))

    for class_dir, source, lic in targets:
        info, err = pick_from_folder(class_dir, seen, source, lic)
        if err:
            problems.append((str(class_dir), err))
            continue
        manifest.extend(info)
        print(f"  {norm_class(class_dir.name):<18} -> {info[0]['file']:<28} "
              f"score={info[0]['score']} {info[0]['w']}x{info[0]['h']} {info[0]['out_kb']}KB")

    (POOL / "manifest.json").write_text(json.dumps({
        "menu_types": len({m['slug'] for m in manifest}),
        "photos": len(manifest),
        "items": manifest,
        "problems": problems,
    }, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\njenis menu: {len({m['slug'] for m in manifest})} | file foto: {len(manifest)}")
    if problems:
        print("masalah:", problems)


if __name__ == "__main__":
    D = [
        (r"C:\Users\shafnats\AppData\Local\Temp\ds\padang", "kaggle:faldoae/padangfood", "ODbL-1.0"),
        (r"C:\Users\shafnats\AppData\Local\Temp\ds\jajanan", "kaggle:nizamkurniawan/jajanan-tradisional-jawa-tengah", "CC0-1.0"),
    ]
    main(D)
