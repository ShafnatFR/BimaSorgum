# Sumber Gambar Makanan Open Source — Hasil Riset + Strategi

Konteks: SorghumCare (`shafnat.llmsorgum.online`) saat ini punya **137 resep tapi hanya 12 foto unik**
(1 foto dipakai 52 resep). `src/data/imageAssets.ts` hanya memetakan ~15 keyword → 15 URL Unsplash
hotlink, jadi judul AI-generated apa pun akan jatuh ke salah satu dari 12 foto itu.

Dokumen ini: (1) daftar sumber terbuka yang sudah dicek langsung, (2) aturan lisensi, (3) strategi
sampling + assignment.

---

## 1. Tier A — foto masakan Indonesia (paling relevan)

| Sumber | Isi (terverifikasi) | Lisensi | Akses |
|---|---|---|---|
| kaggle `faldoae/padangfood` | 9 kelas, 993 foto, 118 MB — ayam_goreng, ayam_pop, daging_rendang, dendeng_batokok, gulai_ikan, gulai_tambusu, gulai_tunjang, telur_balado, telur_dadar | ODbL-1.0 (bebas pakai + atribusi) | kaggle CLI, sudah diunduh |
| kaggle `nizamkurniawan/jajanan-tradisional-jawa-tengah` | 6 kelas x 300 = 1.800 foto, 40 MB — grontol, lanting, lumpia, putu ayu, serabi solo, wajik | CC0-1.0 (tanpa syarat) | kaggle CLI, sudah diunduh |
| kaggle `rizkyyk/dataset-food-classification` | 13 kelas x 500 = 6.500 foto, 1,17 GB (Ayam Goreng, Burger, French Fries, Gado-Gado, ...) | MIT | kaggle CLI |
| kaggle `nadyatirtasyafira/indonesian-traditional-food-image-dataset` | 11 kelas, ~2.628 foto, 1,05 GB — gado-gado, lotek, karedok, sate madura, siomay, batagor, ketoprak, kupat tahu, nasi pecel, nasi lengko, cilok | unknown (minta izin author) | kaggle CLI |
| kaggle `karin06/indonesian-traditional-snacks-image-dataset` | 1,43 GB, jajanan pasar | CC-BY-NC-SA-4.0 (NON-komersial) | kaggle CLI |
| kaggle `theresalusiana/indonesian-food`, `robertusbagaskara/indonesian-food-image`, `zacvin/makanan-traditional-indonesia`, `anisahwulandari/makanan-ringan`, `zulfikriedryann/folder-makanan-indonesia`, `saddamaditya/makanan` | 39 MB–3,4 GB, tanpa deskripsi kelas | mostly unknown / DbCL-1.0 | kaggle CLI, perlu audit manual |
| Roboflow Universe `bangkit/indonesian-food-pedsx` | dataset klasifikasi makanan Indonesia, 6,13k views | CC BY 4.0 | API key Roboflow (gratis) |
| Zenodo: "Indonesian Traditional Snack", "Eid Ketupat" | dataset kecil | CC-BY-NC / CC-BY-NC-SA | unduh langsung |
| Wikimedia Commons + Openverse | tak terbatas per kata kunci, hasil uji: 22 query → 638 kandidat unik layak (29/query) | CC0/CC BY/CC BY-SA (sudah difilter commercial+modification) | API tanpa key (Openverse anon 200 req/hari) |

## 2. Tier B — besar, generik / internasional

