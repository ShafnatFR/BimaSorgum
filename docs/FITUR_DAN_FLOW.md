# SorghumCare (BimaSorgum) — Fitur & Alur Aplikasi

> Dokumen ringkas untuk diubah menjadi slide presentasi (PPT).
> Aplikasi: AI Recipe Generator berbasis sorgum. Web app (SPA) React + Vite, backend AI eksternal, database Supabase.

---

## Ringkasan Produk

SorghumCare adalah asisten masak AI yang menghasilkan resep berbahan dasar **sorgum** (serealia lokal pengganti beras), dipersonalisasi berdasarkan target konsumen, jenis hidangan, bahan yang dimiliki, dan anggaran per porsi.

- Nama: **SorghumCare**
- Sifat: Web app single-page (React + Vite + Tailwind)
- Backend AI: `https://api.llmsorgum.online` (RAG)
- Database: **Supabase** (Postgres + Auth anonim + RLS)
- Publik: `https://bimasorgum.vercel.app`

### Teknologi Kunci
| Komponen | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Animasi | Motion (Framer Motion) |
| Routing | Hash routing custom (`#/...`) |
| Database | Supabase (PostgreSQL, Row Level Security) |
| Auth | Supabase anonymous sign-in (per browser) |
| AI / LLM | Backend RAG `api.llmsorgum.online` (`POST /api/chat`) |

---

## Navigasi Utama (4 Tab)

1. **Home** — Beranda dengan kurasi resep & konten edukasi.
2. **Explore** — Jelajah & filter katalog resep publik.
3. **Generate** — Buat resep baru (wizard 4 langkah / chat AI).
4. **Profile** — Akun pengguna & resep tersimpan (My Recipes).

---

## Fitur 1 — Home (Beranda)

**Tujuan:** Menampilkan konten kurasi, edukasi gizi, dan pintu masuk utama ke AI generator.

### Komponen di halaman
1. Banner **"Smart Generate"** — CTA utama menuju wizard 4 langkah.
2. **Student Favorites** — carousel resep favorit.
3. **Browse by Category** — grid kategori hidangan (klik → langsung buka wizard dengan kategori terpilih).
4. **Cooking Basics** — carousel video tutorial.
5. **Featured Community Recipes** — carousel resep komunitas.
6. **Trending & Hot Recipes** — carousel resep terpopuler.
7. **New Creations & Fresh Arrivals** — carousel resep terbaru.
8. **Sorghum Impact** — infografik perbandingan nutrisi sorgum vs beras (serat, protein, zat besi).
9. **Daily Nutrition Tip** — tips harian (bisa diganti tombol refresh).
10. **Load More Inspiration** — muat resep tambahan / pindah ke wizard.

### Flow
```
Buka Home → pilih kategori / klik banner Smart Generate
         → wizard terbuka dengan preferensi awal terisi
```

---

## Fitur 2 — Explore (Eksplorasi Resep)

**Tujuan:** Jelajah dan menemukan resep **publik** yang sudah di-upload komunitas.

### Fitur
- **Hero banner** edukasi.
- **Most Liked** — carousel resep dengan rating & like (Top Komunitas).
- **Pencarian** — cari berdasar judul, bahan, tag, kategori.
- **Advance Filter** (drawer kanan):
  1. Kategori hidangan
  2. Label nutrisi & kesehatan (Bebas Gluten, Low GI, Tinggi Serat, dll)
  3. Target konsumen (Balita, Anak Sekolah, Remaja, Lansia)
  4. Maksimal budget per porsi
  5. Waktu memasak maksimal
  6. Urutkan hasil (terpopuler, termurah, tercepat, serat tertinggi)
- **Grid resep** 2 kolom dengan bookmark (simpan) di tiap kartu.

### Aturan Visibilitas (Penting)
- Hanya resep dengan status **`is_published = true`** yang muncul di Explore.
- Resep hasil generate default **privat** sampai pemilik menekan tombol **"Unggah"**.

### Flow
```
Explore → filter/pencarian → klik kartu → halaman Detail Resep
```

