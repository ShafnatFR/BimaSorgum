# Laporan Pengujian Ketahanan (Robustness) SorghumCare AI

**Tanggal:** 10 September 2026
**Metode:** 15 request langsung ke backend LLM `api.llmsorgum.online` (endpoint yang sama dengan frontend), menggunakan prompt & skema JSON persis seperti di `src/services/recipeGenerator.ts`.

---

## Ringkasan Eksekutif

AI **tidak menolak input yang tidak logis**, melainkan selalu berusaha "mengakomodasi" — kombinasi bahan aneh dibuat jadi resep sungguhan, dan harga bahan **dipalsukan** agar terkesan sesuai budget. Selain itu ditemukan **2 masalah teknis** yang membuat sebagian request gagal total atau jatuh ke resep cadangan (fallback) yang statis.

Temuan kunci:
1. **TQ1 (bahan tak logis):** 0 penolakan. AI merasionalisasi semua kombinasi aneh menjadi resep.
2. **TQ2 (harga tak realistis):** 0 penolakan. AI memanipulasi harga per bahan agar total ≤ budget, padahal nilai riil bahan jauh melebihi.
3. **TQ3 (kombinasi):** sama, plus lebih sering gagal teknis.
4. **Masalah teknis:** 4/15 respons "kosong", 5/15 JSON tidak valid → frontend fallback ke resep offline generik (Nasi Goreng Sorgum), bukan hasil AI.

---

## Detail Hasil

### TQ1 — 5 request bahan yang tidak logis dicampur

| ID | Kombinasi | Hasil | Catatan |
|---|---|---|---|
| TQ1-1 | madu + santan + cabai rawit | **Diterima** | "Bola-Bola Sorgum Santan Pedas Manis" |
| TQ1-2 | madu + cuka + kecap asin | Gagal teknis (respons kosong) | — |
| TQ1-3 | madu + terasi + durian | **Diterima** | "Pancake Mini Sorgum Durian Lembut" |
| TQ1-4 | madu + petis + kopi bubuk | **Diterima** | "Nasi Sorgum Bumbu Rempah Ikan Tongkol Madu" |
| TQ1-5 | madu + saus sambal + jengkol | JSON invalid → fallback | AI buat "Bola-bola Sorgum Pedas Manis Tabur Jengkol" |

**Kesimpulan TQ1:** AI menganggap semua kombinasi "boleh" dan menulis deskripsi yang merasionalisasi rasanya. Tidak ada mekanisme penolakan atau peringatan bahwa kombinasi tersebut tidak lazim / berisiko tidak enak.

---

### TQ2 — 5 request harga murah dengan komposisi banyak (riil ~Rp30k+, minta ≤Rp20k)

| ID | Bahan mahal diminta | Anggaran | Perilaku AI |
|---|---|---|---|
| TQ2-1 | daging sapi, ayam, udang, telur, keju | 20.000 | Diterima; harga bahan ditulis total 20.000 (dipaksa pas) |
| TQ2-2 | salmon, wagyu, alpukat, mete, parmesan | 20.000 | Salmon 60g ditulis Rp9.000 (riil ≈ Rp30k), total "Rp19.500" |
| TQ2-3 | ayam utuh, 5 telur, udang jumbo | 20.000 | Ayam 300g=Rp12k, udang 150g=Rp10k (riil jauh lebih tinggi) |
| TQ2-4 | sapi, tenggiri, tahu tempe, telur | 20.000 | Diterima, total Rp18.500 |
| TQ2-5 | sapi giling, salmon, telur, keju, alpukat | 20.000 | Gagal teknis (respons kosong) |

**Kesimpulan TQ2:** AI **tidak pernah menolak** dan **tidak jujur soal harga**. Ia menurunkan harga per bahan secara tidak realistis agar penjumlahan tampak ≤ budget. Akibatnya pengguna bisa mendapat resep yang secara ekonomi **mustahil** dibeli dengan anggaran yang diminta.

---

### TQ3 — 5 request kombinasi TQ1 + TQ2

| ID | Isi | Hasil |
|---|---|---|
| TQ3-1 | madu + cabai + daging + udang + keju, budget 20k | Gagal teknis (kosong) |
| TQ3-2 | madu + cuka + kecap + salmon + alpukat + mete, 20k | JSON invalid → fallback |
| TQ3-3 | madu + terasi + durian + ayam + parmesan, 20k | **Diterima**, tapi `estimatedCost=7000` padahal jumlah bahan=13800 (inkonsisten) |
| TQ3-4 | madu + petis + kopi + sapi + tenggiri + 5 telur, 20k | Gagal teknis (kosong) |
| TQ3-5 | madu + sambal + jengkol + wagyu + alpukat + mete, 20k | JSON invalid → fallback |