| Sumber | Isi | Lisensi | Catatan |
|---|---|---|---|
| HF `seanghay/food258k` | 11,24 GB, masakan Asia (Khmer/Thai/Viet) | ODC-BY | label kelas bahasa Inggris |
| HF `ethz/food101` (= Food-101) | 101.000 foto, 101 kelas | unknown / `copyright-authors` (Foodspotting) | riset, jangan hotlink di produk |
| Kaggle `kmader/food41`, `dansbecker/food-101` | mirror Food-101 (5,7 / 10 GB) | copyright-authors | idem |
| Kaggle `utkarshsaxenadn/fast-food-classification-dataset` | 20k foto, 860 MB | CC0 | fast food: burger, pizza, donat |
| Kaggle `iamsouravbanerjee/indian-food-images-dataset` | 80 kelas, 4.000 foto, 371 MB | "other" | India |
| Kaggle `pes12017000148/food-ingredients-and-recipe-dataset-with-images` | ~13k foto + resep (Epicurious) | CC-BY-SA-3.0 | bagus buat "resep + foto" |
| Kaggle `quandang/vietnamese-foods` (30VNFoods) | 25.136 foto, 30 kelas, 4,5 GB | CC-BY-NC-SA (NC) | non-komersial |
| HF `Humanbased-AI/MM-Food-100K` | 100k sampel multimodal | OpenRAIL | perlu cek klausa |
| HF `bharat-raghunathan/indian-foods-dataset` | 15 kelas, 4.770 foto | CC0 | India |
| HF `mrdbourke/food_vision_199_classes` | 199 kelas, 24.694 file | tidak disebut | turunan Food-101 + ekstra |
| Google Open Images V7 | 602 kelas, ~25 kelas makanan (Bread, Cake, Cookie, Pancake, Pizza, Salad, Sandwich, Waffle, Fruit, Vegetable, Tea, Coffee) | gambar CC BY 2.0, anotasi CC BY 4.0 | kelas terlalu kasar untuk nama masakan |
| HF `kng-research/uecfood256`, `justinsiow/UECFOODPIXCOMPLETE` | 256 kelas, masakan Jepang | riset | — |

## 3. Tier C — akademik besar, RISET-ONLY (jangan dipakai di produk publik)

| Sumber | Isi | Kenapa hati-hati |
|---|---|---|
| ISIA Food-500 | 399.726 foto, 500 kelas | lisensi non-komersial, unduh via situs ICT CAS |
| Food2K | 2.000 kelas, >1 juta foto | perlu perjanjian + email |
| Recipe1M+ (MIT) | 1 juta resep, 13 juta foto | registrasi, syarat riset |
| Food-101N | 310.000 foto noisy | output scraping tanpa pembersihan hak |
| Foodish API | — | **sudah mati** ("Service Suspended", dikonfirmasi) |

## 4. Aturan lisensi

1. Pakai hanya CC0 / CC BY / CC BY-SA / ODbL / MIT / DbCL / CC-BY 4.0 / public domain.
2. Buang **NC** (non-komersial) dan **ND** (no-derivative) untuk produk: 30VNFoods, karin06, Zenodo snack, ISIA-500, Food2K, Recipe1M+.
3. CC BY / CC BY-SA / ODbL **wajib atribusi** — simpan `author`, `license`, `source_url` di DB dan tampilkan di halaman resep.
4. Food-101 dkk = `copyright-authors` (Foodspotting) → aman untuk riset/klasifikasi internal, tidak untuk disajikan ke publik sebagai foto resep.

## 5. Pendekatan terpilih: indeks link siap pakai (1 foto = 1 jenis menu)

Hasil uji: pendekatan "cari kata kunci → pilih foto" (Commons/Openverse full-text search) memberi
**16 dari 46 foto salah** (35%) — contoh nyata: label `milkshake` dapat foto anak bebek, `lanting`
dapat foto monumen Tionghoa, `risotto` dapat foto resep tulisan tangan, `susu sorgum` dapat grid biji-bijian.

Pendekatan yang jauh lebih akurat: **indeks dish → link foto**, bukan pencarian kata kunci.
Sumbernya berbasis judul/artikel masakannya sendiri, jadi fotonya nyaris pasti benar.

| Sumber | Jumlah | Bentuk output | Lisensi |
|---|---|---|---|
| id.wikipedia `pageimages` (artikel masakan) | 77 nama masakan ID | URL foto + URL artikel | CC (per berkas Commons) |
| Wikidata `P18` (property image item masakan) | 5 pelengkap | URL Commons `Special:FilePath` | CC |
| Commons kategori (`Category:<masakan>`) | pelengkap | URL thumbnail | CC |
| TheMealDB `strMealThumb` | **790 meal** (14 kategori, 190 area; tidak ada area Indonesian) | URL foto siap pakai | komersial: wajib jadi supporter; hak gambar tidak dinyatakan CC |
| TheCocktailDB `strDrinkThumb` | **203 minuman** (Shake/Cocoa/Coffee-Tea/Soft Drink) | URL foto siap pakai | sama seperti TheMealDB |

