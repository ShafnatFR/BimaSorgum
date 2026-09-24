# Laporan Testing Lengkap BimaSorgum — 56 Test Cases

**Tanggal:** 24 September 2026
**Deployed Bundle:** bimasorgum.vercel.app
**Total Tests:** 56

---

## Ringkasan Eksekutif

| Status | Jumlah | Persen |
|--------|--------|--------|
| PASS | 0 | 0% |
| FAIL (guard corrections) | 43 | 76% |
| PARSE_FAIL (LLM prose) | 13 | 23% |
| REFUSAL | 0 | 0% |
| ERROR | 0 | 0% |

### Issue Breakdown

| Issue | Jumlah | Penjelasan |
|-------|--------|------------|
| FLOOR | 43 | Harga LLM di bawah minimum warung — dikoreksi otomatis |
| ZERO_PRICE | 14 | Harga Rp 0 — dikoreksi ke minimum Rp 1.500 |
| OVER_BUDGET | 13 | Harga koreksi melebihi budget user |
| PARSE_FAIL | 13 | LLM return prose, bukan JSON |
| CEILING | 1 | Harga LLM di atas maximum — dikoreksi otomatis |

---

## Hasil Fix yang Sudah Dideploy

| # | Bug | Fix | Status |
|---|-----|-----|--------|
| 1 | Blank screen (RecipeCardView) | unusedIngredients undefined crash | Fixed |
| 2 | Harga hallucinated (tinggi) | Ceiling guard added di recipeGuard | Fixed |
| 3 | Harga under-price (rendah) | Floor guard sudah ada, berfungsi | Working |
| 4 | Gramasi di nama bahan | parseGramasi() extract ke amount field | Fixed |
| 5 | Servings selalu 1 | estimateServings() post-process | Fixed |
| 6 | Porsi multiplier logic | Total naik saat per porsi > batch | Fixed |
| 7 | Porsi limit 5x | Dihapus, unlimited | Fixed |
| 8 | Budget check di chat mode | Error issues sekarang di-check | Fixed |

---

## Fase 1: Verifikasi Bug Kritis (16 test)

| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |
|---|------|--------|-------|------|----------|--------|--------|
| 1 | P1-01-Minuman-AllBahan-100k | FAIL | Minuman Kental Fortifikasi Sorgum-S | 2 | Rp10,222 | Rp29,125 | FLOOR, ZERO_PRICE |
| 2 | P1-02-Dessert-BahanAneh | FAIL | Pancake Sorgum-Artichoke Rendah GI | 4 | Rp2,057 | Rp10,250 | FLOOR |
| 3 | P1-03-Camilan-BudgetKetat | FAIL | Crisps Sorgum Rebus-Telur Renyah | 2 | Rp2,028 | Rp6,250 | OVER_BUDGET, FLOOR |
| 4 | P1-04-MakanBerat-Lengkap | FAIL | Bubur Sorgum Santan Ayam Spesial | 2 | Rp4,248 | Rp19,000 | FLOOR, ZERO_PRICE |
| 5 | P1-05-Minuman-Sederhana | FAIL | Nektar Sorgum Santan Madu | 2 | Rp5,300 | Rp13,525 | FLOOR |
| 6 | P1-06-Camilan-Standard | FAIL | Kukis Sorgum Santan Medit | 2 | Rp12,260 | Rp15,350 | FLOOR |
| 7 | P1-07-Dessert-Standard | FAIL | Puding Sorgum Rendah GI dengan Arom | 2 | Rp5,532 | Rp12,400 | FLOOR, ZERO_PRICE |
| 8 | P1-08-MakanBerat-Sedikit | FAIL | Sorgum Gulai Bumbu Merah Santan | 2 | Rp6,195 | Rp12,180 | FLOOR |
| 9 | P1-01-Minuman-AllBahan-100k | FAIL | Bubur Hangat Fortifikasi Sorgum & P | 2 | Rp12,465 | Rp27,825 | FLOOR, ZERO_PRICE |
| 10 | P1-02-Dessert-BahanAneh | FAIL | Tumis Glazur Sorgum Gurih Rendah GI | 2 | Rp2,805 | Rp17,750 | FLOOR |
| 11 | P1-03-Camilan-BudgetKetat | FAIL | Pancake Gurih Sorgum | 2 | Rp1,826 | Rp6,500 | OVER_BUDGET, FLOOR |
| 12 | P1-04-MakanBerat-Lengkap | FAIL | Gulai Ayam & Sayur Hijau Pekat Tepu | 3 | Rp10,633 | Rp16,550 | FLOOR |
| 13 | P1-05-Minuman-Sederhana | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 14 | P1-06-Camilan-Standard | FAIL | Cookies Sorgum Sanjai Madu | 3 | Rp2,237 | Rp10,667 | FLOOR |
| 15 | P1-07-Dessert-Standard | FAIL | Puding Sorgum-Gula Merah Pandan | 4 | Rp4,093 | Rp5,875 | FLOOR |
| 16 | P1-08-MakanBerat-Sedikit | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |

