"""Bangun indeks gambar SIAP PAKAI: satu nama menu -> satu URL foto.

Sumber (semuanya berbasis link, bukan scraping halaman):
  1. id.wikipedia  : pageimage artikel masakan (foto = masakan itu sendiri, akurat)
  2. Wikidata P18  : untuk masakan yang tidak punya artikel id.wikipedia
  3. TheMealDB     : 790 meal, tiap meal ada strMealThumb (katalog siap pakai)
  4. TheCocktailDB : minuman (Shake / Cocoa / Coffee-Tea / Soft Drink)

Output: menu_images.json + laporan coverage.
"""
import json, time, urllib.parse, urllib.request
from pathlib import Path

TMP = Path(r"C:\Users\shafnats\AppData\Local\Temp")
UA = "SorghumCareImageIndex/0.1 (shafnatfuainiramadhan@gmail.com)"
OUT = TMP / "menu_images.json"

# nama menu Indonesia (judul artikel id.wikipedia)
DISHES = [
    "Nasi uduk", "Nasi goreng", "Nasi kuning", "Nasi liwet", "Nasi padang", "Nasi tumpeng",
    "Nasi kebuli", "Nasi kucing", "Nasi uduk", "Bubur ayam", "Bubur sumsum", "Bubur kacang hijau",
    "Soto ayam", "Soto betawi", "Soto madura", "Soto lamongan", "Rawon", "Gudeg", "Pempek",
    "Gado-gado", "Karedok", "Lotek", "Pecel", "Ketoprak", "Siomay", "Batagor", "Rujak",
    "Sate ayam", "Sate madura", "Sate padang", "Rendang", "Ayam goreng", "Ayam geprek",
    "Ayam bakar", "Ayam pop", "Telur balado", "Telur dadar", "Dendeng", "Gulai", "Semur",
    "Tempe mendoan", "Tempeh", "Tahu goreng", "Perkedel", "Bakwan", "Bakso", "Cilok",
    "Tumis kangkung", "Sayur asem", "Sayur lodeh", "Sup ayam", "Sop buntut", "Bihun goreng",
    "Mie goreng", "Kwitiau", "Lumpia", "Risoles", "Pastel", "Martabak", "Kerak telor",
    "Es cendol", "Es dawet", "Es campur", "Es teler", "Wedang jahe", "Wedang uwuh",
    "Susu kedelai", "Smoothie", "Milkshake", "Kue lapis", "Klepon", "Onde-onde", "Putu ayu",
    "Serabi", "Wajik", "Bolu kukus", "Puding", "Pancake", "Brownies", "Muffin", "Kue kering",
    "Risotto", "Sorgum", "Buddha bowl", "Salad",
]