Hasil nyata: **82 nama menu Indonesia** sudah dapat link foto (82/85 dicoba), 0 foto kembar,
audit visual sampel 24 → 22 benar (92%) → 2 rusak diperbaiki (`Ketoprak` lewat artikel
"Ketoprak (makanan)", `Bakwan` lewat Commons `File:Bakwan Goreng.jpg`) → sampel ulang 24/24 benar.
Total indeks: 82 + 790 + 203 = **1.075 menu, masing-masing 1 foto berbeda**.

Artefak (sudah di repo):
- `tools/image-index/menu-images.json` — indeks lengkap (nama menu → `image_url`, `page_url`, `source`, `license`, `author`)
- `tools/image-index/preview.html` — halaman review 1.075 foto (buka di browser)
- `tools/image-index/build-links.py` — skrip pembangun indeks (id.wikipedia + Wikidata + TheMealDB + TheCocktailDB)

### 5.1 Sistem yang dipakai aplikasi (agar foto tiap resep beda & sesuai nama)

Indeks diperluas lewat crawl kategori id.wikipedia (`Hidangan Indonesia`, `Kue Indonesia`,
`Minuman Indonesia`, `Jajanan`) → 882 menu, **2.857 foto** (rata-rata 3,2 foto/menu), semua
berlisensi CC/CC0/ODbL (NC/ND dibuang).

| Berkas | Fungsi |
|---|---|
| `public/menu-images.json` | indeks runtime (882 menu; dimuat sekali oleh app) |
| `src/services/recipeImageResolver.ts` | resolver: normalisasi judul → cocokkan menu → pilih foto least-used |
| `src/lib/supabase.ts` | `primeRecipeImages()` (muat indeks + peta pemakaian), `upsertRecipe()` menyimpan `image_url/image_key/image_credit/image_page` |
| `supabase/migrations/007_recipe_image_meta.sql` | kolom `image_key/image_credit/image_page` + view `recipe_image_usage` |
| `tools/image-index/test-resolver.mjs` | uji resolver pada 140 resep nyata (bundle esbuild + node) |
| `tools/image-index/backfill-recipe-images.mjs` | isi/perbaiki foto semua resep lama memakai resolver yang sama |

Cara kerja resolver:
1. Judul dinormalisasi: modifier ("sorgum", "santan", "rendah GI", "untuk anak", ...) + kata umum
   ("minuman", "bawang", "pandan") dibuang; "nasi goreng"/"es cendol" dipertahankan sebagai frasa.
2. Pencocokan: frasa utuh > kata kuat; entri bahan (sorgum, telur, beras, ...) tidak boleh menang.
3. Kalau tidak ada menu spesifik → **kata kepala** (`alias:nasi`, `alias:bubur`, `alias:tumis`,
   `alias:cookies`, `alias:minuman`, ...) meminjam foto menu sejenis, toleran salah ketik ("bubul"→bubur).
4. Sisa terakhir → pool kategori (40 foto per kategori, bukan 1 foto global).
5. Pemilihan foto = **paling sedikit dipakai**; seri diputar dengan hash slug resep → resep berbeda
   dapat foto berbeda, dan satu foto baru dipakai lagi setelah foto lain di menu itu terpakai.

Hasil uji pada 140 resep nyata (`node tools/image-index/test-resolver.mjs`):
- cocok ke menu indeks: **128/140 (91,4%)**, sisanya pool kategori
- **0** resep tanpa foto, **0** foto dipakai lintas menu
- **117 foto berbeda** untuk 140 resep (sebelumnya 12 foto untuk 137 resep)
- pemakaian maksimum: 4 resep per foto (sebelumnya 52 resep untuk 1 foto)
- `npx tsc --noEmit` lolos

Backfill sudah dijalankan ke Supabase: 140 baris terisi `image_url` + `image_key` + atribusi;
di DB saat ini 100 foto unik (angka lebih kecil dari uji karena pemakaian lama ikut dihitung).