---

## Fitur 3 — Smart Generate (Wizard 4 Langkah)

**Tujuan:** Menghasilkan resep terstruktur dari preferensi pengguna lewat panduan bertahap.

### Langkah 1 — Target Konsumen
- Pilih satu/beberapa grup usia: Balita, Anak SD, Siswa SMP, Siswa SMA, Remaja/Dewasa, Lansia.

### Langkah 2 — Kategori Hidangan
- Makanan Berat, Camilan Sehat, Minuman Nutrisi, Dessert Rendah GI.

### Langkah 3 — Bahan
- Pilih bahan utama sorgum + bahan pendukung; bisa menambah bahan kustom.

### Langkah 4 — Anggaran & Waktu
- **Target Modal** per porsi: slider + preset + **input manual "isi sendiri"**.
- **Waktu Persiapan**: dropdown preset + opsi **"isi sendiri (menit)"**.

### Output
```
Wizard selesai → LLM generate resep (JSON) → tampil sebagai kartu resep di chat
              → tersimpan sebagai sesi chat baru
```

### Flow lengkap
```
Generate tab → wizard step 1..4 → Generate Resep
            → resep tampil (bahan + langkah + nutrisi)
            → bisa disimpan / diunggah / dibuka cook mode
```

---

## Fitur 4 — Generate via Chat (AI Chef)

**Tujuan:** Tanya jawab bebas dengan AI untuk membuat resep atau sekadar bertanya seputar gizi/sorgum.

### Kemampuan
- **Resep terstruktur** — jika permintaan eksplisit "buatkan resep X", hasilnya kartu resep lengkap.
- **Percakapan bebas** — pertanyaan non-resep dijawab sebagai teks markdown (judul, list, **tabel**, bold, link).
- **Multi-turn** — AI ingat konteks percakapan dalam sesi yang sama.
- **Quick prompt** (Inspirasi) — chip prompt cepat.
- **Input suara** — dikte via Web Speech API.

### Flow
```
Chat → kirim pesan → deteksi intent
     → resep: generate kartu resep + persist ke DB
     → bebas: jawaban markdown + persist ke DB
```

---

## Fitur 5 — Detail Resep

**Tujuan:** Menampilkan informasi resep lengkap.

### Bagian
- **Header** — waktu masak, jumlah porsi, kategori.
- **Nutrition Facts (dinamis)** — kalori, protein, serat, karbohidrat, lemak, glycemic index — dihitung dari data tiap resep & diskalakan berdasar porsi.
- **Ingredients** — daftar bahan + harga estimasi; pengganda porsi (1x–4x).
- **Instructions** — langkah memasak bertahap dengan timer per langkah.
- **Aksi:** Simpan Resep, Buka Cook Mode, Share (copy link), read-aloud.

### Flow
```
Klik resep (Home/Explore/chat) → Detail Resep → simpan / cook mode / share
```

---

## Fitur 6 — Simpan Resep & My Recipes

**Tujuan:** Menyimpan resep favorit per pengguna (anonim per browser).

### Alur
1. Klik **"Simpan Resep"** di kartu resep → tersimpan ke `saved_recipes` (Supabase, RLS per user).
2. Tombol berubah jadi **"Tersimpan di My Recipes"**.
3. **My Recipes** tampil di sidebar (3 tile) + halaman Profile.
4. Profile punya tombol **"See All"** → galeri grid semua resep tersimpan.

### Flow
```
Kartu resep → Simpan Resep → muncul di My Recipes (sidebar & Profile)
```

---

## Fitur 7 — Unggah / Publish ke Explore

**Tujuan:** Membuat resep hasil generate bisa dilihat orang lain di Explore.

### Aturan Privat/Publik
- Resep baru **privat** (hanya pemilik yang melihat).
- Klik **"Unggah"** → `is_published = true` → muncul di Explore.
- Setelah diunggah tombol berubah **"Di Explore"** (nonaktif).

