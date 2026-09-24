"""Bangun pool "1 foto = 1 jenis menu".

Kandidat dikumpulkan dari: folder dataset lokal + Wikimedia Commons + Openverse.
Semua kandidat diskor (resolusi, ketajaman, rasio, kecerahan), di-dedupe (average-hash),
lalu dipilih 1 terbaik per jenis menu.
Output: pool/<slug>.jpg, pool/_alts/<slug>_2.jpg, pool/manifest.json, pool/review.html
"""
import html, io, json, re, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps

TMP = Path(r"C:\Users\shafnats\AppData\Local\Temp")
POOL, ALTS = TMP / "pool", TMP / "pool" / "_alts"
QCACHE = TMP / "imgqueue"          # cache unduhan, di luar pool supaya aman saat pool dihapus
UA = "SorghumCare-ImagePool/0.1 (shafnatfuainiramadhan@gmail.com)"
MAX_W, JPEG_Q, MIN_SIDE = 1200, 86, 300
OPENVERSE_SLEEP = 3.3   # batas anonim 20/menit
DL_WORKERS, SCORE_WORKERS = 8, 6
MAX_FOLDER_FILES = 60   # cukup untuk menemukan foto terbaik dalam satu kelas

# slug: (nama tampil, query cari, folder dataset (opsional), sumber, lisensi)
CATALOG = [
    ("ayam-goreng",      "Ayam Goreng",          "ayam goreng",        "padang/dataset_padang_food/ayam_goreng",      "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("ayam-pop",         "Ayam Pop",             "ayam pop",           "padang/dataset_padang_food/ayam_pop",         "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("rendang",          "Rendang Daging",       "rendang",            "padang/dataset_padang_food/daging_rendang",   "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("dendeng-batokok",  "Dendeng Batokok",      "dendeng batokok",    "padang/dataset_padang_food/dendeng_batokok",  "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("gulai-ikan",       "Gulai Ikan",           "gulai ikan",         "padang/dataset_padang_food/gulai_ikan",       "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("gulai-tambusu",    "Gulai Tambusu",        "gulai tambusu",      "padang/dataset_padang_food/gulai_tambusu",    "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("gulai-tunjang",    "Gulai Tunjang",        "gulai tunjang",      "padang/dataset_padang_food/gulai_tunjang",    "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("telur-balado",     "Telur Balado",         "telur balado",       "padang/dataset_padang_food/telur_balado",     "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("telur-dadar",      "Telur Dadar",          "telur dadar",        "padang/dataset_padang_food/telur_dadar",      "kaggle:faldoae/padangfood", "ODbL-1.0"),
    ("grontol",          "Grontol",              "grontol",            "jajanan/dataset/grontol",      "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("lanting",          "Lanting",              "lanting",            "jajanan/dataset/lanting",      "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("lumpia",           "Lumpia",               "lumpia goreng",      "jajanan/dataset/lumpia",       "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("putu-ayu",         "Putu Ayu",             "putu ayu",           "jajanan/dataset/putu ayu",     "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("serabi",           "Serabi Solo",          "serabi",             "jajanan/dataset/serabi solo",  "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("wajik",            "Wajik",                "wajik",              "jajanan/dataset/wajik",        "kaggle:nizamkurniawan/jajanan", "CC0-1.0"),
    ("nasi-uduk",        "Nasi Uduk",            "nasi uduk",          None, "commons/openverse", "CC"),
    ("nasi-goreng",      "Nasi Goreng",          "nasi goreng",        None, "commons/openverse", "CC"),
    ("nasi-kuning",      "Nasi Kuning",          "nasi kuning",        None, "commons/openverse", "CC"),
    ("nasi-liwet",       "Nasi Liwet",           "nasi liwet",         None, "commons/openverse", "CC"),
    ("bubur-ayam",       "Bubur Ayam",           "bubur ayam",         None, "commons/openverse", "CC"),
    ("bubur-sumsum",     "Bubur Sumsum",         "bubur sumsum",       None, "commons/openverse", "CC"),
    ("soto-ayam",        "Soto Ayam",            "soto ayam",          None, "commons/openverse", "CC"),
    ("gado-gado",        "Gado-Gado",            "gado gado",          None, "commons/openverse", "CC"),
    ("sate-ayam",        "Sate Ayam",            "sate ayam",          None, "commons/openverse", "CC"),
    ("tempe-mendoan",    "Tempe Mendoan",        "tempe mendoan",      None, "commons/openverse", "CC"),
    ("perkedel",         "Perkedel",             "perkedel",           None, "commons/openverse", "CC"),
    ("bakwan",           "Bakwan Sayur",         "bakwan",             None, "commons/openverse", "CC"),
    ("tumis-sayur",      "Tumis Sayur",          "tumis sayur",        None, "commons/openverse", "CC"),
    ("sup-ayam",         "Sup Ayam",             "sup ayam",           None, "commons/openverse", "CC"),
    ("bihun-goreng",     "Bihun Goreng",         "bihun goreng",       None, "commons/openverse", "CC"),
    ("es-cendol",        "Es Cendol",            "es cendol",          None, "commons/openverse", "CC"),
    ("es-dawet",         "Es Dawet",             "es dawet",           None, "commons/openverse", "CC"),
    ("wedang-jahe",      "Wedang Jahe",          "wedang jahe",        None, "commons/openverse", "CC"),
    ("susu-sorgum",      "Susu Sorgum",          "sorghum milk drink", None, "commons/openverse", "CC"),
    ("smoothie",         "Smoothie Bowl",        "smoothie bowl",      None, "commons/openverse", "CC"),
    ("milkshake",        "Milkshake",            "milkshake",          None, "commons/openverse", "CC"),
    ("pancake",          "Pancake",              "pancake stack",      None, "commons/openverse", "CC"),
    ("cookies",          "Kukis / Cookies",      "chocolate chip cookies", None, "commons/openverse", "CC"),
    ("brownies",         "Brownies",             "brownies",           None, "commons/openverse", "CC"),
    ("muffin",           "Muffin",               "muffin",             None, "commons/openverse", "CC"),
    ("bolu-kukus",       "Bolu Kukus",           "bolu kukus",         None, "commons/openverse", "CC"),
    ("klepon",           "Klepon",               "klepon",             None, "commons/openverse", "CC"),
    ("puding",           "Puding",               "pudding dessert",    None, "commons/openverse", "CC"),
    ("risotto",          "Risotto",              "risotto",             None, "commons/openverse", "CC"),
    ("sorgum-biji",      "Biji Sorgum",          "sorghum grain",      None, "commons/openverse", "CC"),
    ("buddha-bowl",      "Buddha Bowl",          "vegetable bowl rice", None, "commons/openverse", "CC"),
]


def fetch(url, headers=None, timeout=30, tries=3):
    h = {"User-Agent": UA}
    if headers:
        h.update(headers)
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=h)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception:
            time.sleep(1.5 * (i + 1))
    return None


def commons_candidates(query, limit=18):
    url = ("https://commons.wikimedia.org/w/api.php?action=query&generator=search"
           f"&gsrsearch={urllib.parse.quote(query)}&gsrnamespace=6&gsrlimit={limit}"
           "&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1400&format=json")
    raw = fetch(url)
    out = []
    if not raw:
        return out
    try:
        d = json.loads(raw)
    except Exception:
        return out
    for p in (d.get("query", {}).get("pages", {}) or {}).values():
        ii = (p.get("imageinfo") or [{}])[0]
        if not ii.get("thumburl"):
            continue
        em = ii.get("extmetadata", {}) or {}
        lic = (em.get("LicenseShortName", {}) or {}).get("value", "?")
        author = re.sub("<[^>]+>", "", (em.get("Artist", {}) or {}).get("value", "")).strip()[:70]
        out.append({"src": "commons", "url": ii["thumburl"], "title": p.get("title", ""),
                    "license": lic, "author": author, "w": ii.get("width", 0), "h": ii.get("height", 0),
                    "page": "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(p.get("title", ""))})
    return out


def openverse_candidates(query, limit=12):
    url = ("https://api.openverse.org/v1/images/?q=" + urllib.parse.quote(query) +
           f"&page_size={limit}&license_type=commercial,modification")
    raw = fetch(url)
    out = []
    if not raw:
        return out
    try:
        d = json.loads(raw)
    except Exception:
        return out
    for r in d.get("results", []):
        out.append({"src": "openverse:" + str(r.get("provider")), "url": r.get("url", ""),
                    "title": (r.get("title") or "")[:80],
                    "license": f"{r.get('license','')} {r.get('license_version') or ''}".strip(),
                    "author": (r.get("creator") or "")[:70] or "(tanpa nama)",
                    "w": r.get("width") or 0, "h": r.get("height") or 0,
                    "page": r.get("foreign_landing_url", "")})
    return out


def download(url, dst: Path):
    raw = fetch(url, timeout=40, tries=2)
    if not raw or len(raw) < 8000:
        return None
    try:
        img = Image.open(io.BytesIO(raw))
        img = ImageOps.exif_transpose(img).convert("RGB")
    except Exception:
        return None
    if min(img.size) < MIN_SIDE:
        return None
    if img.width > MAX_W:
        img = img.resize((MAX_W, int(img.height * MAX_W / img.width)), Image.LANCZOS)
    dst.parent.mkdir(parents=True, exist_ok=True)
    img.save(dst, "JPEG", quality=JPEG_Q, optimize=True, progressive=True)
    return img.size


def ahash(p_or_img, size=16):
    img = p_or_img if isinstance(p_or_img, Image.Image) else Image.open(p_or_img)
    g = ImageOps.grayscale(img).resize((size, size), Image.LANCZOS)
    a = np.asarray(g, dtype=np.float32)
    return "".join("1" if b else "0" for b in (a > a.mean()).flatten())


def hamming(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


def score_file(p: Path):
    try:
        kb = p.stat().st_size / 1024
        img = ImageOps.exif_transpose(Image.open(p)).convert("RGB")
        w, h = img.size
        if min(w, h) < MIN_SIDE:
            return None, None
        sw = min(w, 512)
        small = np.asarray(img.resize((sw, max(1, int(sw * h / w))), Image.BILINEAR))
        gray = cv2.cvtColor(small, cv2.COLOR_RGB2GRAY)
        sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        bright = float(gray.mean())
        ratio = w / h
        s = (min(1.0, min(w, h) / 1000.0) * 2.0
             + min(sharp / 500.0, 1.0) * 3.0
             + (1.0 if 0.9 <= ratio <= 1.9 else 0.45 if 0.6 <= ratio <= 2.4 else 0.0)
             + (1.0 if kb >= 80 else 0.35)
             + (1.0 if 55 <= bright <= 215 else 0.2))
        return round(s, 3), {"w": w, "h": h, "kb": round(kb, 1), "sharp": round(sharp, 1)}
    except Exception:
        return None, None


def main():
    POOL.mkdir(parents=True, exist_ok=True)
    ALTS.mkdir(parents=True, exist_ok=True)
    manifest, seen, qu = [], [], {}
    dsroot = TMP / "ds"
    qdir = QCACHE
    qdir.mkdir(parents=True, exist_ok=True)

    def score_files(files):
        with ThreadPoolExecutor(SCORE_WORKERS) as ex:
            res = list(ex.map(score_file, files))
        return [(s, f, m) for f, (s, m) in zip(files, res) if s]

    def fetch_files(items):
        """items: list of (url, path) -> unduh paralel, kembalikan path yang berhasil."""
        def one(it):
            url, p = it
            if p.exists() and p.stat().st_size > 8000:
                return p
            return p if download(url, p) else None
        with ThreadPoolExecutor(DL_WORKERS) as ex:
            return [p for p in ex.map(one, items) if p]

    for slug, title, query, folder, src_label, lic in CATALOG:
        cands = []
        # 1) kandidat dataset lokal
        if folder:
            fdir = dsroot / folder
            if fdir.is_dir():
                allf = [f for f in sorted(fdir.glob("*")) if f.is_file()]
                allf.sort(key=lambda f: -f.stat().st_size)      # kandidat gemuk dulu
                for s, f, meta in score_files(allf[:MAX_FOLDER_FILES]):
                    cands.append({"kind": "file", "path": str(f), "score": s, "meta": meta,
                                  "src": src_label, "license": lic,
                                  "author": src_label, "page": ""})
        # 2) Commons (+ Openverse kalau perlu)
        tmpdir = qdir / slug
        tmpdir.mkdir(parents=True, exist_ok=True)
        pool_src = commons_candidates(query)
        best_local = max([c["score"] for c in cands], default=0)
        # Openverse hanya kalau kandidat lokal/commons lemah
        if best_local < 7.4:
            time.sleep(OPENVERSE_SLEEP)
            pool_src += openverse_candidates(query)
        n = 0
        jobs = []
        meta_by_path = {}
        for c in pool_src[:14]:
            n += 1
            f = tmpdir / f"c{n:02d}.jpg"
            jobs.append((c["url"], f))
            meta_by_path[f] = c
        ok_paths = fetch_files(jobs)
        for s, f, meta in score_files(ok_paths):
            c = meta_by_path[f]
            cands.append({"kind": "file", "path": str(f), "score": s, "meta": meta,
                          "src": c["src"], "license": c["license"], "author": c["author"],
                          "page": c["page"], "title": c["title"]})
        if not cands:
            print(f"  ! {slug:<16} tidak ada kandidat")
            continue
        cands.sort(key=lambda c: -c["score"])
        picks = []
        for c in cands:
            h = ahash(c["path"])
            if any(hamming(h, u) < 12 for u in seen + [p[1] for p in picks]):
                continue
            picks.append((c, h))
            if len(picks) >= 3:
                break
        if not picks:
            print(f"  ! {slug:<16} semua kandidat duplikat")
            continue
        for i, (c, h) in enumerate(picks):
            dst = (POOL / f"{slug}.jpg") if i == 0 else (ALTS / f"{slug}_{i+1}.jpg")
            Image.open(c["path"]).convert("RGB").save(dst, "JPEG", quality=JPEG_Q,
                                                      optimize=True, progressive=True)
            entry = {"slug": slug, "title": title, "rank": i + 1, "file": str(dst.relative_to(POOL)),
                     "source": c["src"], "license": c["license"], "author": c["author"],
                     "attribution_page": c.get("page", ""), "query": query,
                     "w": c["meta"]["w"], "h": c["meta"]["h"], "score": c["score"],
                     "size_kb": round(dst.stat().st_size / 1024, 1)}
            manifest.append(entry)
        seen.append(picks[0][1])
        qu[slug] = picks[0][0]["meta"]["w"] * picks[0][0]["meta"]["h"]
        print(f"  {slug:<16} {picks[0][0]['src']:<22} {picks[0][0]['meta']['w']}x{picks[0][0]['meta']['h']:<5} "
              f"score={picks[0][0]['score']:<6} lisensi={str(picks[0][0]['license'])[:14]}")

    main_items = [m for m in manifest if m["rank"] == 1]
    (POOL / "manifest.json").write_text(json.dumps(
        {"menu_types": len(main_items), "files": len(manifest), "items": manifest},
        indent=2, ensure_ascii=False), encoding="utf-8")

    # contact sheet untuk review manual
    cards = "\n".join(
        f'<figure><img src="{m["file"]}" loading="lazy"><figcaption><b>{html.escape(m["title"])}</b>'
        f'<span>{html.escape(m["slug"])} &middot; {m["w"]}x{m["h"]} &middot; {html.escape(str(m["license"]))}</span>'
        f'<span class="src">{html.escape(m["source"])}</span></figcaption></figure>'
        for m in sorted(main_items, key=lambda x: x["slug"]))
    (POOL / "review.html").write_text(f"""<!doctype html><meta charset="utf-8">
<title>Pool gambar — 1 foto per jenis menu</title>
<style>
 body{{font:14px system-ui;background:#0f1115;color:#e6e8ee;margin:0;padding:24px}}
 h1{{font-size:18px;margin:0 0 4px}} p{{color:#98a0b3;margin:0 0 20px}}
 .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px}}
 figure{{margin:0;background:#171a21;border:1px solid #232734;border-radius:10px;overflow:hidden}}
 img{{width:100%;height:150px;object-fit:cover;display:block}}
 figcaption{{padding:8px 10px;display:flex;flex-direction:column;gap:3px;font-size:12px}}
 figcaption span{{color:#8b93a7;font-size:11px}} .src{{color:#6b7280}}
</style>
<h1>Pool gambar — 1 foto per jenis menu</h1>
<p>{len(main_items)} jenis menu &middot; semua sumber CC/CC0/ODbL &middot; untuk review: hapus/hapus-tandai yang tidak cocok</p>
<div class="grid">{cards}</div>""", encoding="utf-8")
    print(f"\njenis menu: {len(main_items)} | total file (termasuk alt): {len(manifest)}")
    print("review:", POOL / 'review.html')


if __name__ == "__main__":
    main()
