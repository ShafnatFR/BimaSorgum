// src/services/recipeImageResolver.ts
var MODIFIER_TOKENS = /* @__PURE__ */ new Set([
  "sorgum",
  "sorghum",
  "sorgummya",
  "tepung",
  "tepungnya",
  "komposit",
  "santan",
  "santannya",
  "madu",
  "kecap",
  "manis",
  "asin",
  "gurih",
  "gurihnya",
  "rendah",
  "gi",
  "gula",
  "gluten",
  "bebas",
  "tinggi",
  "serat",
  "protein",
  "kalsium",
  "kaya",
  "zat",
  "besi",
  "vitamin",
  "sehat",
  "sehatnya",
  "bergizi",
  "spesial",
  "khas",
  "kukusnya",
  "tim",
  "tumisnya",
  "kreasi",
  "kreasinya",
  "olahan",
  "untuk",
  "anak",
  "anaknya",
  "balita",
  "sekolah",
  "sd",
  "smp",
  "mpasi",
  "keluarga",
  "porsi",
  "rumahan",
  "praktis",
  "mudah",
  "sederhana",
  "ekonomis",
  "murah",
  "hemat",
  "cepat",
  "instan",
  "favorit",
  "kesukaan",
  "menu",
  "resep",
  "edition",
  "versi",
  "dengan",
  "dan",
  "yang",
  "yang",
  "ala",
  "khas",
  "khasnya",
  "style",
  "gaya",
  "lembut",
  "kental",
  "creamy",
  "krim",
  "renyah",
  "crispy",
  "panggang",
  "gorengan",
  "warna",
  "warni",
  "pelengkap",
  "saus",
  "sambal",
  "bumbu",
  "sisa"
]);
var KEEP_PHRASES = [
  "nasi goreng",
  "nasi uduk",
  "nasi kuning",
  "nasi liwet",
  "nasi tim",
  "nasi kukus",
  "bubur ayam",
  "bubur sumsum",
  "es cendol",
  "es dawet",
  "es campur",
  "es teler",
  "mie goreng",
  "bihun goreng",
  "kwetiau",
  "tempe mendoan",
  "telur balado",
  "telur dadar",
  "ayam goreng",
  "ayam pop",
  "ayam bakar",
  "ikan goreng",
  "ikan bakar",
  "tahu goreng",
  "ubi goreng",
  "pisang goreng",
  "susu kedelai",
  "susu jagung",
  "bolu kukus",
  "kue kukus",
  "kacang hijau",
  "kacang tanah"
];
var INGREDIENT_KEYS = /* @__PURE__ */ new Set([
  "sorgum",
  "sorghum",
  "biji-sorgum",
  "tepung-sorgum",
  "beras",
  "beras-ketan",
  "ketan",
  "telur",
  "ayam",
  "daging",
  "ikan",
  "udang",
  "tempe",
  "tahu",
  "sayur",
  "sayuran",
  "madu",
  "gula",
  "gula-merah",
  "gula-aren",
  "susu",
  "santan",
  "kelapa",
  "pisang",
  "wortel",
  "jagung",
  "labu",
  "kacang",
  "kacang-hijau",
  "kacang-tanah",
  "kedelai",
  "bawang",
  "bawang-merah",
  "bawang-putih",
  "cabai",
  "jahe",
  "kunyit",
  "lengkuas",
  "minyak",
  "mentega",
  "garam",
  "kecap",
  "saus",
  "sambal",
  "bumbu",
  "rempah",
  "cokelat",
  "keju",
  "terigu",
  "tepung-beras",
  "tepung-beras-ketan",
  "singkong",
  "ubi",
  "kentang",
  "bayam",
  "kangkung",
  "sawi",
  "kol",
  "tauge",
  "tomat",
  "timun",
  "mangga",
  "jeruk",
  "apel",
  "semangka",
  "pepaya",
  "kurma",
  "kismis",
  "almond",
  "kenari",
  "sereal",
  "oat",
  "gandum",
  "millet",
  "barley",
  "quinoa",
  "beras-merah",
  "beras-hitam"
]);
function isIngredient(key, entry) {
  if (INGREDIENT_KEYS.has(key)) return true;
  const words = key.split("-").filter(Boolean);
  return words.length === 1 && words[0].length <= 6 && !!entry.hint && entry.images.length <= 2;
}
var FAMILY_STOP = /* @__PURE__ */ new Set(["kategori", "es", "kue", "nasi", "mie", "bubur"]);
var GENERIC_TOKENS = /* @__PURE__ */ new Set([
  "minuman",
  "makanan",
  "camilan",
  "kue",
  "hidangan",
  "olahan",
  "gorengan",
  "jajanan",
  "bawang",
  "pandan",
  "santan",
  "madu",
  "kecap",
  "gula",
  "keju",
  "cokelat",
  "vanila",
  "sayur",
  "sayuran",
  "buah",
  "daun",
  "biji",
  "kering",
  "basah",
  "kuah",
  "isi",
  "balut",
  "taburan",
  "pelengkap",
  "campur",
  "warna",
  "warni",
  "kreasi",
  "variasi",
  "paduan"
]);
var HEAD_ALIAS = {
  nasi: ["nasi-uduk", "nasi-kuning", "nasi-goreng", "nasi-tim", "nasi-liwet", "nasi-padang", "nasi-tumpeng"],
  sup: ["sup-ayam", "soto-ayam", "sop-buntut", "sayur-lodeh", "sayur-asem"],
  sop: ["sup-ayam", "soto-ayam", "sop-buntut", "sayur-lodeh"],
  chowder: ["sup-ayam", "soto-ayam", "sayur-lodeh"],
  soup: ["sup-ayam", "soto-ayam"],
  tumis: ["tumis-sayur", "tumis-kangkung", "sayur-lodeh"],
  bola: ["perkedel", "bakwan", "cilok"],
  bakso: ["bakso", "cilok"],
  kukis: ["kue-kering", "muffin", "brownies", "bolu-kukus", "kue-lapis"],
  cookies: ["kue-kering", "muffin", "brownies"],
  roti: ["bolu", "kue-kering", "muffin"],
  bread: ["bolu", "kue-kering"],
  susu: ["susu-kedelai", "susu-jagung"],
  salad: ["salad", "buddha-bowl", "gado-gado", "karedok", "lotek", "rujak"],
  sereal: ["sereal", "oat", "bubur-sumsum"],
  omelet: ["telur-dadar", "omelet", "telur-balado"],
  jeruk: ["es-jeruk", "jeruk"],
  minuman: ["es-cendol", "es-dawet", "susu-kedelai", "wedang-jahe", "es-jeruk", "dawet"],
  jus: ["es-jeruk", "smoothie"],
  bubur: ["bubur-ayam", "bubur-sumsum", "bubur-kacang-hijau"],
  mie: ["mie-goreng", "bihun-goreng", "kwetiau"],
  kue: ["kue-lapis", "bolu-kukus", "kue-kering", "klepon", "onde-onde", "bolu"],
  puding: ["puding"],
  camilan: ["perkedel", "bakwan", "klepon", "onde-onde", "pastel", "risoles"]
};
function aliasEntry(head) {
  if (!INDEX) return null;
  const keys = new Set(HEAD_ALIAS[head] || []);
  for (const k of Object.keys(INDEX.items)) if (k === head || k.startsWith(head + "-")) keys.add(k);
  const images = [];
  for (const k of keys) {
    const e = INDEX.items[k];
    if (!e) continue;
    for (const img of e.images) {
      if (images.length >= 30) break;
      if (!images.some((x) => x.url === img.url)) images.push(img);
    }
    if (images.length >= 30) break;
  }
  return images.length ? { key: `alias:${head}`, images } : null;
}
function familyToken(key) {
  const words = key.split("-").filter(Boolean);
  return words.slice(0, 2).join("-");
}
var INDEX = null;
var USAGE = {};
var CATEGORY_KEYS = ["makanan_berat", "camilan_sehat", "minuman_nutrisi", "dessert_rendah_gi"];
function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function normalizeTitle(title) {
  const t = (title || "").toLowerCase();
  const phraseHit = [];
  for (const p of KEEP_PHRASES) if (t.includes(p)) phraseHit.push(p);
  const tokens = t.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).filter((w) => !MODIFIER_TOKENS.has(w) && !/^\d+$/.test(w) && w.length > 2);
  return [.../* @__PURE__ */ new Set([...phraseHit, ...tokens])];
}
function scoreEntry(tokens, rawTitle, key, entry) {
  const title = entry.title.toLowerCase();
  let score = 0;
  if (rawTitle.includes(title)) score += 6 + title.length / 10;
  const first = tokens[0] || "";
  if (first && !GENERIC_TOKENS.has(first) && key.includes(first)) score += 0.5;
  for (const tok of tokens) {
    if (GENERIC_TOKENS.has(tok)) continue;
    if (tok.length < 4) continue;
    if (title.includes(tok)) score += tok.length >= 5 ? 2 : 1;
    else if (key.includes(tok)) score += 1.5;
  }
  const titleWords = title.split(/[\s-]+/).filter((w) => w.length > 3);
  const hits = tokens.filter((t) => !GENERIC_TOKENS.has(t) && t.length >= 4 && title.includes(t)).length;
  if (titleWords.length >= 2 && hits <= 1 && !rawTitle.includes(title)) score *= 0.6;
  return score;
}
function editDistanceAtMost1(a, b) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, diff = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++diff > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return diff + (a.length - i) + (b.length - j) <= 1;
}
function aliasKeyForToken(tok) {
  if (HEAD_ALIAS[tok]) return tok;
  if (tok.length < 4) return null;
  for (const head of Object.keys(HEAD_ALIAS)) {
    if (Math.abs(head.length - tok.length) <= 1 && editDistanceAtMost1(tok, head)) return head;
  }
  return null;
}
function matchMenuKey(title) {
  if (!INDEX) return null;
  const tokens = normalizeTitle(title);
  if (!tokens.length) return null;
  const raw = (title || "").toLowerCase();
  let best = null;
  for (const [key, entry] of Object.entries(INDEX.items)) {
    if (isIngredient(key, entry)) continue;
    const s = scoreEntry(tokens, raw, key, entry);
    if (s <= 0) continue;
    if (!best || s > best.score) best = { key, score: s };
  }
  if (best && best.score < 2) best = null;
  const head = aliasKeyForToken(tokens[0] || "");
  if (head && (!best || best.score < 4)) {
    const a = aliasEntry(head);
    if (a) return { key: `alias:${head}`, score: 2 };
  }
  if (best) return best;
  const byLen = [...tokens].sort((a, b) => b.length - a.length);
  for (const tok of byLen) {
    const h = aliasKeyForToken(tok);
    if (h && aliasEntry(h)) return { key: `alias:${h}`, score: 2 };
  }
  return null;
}
function entryByKey(key) {
  if (!INDEX) return null;
  if (key.startsWith("alias:")) {
    const a = aliasEntry(key.slice(6));
    return a ? { title: key.slice(6), hint: void 0, images: a.images } : null;
  }
  return INDEX.items[key] ?? null;
}
function familyImages(menuKey, exclude) {
  if (!INDEX) return { key: menuKey, images: [] };
  const fam = familyToken(menuKey);
  if (!fam || FAMILY_STOP.has(fam)) return { key: menuKey, images: [] };
  const images = [];
  for (const [key, entry] of Object.entries(INDEX.items)) {
    if (key === menuKey) continue;
    if (!key.startsWith(fam)) continue;
    if (isIngredient(key, entry)) continue;
    for (const img of entry.images) {
      if (exclude.has(img.url)) continue;
      if (images.length >= 24) break;
      images.push(img);
    }
    if (images.length >= 24) break;
  }
  return { key: `${menuKey}~keluarga`, images };
}
function imageKeyOf(menuKey, i) {
  return `${menuKey}#${i}`;
}
function pickImageIndex(menuKey, count, seed, usage = USAGE) {
  if (count <= 1) return 0;
  const start = hash32(seed || menuKey) % count;
  let best = start;
  let bestUse = Infinity;
  for (let k = 0; k < count; k++) {
    const i = (start + k) % count;
    const u = usage[imageKeyOf(menuKey, i)] ?? 0;
    if (u < bestUse) {
      bestUse = u;
      best = i;
    }
  }
  return best;
}
function categoryPool(category) {
  if (!INDEX) return { key: "kategori:umum", images: [] };
  const want = category && CATEGORY_KEYS.includes(category) ? category : null;
  const take = (filter, limit) => {
    const imgs = [];
    for (const [key, entry] of Object.entries(INDEX.items)) {
      if (key.startsWith("kategori:")) continue;
      if (isIngredient(key, entry)) continue;
      if (!filter(entry.hint)) continue;
      for (const img of entry.images) {
        if (imgs.length >= limit) break;
        if (!imgs.some((x) => x.url === img.url)) imgs.push(img);
      }
      if (imgs.length >= limit) break;
    }
    return imgs;
  };
  let images = want ? take((h) => h === want, 40) : [];
  if (images.length < 24) {
    const extra = take((h) => !want || h !== want, 40 - images.length);
    images = [...images, ...extra.filter((e) => !images.some((x) => x.url === e.url))];
  }
  if (images.length < 24) {
    const all = take(() => true, 40);
    images = [...images, ...all.filter((e) => !images.some((x) => x.url === e.url))];
  }
  return { key: `kategori:${want ?? "umum"}`, images };
}
function resolveMenuImage(title, dishCategory, seed) {
  const match = matchMenuKey(title);
  if (match && INDEX) {
    const entry = entryByKey(match.key);
    if (entry && entry.images.length) {
      const ownUrls = new Set(entry.images.map((i) => i.url));
      const fam = !match.key.startsWith("alias:") && entry.images.length < 8 ? familyImages(match.key, ownUrls) : { key: match.key, images: [] };
      const candidates = [
        ...entry.images.map((img) => ({ img, key: match.key })),
        ...fam.images.map((img) => ({ img, key: fam.key }))
      ];
      const start = hash32(seed || title) % candidates.length;
      let chosen = candidates[0];
      let chosenAt = 0;
      let bestUse = Infinity;
      for (let k = 0; k < candidates.length; k++) {
        const at = (start + k) % candidates.length;
        const c = candidates[at];
        const u = USAGE[imageKeyOf(c.key, at)] ?? 0;
        if (u < bestUse) {
          bestUse = u;
          chosen = c;
          chosenAt = at;
        }
      }
      const fromFamily = chosen.key !== match.key;
      const refEntry = fromFamily ? { title: entryByKey(chosen.key.replace("~keluarga", ""))?.title || entry.title, hint: entry.hint, images: [] } : entry;
      return {
        url: chosen.img.url,
        menuKey: match.key,
        imageKey: imageKeyOf(match.key, chosenAt),
        title: refEntry.title,
        credit: creditOf(refEntry, chosen.img),
        page: chosen.img.page || "",
        matched: true
      };
    }
  }
  const pool = categoryPool(dishCategory);
  if (pool.images.length) {
    const i = pickImageIndex(pool.key, pool.images.length, seed || title);
    const img = pool.images[i];
    return {
      url: img.url,
      menuKey: pool.key,
      imageKey: imageKeyOf(pool.key, i),
      title: "Foto kategori",
      credit: creditOf(null, img),
      page: img.page || "",
      matched: false
    };
  }
  return { url: "", menuKey: "", imageKey: "", title: "", credit: "", page: "", matched: false };
}
function creditOf(entry, img) {
  const bits = [];
  if (entry?.title) bits.push(entry.title);
  if (img.author) bits.push(img.author);
  if (img.license) bits.push(img.license);
  if (img.source) bits.push(img.source);
  return bits.join(" \xB7 ") || "Sumber: Wikimedia Commons";
}
function setMenuImageIndex(next) {
  INDEX = next;
}
function isMenuIndexReady() {
  return !!INDEX;
}
function menuImageStats() {
  if (!INDEX) return { menus: 0, images: 0 };
  const entries = Object.values(INDEX.items);
  return {
    menus: entries.length,
    images: entries.reduce((a, e) => a + e.images.length, 0)
  };
}
async function primeMenuImageIndex(url = "/menu-images.json") {
  if (INDEX) return INDEX;
  try {
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.items) return null;
    INDEX = json;
    return INDEX;
  } catch {
    return null;
  }
}
function setImageUsage(map) {
  for (const k of Object.keys(USAGE)) delete USAGE[k];
  for (const [k, v] of Object.entries(map || {})) USAGE[k] = v;
}
function recordImageUsage(imageKey) {
  if (!imageKey) return;
  USAGE[imageKey] = (USAGE[imageKey] ?? 0) + 1;
}
function currentUsage() {
  return { ...USAGE };
}
export {
  creditOf,
  currentUsage,
  imageKeyOf,
  isMenuIndexReady,
  matchMenuKey,
  menuImageStats,
  normalizeTitle,
  pickImageIndex,
  primeMenuImageIndex,
  recordImageUsage,
  resolveMenuImage,
  setImageUsage,
  setMenuImageIndex
};