def api(url, timeout=40, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            return json.loads(urllib.request.urlopen(req, timeout=timeout).read())
        except Exception:
            time.sleep(1.5 * (i + 1))
    return None


def wikipedia_images(titles, batch=40):
    """pageimage + URL artikel untuk tiap judul."""
    out = {}
    for i in range(0, len(titles), batch):
        chunk = titles[i:i + batch]
        url = ("https://id.wikipedia.org/w/api.php?action=query&format=json&redirects=1"
               "&prop=pageimages|info&inprop=url&piprop=original|thumbnail&pithumbsize=1400"
               "&titles=" + urllib.parse.quote("|".join(chunk)))
        d = api(url)
        if not d:
            continue
        q = d.get("query", {})
        norm = {}
        for r in q.get("redirects", []) or []:
            norm[r["to"]] = r["from"]
        for p in (q.get("pages", {}) or {}).values():
            title = p.get("title", "")
            src = (p.get("thumbnail") or {}).get("source") or (p.get("original") or {}).get("source")
            if not src or p.get("missing"):
                continue
            key = norm.get(title, title)
            out[key] = {"image_url": src, "page_url": p.get("fullurl", ""),
                        "wiki_title": title, "source": "id.wikipedia"}
    return out


def wikidata_image(name):
    d = api("https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=id"
            "&uselang=id&limit=5&search=" + urllib.parse.quote(name))
    if not d:
        return None
    for hit in d.get("search", []):
        qid = hit["id"]
        e = api(f"https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&ids={qid}"
                "&props=claims|labels&languages=id|en")
        if not e:
            continue
        ent = e.get("entities", {}).get(qid, {})
        claims = ent.get("claims", {})
        img = claims.get("P18")
        if not img:
            continue
        fname = img[0]["mainsnak"]["datavalue"]["value"]
        # hanya terima kalau item-nya makanan/minuman
        p31 = [c["mainsnak"].get("datavalue", {}).get("value", {}).get("id")
               for c in claims.get("P31", [])]
        return {"image_url": ("https://commons.wikimedia.org/wiki/Special:FilePath/"
                              + urllib.parse.quote(fname.replace(" ", "_")) + "?width=1200"),
                "page_url": f"https://www.wikidata.org/wiki/{qid}",
                "qid": qid, "fname": fname, "instance_of": p31, "source": "wikidata:P18"}
    return None


def themealdb_catalog():
    meals = {}
    for ch in "abcdefghijklmnopqrstuvwxyz":
        d = api(f"https://www.themealdb.com/api/json/v1/1/search.php?f={ch}")
        for m in (d or {}).get("meals") or []:
            meals[m["strMeal"]] = {"image_url": m["strMealThumb"], "id": m["idMeal"],
                                   "category": m.get("strCategory"), "area": m.get("strArea"),
                                   "source": "themealdb"}
        time.sleep(0.2)
    return meals


def cocktaildb_catalog():
    drinks = {}
    cats = ["Shake", "Cocoa", "Coffee / Tea", "Soft Drink", "Punch / Party Drink", "Ordinary Drink"]
    for c in cats:
        d = api("https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=" + urllib.parse.quote(c))
        for x in (d or {}).get("drinks") or []:
            drinks.setdefault(x["strDrink"], {"image_url": x["strDrinkThumb"],
                                              "id": x["idDrink"], "category": c,
                                              "source": "thecocktaildb"})
        time.sleep(0.2)
    return drinks


def main():
    idx = {}
    print("== 1) id.wikipedia pageimage ==")
    wiki = wikipedia_images(DISHES)
    print(f"   dapat {len(wiki)}/{len(DISHES)}")
    for k, v in wiki.items():
        idx[k] = v
    missing = [d for d in DISHES if d not in wiki]
    print("   belum ada:", ", ".join(missing))
    print("== 2) Wikidata P18 untuk yang belum ada ==")
    for name in missing:
        r = wikidata_image(name)
        if r:
            idx[name] = r
            print(f"   + {name:<20} {r['instance_of']}")
        else:
            print(f"   - {name:<20} tidak ada")
    print("== 3) TheMealDB ==")
    meals = themealdb_catalog()
    print("   meal:", len(meals))
    print("== 4) TheCocktailDB ==")
    drinks = cocktaildb_catalog()
    print("   minuman:", len(drinks))

    data = {
        "menu_indonesia": {k: v for k, v in idx.items()},
        "katalog_themealdb": meals,
        "katalog_thecocktaildb": drinks,
        "ringkasan": {
            "menu_indonesia_dengan_link": len(idx),
            "tanpa_link": [d for d in DISHES if d not in idx],
            "themealdb": len(meals),
            "thecocktaildb": len(drinks),
        },
    }
    OUT.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nmenu Indonesia dengan link siap pakai: {len(idx)}/{len(DISHES)}")
    print(f"TheMealDB (satu foto = satu menu): {len(meals)}")
    print(f"TheCocktailDB (minuman): {len(drinks)}")
    print("hasil:", OUT)


if __name__ == "__main__":
    main()