**Kesimpulan TQ3:** Selain masalah logika bahan & harga, tingkat kegagalan teknis naik — menandakan kasus "aneh + kompleks" juga membuat LLM lebih sering menghasilkan JSON rusak atau backend mengembalikan kosong.

---

## Masalah Teknis yang Ditemukan (bukan hanya soal logika)

### M1 — Respons kosong ("Maaf, tidak ada teks respons")
- Terjadi 4 dari 15 request (TQ1-2, TQ2-5, TQ3-1, TQ3-4).
- Backend LLM kadang mengembalikan string kosong. Frontend tidak menangani ini dengan baik — ia akan fallback ke generator offline.

### M2 — JSON tidak valid
- Terjadi 5 dari 15 request.
- Contoh cacat nyata: `"stepNumber": 3, "title", "instruction": ...` — field `title` hilang nilainya.
- Akibat: `extractJsonFromLlm()` gagal parse → aplikasi **diam-diam fallback ke resep offline** (Nasi Goreng Sorgum Ceria), bukan menampilkan hasil AI. Pengguna tidak diberi tahu bahwa hasilnya bukan dari AI.

### M3 — Inkonsistensi `estimatedCost` vs jumlah harga bahan
- TQ3-3: `estimatedCost=7000` tapi total `ingredients.estimatedPrice = 13800`.
- `estimatedCost` kadang "dibulatkan" turun agar tak melewati budget, sehingga menipu tampilan "Total Estimasi Belanja".

---

## Rekomendasi Perbaikan

### A. Validasi & penolakan logika (sisi aplikasi)
1. **Deteksi kombinasi bahan tidak wajar** — pertahankan daftar pasangan bahan yang bertentangan (manis+asin kuat, manis+pedas, bahan aroma ekstrem: terasi, petis, jengkol, kopi, durian). Jika terdeteksi, tampilkan peringatan ke user SEBELUM generate, dan/atau minta konfirmasi.
2. **Jangan biarkan AI "memalsukan" harga.** Setelah generate, **validasi ulang harga** di sisi frontend:
   - Bandingkan `estimatedCost` dengan `sum(ingredients.estimatedPrice)` — jika selisih > ±10%, jangan tampilkan, atau tandai.
   - Terapkan **acuan harga minimum per bahan** (price lookup lokal) untuk bahan mahal (salmon, wagyu, udang, daging, keju, alpukat, kacang mete). Jika bahan tersebut muncul dengan harga jauh di bawah wajar, auto-koreksi atau tolak.

### B. Perbaikan prompt (sisi generate)
3. Tambahkan instruksi eksplisit ke prompt LLM:
   - "Jika kombinasi bahan tidak lazim/tidak enak, TOLAK dengan menjelaskan alasannya alih-alih membuat resep."
   - "Harga per bahan harus realistis sesuai pasar Indonesia 2026. Jika total bahan melebihi budget, jangan paksa muat — naikkan budget atau kurangi bahan."
   - "estimatedCost harus SAMA dengan jumlah estimatedPrice seluruh bahan."
   - "Respon harus JSON valid — jangan ada field tanpa nilai."
4. Tambahkan **few-shot example** di prompt untuk kasus tolak (contoh penolakan yang benar).

### C. Ketahanan teknis (sisi kode)
5. **Deteksi respons kosong** di `bimaChat` → throw error jelas, jangan diam-diam fallback; beri tahu user "AI tidak merespons".
6. **Perbaiki parser JSON** `extractJsonFromLlm` agar lebih toleran (field kosong di-drop/diisi default), atau gunakan **output terstruktur** (schema-constrained decoding) jika backend mendukungnya.
7. **Retry** sekali untuk respons kosong / JSON invalid sebelum fallback.
8. Jika tetap fallback, **beri notifikasi** bahwa hasilnya adalah resep cadangan (bukan hasil AI), jangan menyamar sebagai hasil generate normal.

### D. (Opsional) Validasi budget sisi UI
9. Pada wizard, jika bahan pilihan mengandung item premium, tampilkan estimasi harga minimum dan peringatkan bila budget tidak cukup — sebelum request dikirim.

---

## Prioritas
| Prioritas | Perbaikan | Dampak |
|---|---|---|
| P1 | Validasi harga + anti-pemalsuan (A2, B3) | Cegah resep tak realistis secara biaya |
| P1 | Fix respons kosong + JSON invalid + notifikasi fallback (C5–C8) | Hilangkan "resep hantu" yang ternyata bukan hasil AI |
| P2 | Deteksi kombinasi tak wajar + prompt penolakan (A1, B1) | Cegah resep kombinasi aneh |
| P2 | Parser JSON lebih toleran (C6) | Kurangi fallback yang tak perlu |
| P3 | Few-shot & acuan harga bahan (A2, B4) | Akurasi harga jangka panjang |