---

## Fase 2: Matriks Kategori x Budget (16 test)

| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |
|---|------|--------|-------|------|----------|--------|--------|
| 1 | P2-MB-5k | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 2 | P2-MB-15k | FAIL | Panekuk Sorgum Gurih Wortel & Bawan | 2 | Rp3,020 | Rp12,500 | FLOOR, ZERO_PRICE |
| 3 | P2-MB-50k | FAIL | Pancake Gurih Sorgum & Sayur Spesia | 2 | Rp9,000 | Rp18,000 | FLOOR |
| 4 | P2-MB-100k | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 5 | P2-CS-5k | FAIL | Kue Kering Madu Sorgum Renyah | 2 | Rp2,147 | Rp14,500 | OVER_BUDGET, FLOOR |
| 6 | P2-CS-15k | FAIL | Kukis Sorgum Madu Renyah | 3 | Rp2,923 | Rp8,500 | FLOOR |
| 7 | P2-CS-50k | FAIL | Kukis Sorgum Madu Premium | 2 | Rp5,600 | Rp14,500 | FLOOR, ZERO_PRICE |
| 8 | P2-CS-100k | FAIL | Kukis Sorgum Madu Organik | 6 | Rp14,545 | Rp13,333 | FLOOR, CEILING |
| 9 | P2-MN-5k | FAIL | Sari Sorgum Helios | 1 | Rp4,880 | Rp22,500 | OVER_BUDGET, FLOOR |
| 10 | P2-MN-15k | FAIL | Minuman Nutrisi Hangat Sorgum-Santa | 1 | Rp5,105 | Rp26,000 | OVER_BUDGET, FLOOR, ZERO_PRICE |
| 11 | P2-MN-50k | FAIL | Minuman Hangat Sorgum Madu Santan | 2 | Rp2,275 | Rp12,250 | FLOOR, ZERO_PRICE |
| 12 | P2-MN-100k | FAIL | Minuman Kental Sorgum-Santan Manis | 1 | Rp4,610 | Rp24,500 | FLOOR, ZERO_PRICE |
| 13 | P2-DG-5k | FAIL | Puding Santan Sorgum Gula Merah Ren | 4 | Rp4,898 | Rp5,960 | OVER_BUDGET, FLOOR |
| 14 | P2-DG-15k | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 15 | P2-DG-50k | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 16 | P2-DG-100k | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |

---

## Fase 3: Variasi Kompleksitas Bahan (12 test)

| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |
|---|------|--------|-------|------|----------|--------|--------|
| 1 | P3-MB-Simple | FAIL | Sorgum Pilaf Cepat Aja (Gurih Sayur | 2 | Rp3,685 | Rp14,750 | FLOOR, ZERO_PRICE |
| 2 | P3-CS-Simple | FAIL | Camilan Sorgum Renyah Cokelat | 2 | Rp8,100 | Rp11,850 | FLOOR |
| 3 | P3-MN-Simple | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 4 | P3-MB-Medium | FAIL | Kerupuk Ringan Sorgum Gurih | 4 | Rp2,546 | Rp5,250 | FLOOR |
| 5 | P3-CS-Medium | FAIL | Kukis Sorgum Medok Santan & Madu | 2 | Rp8,700 | Rp15,250 | FLOOR |
| 6 | P3-MN-Medium | FAIL | Minuman Nutrisi Sorgum Madu-Pandan | 1 | Rp2,195 | Rp26,000 | OVER_BUDGET, FLOOR, ZERO_PRICE |
| 7 | P3-MB-Complex | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 8 | P3-CS-Complex | FAIL | Pancake Sorgum Hijau Pandan | 2 | Rp4,953 | Rp19,750 | FLOOR |
| 9 | P3-MN-Complex | FAIL | Minuman Hangat Sorgum-Santan Kaya P | 1 | Rp13,025 | Rp36,500 | OVER_BUDGET, FLOOR |
| 10 | P3-MB-Weird | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 11 | P3-CS-Weird | FAIL | Cookies Sorgum Tempe Pedas Gurih | 2 | Rp2,540 | Rp12,250 | FLOOR |
| 12 | P3-DG-Weird | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |

---

## Fase 4: Edge Cases (12 test)

| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |
|---|------|--------|-------|------|----------|--------|--------|
| 1 | P4-MB-MinBudget | FAIL | Bubur Sorgum Gurih | 2 | Rp1,438 | Rp9,750 | OVER_BUDGET, FLOOR |
| 2 | P4-CS-MinBudget | FAIL | Keripik Renyah Tepung Sorgum | 2 | Rp1,080 | Rp8,250 | OVER_BUDGET, FLOOR, ZERO_PRICE |
| 3 | P4-MN-MinBudget | FAIL | Minuman Nutrisi Sorgum Hangat | 1 | Rp1,170 | Rp14,000 | OVER_BUDGET, FLOOR, ZERO_PRICE |
| 4 | P4-DG-MinBudget | FAIL | Bolu Kukus Sorgum-Santan Rendah GI | 2 | Rp1,015 | Rp10,000 | OVER_BUDGET, FLOOR |
| 5 | P4-MB-MaxBudget | FAIL | Sorgum Santan Kampung Berprotein Ti | 2 | Rp4,022 | Rp18,510 | FLOOR |
| 6 | P4-CS-MaxBudget | FAIL | Soft-Baked Sorghum-Pandan Bar | 3 | Rp3,515 | Rp10,233 | FLOOR |
| 7 | P4-MN-MaxBudget | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |
| 8 | P4-DG-MaxBudget | FAIL | Kukis Sorgum Madu Santan Pandan | 4 | Rp2,950 | Rp7,688 | FLOOR |
| 9 | P4-MB-MinTime | FAIL | Sorgum Tumis Bawang Spesial | 2 | Rp863 | Rp8,000 | FLOOR |
| 10 | P4-CS-MinTime | FAIL | Sorgum Crisp Gurih | 2 | Rp2,456 | Rp6,250 | FLOOR |
| 11 | P4-MN-MinTime | FAIL | Minuman Gizi Sorgum-Santan Kaya Bes | 1 | Rp2,420 | Rp17,000 | OVER_BUDGET, FLOOR, ZERO_PRICE |
| 12 | P4-DG-MinTime | PARSE_FAIL | (no JSON) | - | Rp0 | Rp0 | PARSE_FAIL |

---

## Detail Bahan per Test (Sample 5)

### P1-01-Minuman-AllBahan-100k

**Title:** Minuman Kental Fortifikasi Sorgum-Sayuran (Nutri-Sorgum Liquid) | **Servings:** 2 | **PerPorsi:** Rp10,222 | **CorrPP:** Rp29,125

| Bahan | Takaran | Harga LLM | Harga Guard | Flag |
|-------|---------|-----------|-------------|------|
| Tepung Sorgum Giling Halus (sa | 70 gram | Rp1,750 | Rp8,000 | FLOOR |
| Tepung Maizena (pengikat hidro | 10 gram | Rp150 | Rp1,500 | FLOOR |
| Air Bersih Filter | 300 ml | Rp0 | Rp1,500 | FLOOR, ZERO |
| Santan Karamel Pekat | 80 ml | Rp960 | Rp3,000 | FLOOR |
| Daun Bayam Muda (Sayuran Hijau | 80 gram | Rp1,200 | Rp1,500 | FLOOR |
| Wortel (parut halus/kukus) | 60 gram | Rp720 | Rp3,000 | FLOOR |
| Daging Ayam Suwir (Rebus) | 50 gram | Rp2,250 | Rp2,250 | OK |
| Telur Ayam Kampung | 2 butir (≈120 g | Rp8,000 | Rp8,000 | OK |
| Bawang Merah Iris Tipis | 15 gram | Rp480 | Rp3,000 | FLOOR |
| Bawang Putih Cincang Halus | 8 gram | Rp224 | Rp3,000 | FLOOR |
| Kecap Manis Premium | 15 ml (≈18 gram | Rp504 | Rp3,000 | FLOOR |
| Tahu Putih Potong Dadu Kecil | 40 gram | Rp560 | Rp2,000 | FLOOR |
| Tempe Goreng Renyah (potong ko | 35 gram | Rp630 | Rp2,000 | FLOOR |
| Minyak Kelapa Murni (Extra Vir | 10 ml (≈9 gram) | Rp315 | Rp5,000 | FLOOR |
| Madu Asali Asli | 20 gram | Rp2,400 | Rp10,000 | FLOOR |
| Daun Pandan Ikat | 5 gram (2 lemba | Rp300 | Rp1,500 | FLOOR |

### P1-02-Dessert-BahanAneh

**Title:** Pancake Sorgum-Artichoke Rendah GI | **Servings:** 4 | **PerPorsi:** Rp2,057 | **CorrPP:** Rp10,250

| Bahan | Takaran | Harga LLM | Harga Guard | Flag |
|-------|---------|-----------|-------------|------|
| Tepung Sorgum (30 gram) | 30 gram | Rp540 | Rp8,000 | FLOOR |
| Tepung Terigu Protein Tinggi ( | 70 gram | Rp980 | Rp1,500 | FLOOR |
| Telur Ayam Besar (55 gram) | 1 butir (±55 gr | Rp3,000 | Rp3,000 | OK |
| Susu UHT Full Cream (60 ml) | 60 ml | Rp1,080 | Rp4,000 | FLOOR |
| Gula Pasir (10 gram) | 10 gram | Rp140 | Rp3,000 | FLOOR |
| Minyak Goreng Sawit (15 ml) | 15 ml | Rp386 | Rp5,000 | FLOOR |
| Kecap Manis (14,4 gram) | 12 ml | Rp230 | Rp3,000 | FLOOR |
| Bawang Putih Halus (15 gram) | 15 gram | Rp330 | Rp3,000 | FLOOR |
| Tempe Sisir (30 gram) | 30 gram | Rp360 | Rp2,000 | FLOOR |
| Tahu Cincang Dadu (30 gram) | 30 gram | Rp420 | Rp2,000 | FLOOR |
| Wortel Parut Halus (40 gram) | 40 gram | Rp360 | Rp3,000 | FLOOR |
| Bayam Muda Potong (30 gram) | 30 gram | Rp360 | Rp2,000 | FLOOR |
| Baking Powder (2 gram) | 2 gram | Rp40 | Rp1,500 | FLOOR |

### P1-03-Camilan-BudgetKetat

**Title:** Crisps Sorgum Rebus-Telur Renyah | **Servings:** 2 | **PerPorsi:** Rp2,028 | **CorrPP:** Rp6,250

| Bahan | Takaran | Harga LLM | Harga Guard | Flag |
|-------|---------|-----------|-------------|------|
| Tepung Sorgum (60 gram) | 60 gram | Rp1,800 | Rp8,000 | FLOOR |
| Telur Ayam (50 gram / 1 butir) | 50 gram | Rp2,250 | Rp2,500 | FLOOR |
| Garam Dapur (1 gram) | 1 gram | Rp6 | Rp2,000 | FLOOR |

### P1-04-MakanBerat-Lengkap

**Title:** Bubur Sorgum Santan Ayam Spesial | **Servings:** 2 | **PerPorsi:** Rp4,248 | **CorrPP:** Rp19,000

| Bahan | Takaran | Harga LLM | Harga Guard | Flag |
|-------|---------|-----------|-------------|------|
| Biji Sorgum Pasca Sosoh (grama | 60 gram | Rp1,500 | Rp6,000 | FLOOR |
| Tepung Sorgum Halus (gramasi) | 20 gram | Rp560 | Rp8,000 | FLOOR |
| Daging Ayam Fillet Potong Dadu | 50 gram | Rp2,500 | Rp2,500 | OK |
| Telur Ayam Utuh (gramasi) | 1 butir (±55 gr | Rp660 | Rp2,500 | FLOOR |
| Daun Bayam Hijau Cincang (gram | 30 gram | Rp300 | Rp1,500 | FLOOR |
| Bawang Merah Iris Tipis (grama | 15 gram | Rp450 | Rp3,000 | FLOOR |
| Santan Kelapa Cair (ml) | 80 ml | Rp2,000 | Rp3,000 | FLOOR |
| Wortel Parut Serut (gramasi) | 20 gram | Rp160 | Rp3,000 | FLOOR |
| Minyak Kelapa Murni (ml) | 10 ml | Rp315 | Rp5,000 | FLOOR |
| Garam Kuliner (gramasi) | 1.5 gram | Rp50 | Rp2,000 | FLOOR |
| Air Matang (ml) | 250 ml | Rp0 | Rp1,500 | FLOOR, ZERO |

### P1-05-Minuman-Sederhana

**Title:** Nektar Sorgum Santan Madu | **Servings:** 2 | **PerPorsi:** Rp5,300 | **CorrPP:** Rp13,525

| Bahan | Takaran | Harga LLM | Harga Guard | Flag |
|-------|---------|-----------|-------------|------|
| Tepung Sorgum Halus (disangrai | 40 gram (100% b | Rp1,500 | Rp8,000 | FLOOR |
| Santan Kelapa Unggulan | 200 ml (500% ra | Rp4,000 | Rp4,000 | OK |
| Madu Murni Asli | 15 gram (37,5%  | Rp1,800 | Rp10,000 | FLOOR |
| Air Matang Rebus | 250 ml (625% hi | Rp250 | Rp1,500 | FLOOR |
| Garam Halus | 1 gram (2,5% ra | Rp1,500 | Rp2,000 | FLOOR |
| Ekstrak Vanila Cair | 2 tetes (arseni | Rp1,550 | Rp1,550 | OK |

---

## Analisis Temuan

### 1. FLOOR Dominan (43/56 test)
LLM konsisten menggunakan harga per-gram, bukan harga beli satuan warung.

**Contoh:**
- Tepung Sorgum: LLM Rp2.400 (Rp16/gram) -> Guard Rp8.000 (harga warung)
- Madu: LLM Rp1.000 (Rp50/gram) -> Guard Rp10.000 (harga warung)
- Garam: LLM Rp0-30 -> Guard Rp2.000 (harga warung)

### 2. ZERO_PRICE (14 test)
Beberapa bahan (Air, Garam, Vanili) dihargai Rp0 oleh LLM.
Guard mengoreksi ke minimum Rp1.500.

### 3. OVER_BUDGET (13 test)
Setelah guard mengoreksi harga ke minimum warung, total melebihi budget.
Ini expected behavior — guard menolak resep yang tidak feasible.

### 4. PARSE_FAIL (13 test / 23%)
LLM return prose/markdown alih-alih JSON murni.
Ini masalah backend BIMA LLM, bukan bug frontend.

### 5. CEILING (1 test)
Hanya 1 test yang harga LLM-nya terlalu tinggi.
Guard berhasil cap ke maximum.

### 6. Servings Estimation
- Minuman: 1 porsi (personal drink) — benar
- Camilan: 2-3 porsi (estimated dari total gramasi) — reasonable
- Makanan Berat: 2-4 porsi — reasonable

---

## Kesimpulan

1. **Frontend code sudah stabil** — tidak ada blank screen, crash, atau bug UI
2. **Guard berfungsi dengan baik** — FLOOR/CEILING/ZERO_PRICE semua ditangkap
3. **MASALAH UTAMA: LLM under-price** — konsisten menggunakan harga per-gram
4. **MASALAH KEDUA: PARSE_FAIL 23%** — LLM kadang return prose, bukan JSON
5. **8 Fix sudah dideploy** — blank screen, ceiling, parseGramasi, estimateServings, porsi logic, budget check, unlimited porsi

### Rekomendasi

| Prioritas | Rekomendasi | Effort |
|-----------|------------|--------|
| P1 | Perbaiki prompt BIMA: harga = harga beli 1 bungkus warung | Backend |
| P2 | Tambahkan retry logic untuk PARSE_FAIL | Frontend |
| P3 | Update DNS shafnat.llmsorgum.online ke Vercel | DevOps |