Cara pakai di app: resolver memetakan judul resep → nama menu (buang modifier "sorgum"/"santan"/"rendah GI")
→ ambil `image_url` dari indeks; kalau tidak ada, baru masuk jalur pencarian/pool di bawah.

## 6. Strategi pelengkap (untuk menu yang tidak ada di indeks)

Fakta kunci: judul resep dihasilkan AI, jadi tidak mungkin dibuat peta keyword→foto manual.
Butuh 3 lapis:

**Lapis 1 — pool terkurasi (offline, sekali unduh).**
Gabung Tier A + Tier B: ±15.000–20.000 foto bersih untuk kelas yang dikenal
(nasi goreng, ayam goreng, gado-gado, batagor, jajanan, pancake, cookie, sup, smoothie, dll).
Simpan sebagai `assets` di Supabase Storage (bukan hotlink), bukan sebagai 1 file di repo.

**Lapis 2 — pencarian on-demand untuk nama yang tidak ada di pool.**
Normalisasi judul → kata kunci inti (buang modifier "sorgum", "santan", "rendah GI"):
`"Nasi Sorgum Santan Ayam Kecap"` → query `nasi ayam kecap` → Commons + Openverse.
Simpan hasil + lisensi + atribusi ke tabel `dish_images`, agar sekali ambil dipakai selamanya (cache).

**Lapis 3 — verifikasi + assignment.**
- Verifikasi VLM (vision check) hanya untuk foto yang benar-benar akan ditampilkan: "apakah gambar ini menampilkan X?" → kalau tidak cocok, coba kandidat berikutnya.
- Dedupe: perceptual hash (pHash) per gambar + cek silang antar-dish, supaya tidak ada dua foto hampir sama.
- Assignment: `dish_key` → pilih foto dengan **used_count terkecil** (bukan hash acak), sehingga 1 foto maksimal dipakai 1–2 resep, dan resep sejenis tetap dapat foto berbeda.
- Fallback terakhir: kategori generik (foto sayur/nasi/sorgum) sebelum pakai 1 foto global.

**Target angka:** pool ≥ 600 foto untuk kelas Tier A (Indonesia) + ≥ 3.000 generik;
aturan `max 2 resep per foto` → cukup untuk ±6.000 resep sebelum mengulang.

## 7. Perintah unduh

```bash
kaggle datasets download -d faldoae/padangfood -p ds/padang --unzip
kaggle datasets download -d nizamkurniawan/jajanan-tradisional-jawa-tengah -p ds/jajanan --unzip
kaggle datasets download -d rizkyyk/dataset-food-classification -p ds/idfood --unzip
kaggle datasets download -d nadyatirtasyafira/indonesian-traditional-food-image-dataset -p ds/idtrad --unzip

# HuggingFace (perlu `pip install huggingface_hub`)
hf download seanghay/food258k --repo-type dataset --local-dir ds/food258k
hf download bharat-raghunathan/indian-foods-dataset --repo-type dataset --local-dir ds/indian

# Commons + Openverse (tanpa key) — script pilot ada di %LOCALAPPDATA%\Temp\img_pilot.py
python3 img_pilot.py     # 22 query -> 638 kandidat unik, CSV hasil di img_candidates.csv
```

## 8. Status

- [x] Riset sumber + verifikasi lisensi (dokumen ini)
- [x] Pilot harvest Commons+Openverse (638 kandidat, 0 lisensi NC/ND)
- [x] Unduh + audit padangfood (993 foto) & jajanan (1.800 foto)
- [x] Audit visual pendekatan keyword-search: 16/46 foto salah → pendekatan ditinggalkan
- [x] Indeks link siap pakai: 82 menu Indonesia + 790 TheMealDB + 203 TheCocktailDB = 1.075 menu
- [x] Audit visual indeks: 24 sampel → 24 benar (setelah 2 diperbaiki)
- [ ] Tambah cakupan menu Indonesia dari 82 → 200+ (tambah judul artikel + alias daerah)
- [ ] Sambungkan resolver ke tabel `recipes` + kolom `image_credit`
- [ ] Unduh 793 foto yang dibutuhkan saja (bukan seluruh dataset), simpan di Supabase Storage