### Flow
```
Kartu resep → Unggah → resep masuk katalog Explore publik
```

---

## Fitur 8 — Riwayat Sesi Chat (Recent)

**Tujuan:** Menyimpan percakapan AI agar bisa dibuka kembali.

### Fitur
- Tiap percakapan baru = **satu sesi** tersimpan (judul = ringkasan dari topik/ nama resep, bukan potongan prompt mentah).
- **Recent** di sidebar menampilkan daftar sesi (urut aktivitas terbaru).
- Klik sesi → muat ulang seluruh isi chat (termasuk kartu resep lengkap) dari DB.
- Tombol **hapus** tiap sesi → menghapus sesi + resep terkait.
- **New Recipe Chat** — mulai percakapan bersih.

### Flow
```
Kirim pesan → sesi dibuat → muncul di Recent → klik untuk buka ulang / hapus
```

---

## Fitur 9 — Cook Mode (Panduan Masak Interaktif)

**Tujuan:** Memandu memasak langkah demi langkah dengan timer.

### Fitur
- Navigasi per langkah (maju/mundur).
- **Timer** otomatis per langkah (menit → detik).
- Tampilan bahan + langkah saat memasak.

### Flow
```
Detail resep / kartu resep → Buka Cook Mode → ikuti langkah + timer
```

---

## Fitur 10 — Profil

**Tujuan:** Info akun & pengaturan.

### Bagian
- Avatar, nama, status, badge member.
- Statistik (Saved Recipes, Sorghum Impact, Day Streak).
- **Recent Saved Recipes** + galeri "See All".
- Pengaturan: notifikasi, bahasa, logout.
- Edit profil (nama/bio).

---

## Fitur 11 — Pencarian (Search)

**Tujuan:** Cari resep global.

### Fitur
- Modal pencarian overlay.
- Input query → cari katalog resep.
- Hasil → buka detail resep.

---

## Fitur 12 — Autentikasi & Data (Lapisan Bawah)

**Tujuan:** Identitas pengguna tanpa perlu daftar akun.

### Mekanisme
- **Anonymous sign-in** Supabase — setiap browser dapat identitas stabil.
- **Row Level Security (RLS)** — tiap user hanya melihat/mengelola datanya sendiri (saved_recipes, chat_sessions, resep privat miliknya).
- Katalog resep publik bisa dibaca semua.

### Tabel Database Utama
| Tabel | Isi |
|---|---|
| `recipes` | Master resep (sistem + AI, privat/publik) |
| `recipe_ingredients` | Bahan per resep |
| `recipe_steps` | Langkah per resep |
| `recipe_targets` | Target konsumen per resep |
| `saved_recipes` | Resep tersimpan user |
| `chat_sessions` | Sesi percakapan user |
| `chat_messages` | Pesan dalam sesi |
| `profiles` | Profil user |

---

## Alur Utama End-to-End (Ringkasan Slide)

### Alur A: Generate Resep (Wizard)
```
Home → Smart Generate → Pilih konsumen → Pilih kategori → Pilih bahan
     → Atur budget & waktu → Generate → Kartu Resep → Simpan / Unggah / Cook Mode
```

### Alur B: Generate Resep (Chat AI)
```
Generate tab → ketik prompt → AI balas (resep/text) → sesi tersimpan di Recent
```

### Alur C: Jelajah & Simpan
```
Explore → filter → Detail Resep → Simpan ke My Recipes
```

### Alur D: Unggah ke Komunitas
```
Generate resep (privat) → Unggah → muncul di Explore (publik)
```

### Alur E: Riwayat
```
Kirim pesan → sesi tersimpan → Recent → klik buka ulang / hapus sesi
```

---

## Poin untuk Slide Penutup
- **SorghumCare** = personalisasi resep sorgum sehat berbasis AI.
- Kekuatan: wizard 4 langkah, chat AI, cook mode, komunitas (unggah resep), riwayat sesi, nutrisi dinamis.
- Backend AI RAG `api.llmsorgum.online`, database Supabase dengan privasi per user (RLS).
