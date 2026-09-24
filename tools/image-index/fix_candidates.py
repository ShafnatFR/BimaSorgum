"""Siapkan kandidat pengganti untuk jenis menu yang fotonya terbukti salah (dari verifikasi visual).

Untuk tiap slug: kumpulkan kandidat (cache unduhan + folder dataset + query baru),
skor, ambil 4 teratas selain foto terpasang, lalu render sheet berlabel "slug#1..#4"
supaya bisa dipilih manual.
Output: pool/_fix/sheetN.jpg + pool/_fix/candidates.json
"""
import json, time, urllib.parse
from pathlib import Path

from build_pool import (TMP, POOL, QCACHE, UA, MAX_W, JPEG_Q, MIN_SIDE,
                        score_file, commons_candidates, openverse_candidates, download, ahash, hamming)
from PIL import Image, ImageDraw

from concurrent.futures import ThreadPoolExecutor

FIX = POOL / "_fix"
DSROOT = TMP / "ds"
PER_SLUG = 4
SLUGS_PER_SHEET = 4

# slug: (query baru, folder dataset opsional)
TARGETS = {
    "bakwan":       ("bakwan jagung sayur goreng", None),
    "bihun-goreng": ("bihun goreng sayur", None),
    "brownies":     ("brownies chocolate cake slice", None),
    "bubur-sumsum": ("bubur sumsum kuah gula merah", None),
    "lanting":      ("lanting singkong goreng", "jajanan/dataset/lanting"),
    "milkshake":    ("chocolate milkshake in glass", None),
    "putu-ayu":     ("putu ayu kue hijau kelapa", "jajanan/dataset/putu ayu"),
    "risotto":      ("risotto plate mushroom", None),
    "sate-ayam":    ("sate ayam tusuk", None),
    "serabi":       ("serabi surabi kue", "jajanan/dataset/serabi solo"),
    "susu-sorgum":  ("soy milk in glass", None),
    "telur-balado": ("telur balado sambal", None),
    "tempe-mendoan": ("tempe mendoan goreng tepung", None),
    "tumis-sayur":  ("tumis kangkung sayur", None),
    "wajik":        ("wajik ketan manis", "jajanan/dataset/wajik"),
    "wedang-jahe":  ("wedang jahe ginger tea", None),
}


def gather(slug: str, query: str, folder: str, current: str):
    cands = []
    qdir = QCACHE / slug
    qdir.mkdir(parents=True, exist_ok=True)
    # kandidat lama dari cache
    for f in sorted(qdir.glob("*.jpg")):
        if f.resolve() == Path(current).resolve():
            continue
        s, meta = score_file(f)
        if s:
            cands.append({"path": str(f), "score": s, "meta": meta, "src": "cache", "new": False})
    # folder dataset
    if folder:
        fdir = DSROOT / folder
        if fdir.is_dir():
            files = sorted([f for f in fdir.glob("*") if f.is_file()], key=lambda f: -f.stat().st_size)[:40]
            with ThreadPoolExecutor(6) as ex:
                res = list(ex.map(score_file, files))
            for f, (s, meta) in zip(files, res):
                if s:
                    cands.append({"path": str(f), "score": s, "meta": meta,
                                  "src": "dataset", "new": False})
    # query baru: commons + openverse
    pool_src = commons_candidates(query, limit=16)
    time.sleep(3.3)
    pool_src += openverse_candidates(query, limit=10)
    jobs, byp = [], {}
    for i, c in enumerate(pool_src[:16], 1):
        f = qdir / f"fix{i:02d}.jpg"
        jobs.append((c["url"], f))
        byp[f] = c

    def one(it):
        url, p = it
        if p.exists() and p.stat().st_size > 8000:
            return p
        return p if download(url, p) else None

    with ThreadPoolExecutor(8) as ex:
        ok = [p for p in ex.map(one, jobs) if p]
    with ThreadPoolExecutor(6) as ex:
        res = list(ex.map(score_file, ok))
    for f, (s, meta) in zip(ok, res):
        if s:
            c = byp[f]
            cands.append({"path": str(f), "score": s, "meta": meta, "src": c["src"],
                          "license": c["license"], "author": c["author"],
                          "page": c["page"], "new": True})
    # urut skor, buang yang mirip
    cands.sort(key=lambda c: -c["score"])
    picked, hashes = [], []
    for c in cands:
        try:
            h = ahash(c["path"])
        except Exception:
            continue
        if any(hamming(h, u) < 12 for u in hashes):
            continue
        picked.append(c)
        hashes.append(h)
        if len(picked) >= PER_SLUG:
            break
    return picked


def main():
    FIX.mkdir(parents=True, exist_ok=True)
    manifest = json.loads((POOL / "manifest.json").read_text(encoding="utf-8"))
    cur = {i["slug"]: i["file"] for i in manifest["items"] if i["rank"] == 1}
    out = {}
    for slug, (query, folder) in TARGETS.items():
        got = gather(slug, query, folder, str(POOL / cur.get(slug, "x.jpg")))
        out[slug] = {"query": query, "candidates": got}
        print(f"  {slug:<14} {len(got)} kandidat (sumber: {[c['src'][:12] for c in got]})")

    (FIX / "candidates.json").write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    # render sheet: 1 baris per slug, 4 kolom kandidat
    slugs = list(TARGETS)
    CELL = 260
    for si in range(0, len(slugs), SLUGS_PER_SHEET):
        chunk = slugs[si:si + SLUGS_PER_SHEET]
        rows = len(chunk)
        sheet = Image.new("RGB", (PER_SLUG * CELL, rows * (CELL + 24)), (18, 20, 26))
        d = ImageDraw.Draw(sheet)
        for r, slug in enumerate(chunk):
            for k, c in enumerate(out[slug]["candidates"]):
                im = Image.open(c["path"]).convert("RGB")
                s = max(CELL / im.width, CELL / im.height)
                im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
                l, t = (im.width - CELL) // 2, (im.height - CELL) // 2
                sheet.paste(im.crop((l, t, l + CELL, t + CELL)), (k * CELL, r * (CELL + 24)))
                d.text((k * CELL + 5, r * (CELL + 24) + CELL + 5),
                       f"{slug}#{k+1}  [{c['src'][:18]}] {c['meta']['w']}x{c['meta']['h']}",
                       fill=(225, 228, 238))
        p = FIX / f"sheet{si // SLUGS_PER_SHEET + 1}.jpg"
        sheet.save(p, quality=88)
        print("sheet:", p)
    print("kandidat:", FIX / "candidates.json")


if __name__ == "__main__":
    main()
