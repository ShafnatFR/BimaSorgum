# Memory — Bima-Website (SorghumCare)

Ringkasan dari `docs/` lama (FITUR_DAN_FLOW, LAPORAN_PENGUJIAN_AI, LAPORAN_TIMEOUT_WIZARD)
yang dihapus 2026-10-25. Isi lengkapnya masih ada di git history:
`git show 6c0b99d:docs/FITUR_DAN_FLOW.md`.

## Produk

Asisten masak AI untuk resep berbahan **sorgum**, dipersonalisasi menurut target
konsumen, jenis hidangan, bahan yang dimiliki, dan anggaran per porsi.

- Frontend: React 19, TypeScript, Vite, Tailwind v4, Motion; routing hash (`#/...`).
- AI: backend RAG `api.llmsorgum.online` (`POST /api/chat`, SSE) lewat proxy `/bima-api`.
- Data: Supabase (Postgres + anonymous sign-in per browser + RLS).
- Deploy: Dokploy (Dockerfile). Vercel (`vercel.json`, `api/bima-chat.ts`) **dihapus** 2026-10-25.

## Navigasi & fitur

| Tab / fitur | Isi |
|---|---|
| Home | Banner Smart Generate, favorit, kategori (→ wizard), video dasar masak, resep komunitas/trending/baru, infografik sorgum vs beras, tips gizi harian |
| Explore | Katalog resep **publik** (`is_published = true`); cari + filter (kategori, label gizi, target usia, budget, waktu, urutan) |
| Generate — wizard 4 langkah | 1) target konsumen 2) kategori hidangan 3) bahan (+ kustom) 4) budget & waktu (preset atau isi sendiri) → resep JSON → kartu resep |
| Generate — chat AI | "buatkan resep X" → kartu resep; pertanyaan lain → jawaban markdown; multi-turn; quick prompt; input suara (Web Speech API) |
| Detail resep | Nutrisi dinamis per porsi, bahan + harga, pengganda porsi 1–4x, langkah + timer, simpan / cook mode / share / read-aloud |
| Simpan & My Recipes | `saved_recipes` per user (RLS); sidebar + Profile + galeri "See All" |
| Unggah | Resep baru **privat**; tombol "Unggah" → `is_published = true` → muncul di Explore |
| Riwayat chat (Recent) | Satu percakapan = satu sesi (judul = nama resep/topik); buka ulang / hapus sesi + resepnya |
| Cook mode | Langkah per langkah + timer otomatis |
| Profil | Avatar, statistik, resep tersimpan, pengaturan, edit profil |
| Search | Modal pencarian katalog |

## Tabel database

`recipes`, `recipe_ingredients`, `recipe_steps`, `recipe_targets`, `saved_recipes`,
`chat_sessions`, `chat_messages`, `profiles` (+ komentar/likes, admin configs, reports).
Migrasi di `supabase/migrations/`.

## Temuan pengujian (masih relevan untuk dicek ulang)

**Uji ketahanan AI (2026-09-10, 15 request):**
- AI tidak pernah menolak kombinasi bahan aneh (madu + terasi + durian dsb.) — selalu dirasionalisasi.
- AI **memalsukan harga** agar total ≤ budget (mis. salmon 60 g ditulis Rp9.000); `estimatedCost` kadang ≠ jumlah `estimatedPrice` bahan.
- Teknis: 4/15 respons kosong, 5/15 JSON tidak valid → dulu diam-diam jatuh ke resep cadangan offline.
- Rekomendasi: validasi ulang harga di frontend (selisih > ±10% ditandai; harga minimum bahan mahal), prompt menolak kombinasi tak wajar & wajib harga realistis, retry sekali untuk respons kosong/JSON rusak, beri tahu user bila hasil adalah resep cadangan.

**Uji timeout wizard (2026-09-24, 12 konfigurasi × 30 run, produksi):**
- Waktu sampai token pertama: median 96 s (68–128 s); guard lama 60 s membuat semua gagal → guard dinaikkan ke 150 s.
- Minuman nutrisi 2/2 menghasilkan prosa, bukan JSON. Konfigurasi bahan terbanyak (budget 100k) sempat timeout tanpa token.

**Kategori wizard (2026-10-25):**
- Minuman Nutrisi dengan Bahan Pokok ayam/telur/tempe pernah keluar sebagai "Golden Velvet Soup". Penyebab:
  prompt hanya mengirim id mentah `minuman_nutrisi`. Kini `CATEGORY_BRIEF` (recipeGenerator.ts) mengirim
  nama + definisi kategori, aturan "bentuk hidangan wajib sesuai kategori; Bahan Pokok yang tak cocok boleh
  tidak dipakai", dan `validateRecipe(..., dishCategory)` (recipeGuard.ts) menjadikan judul minuman berisi
  sup/bubur/nasi/kue dsb. sebagai error → satu putaran perbaikan.
- Diperluas ke keempat kategori (`CATEGORY_MISMATCH` di recipeGuard.ts): Makanan Berat ≠ minuman/kue/camilan,
  Camilan ≠ hidangan utama/minuman, Dessert ≠ masakan gurih (sup/nasi/ayam/daging/ikan). Cek berdasar judul.
- Target Konsumen (langkah 1) dulu TIDAK dikirim ke AI sama sekali. Kini prompt memuat `Target Konsumen`
  (`CONSUMER_BRIEF`: anak SD tidak pedas, lansia rendah gula/GI & lembut, dst.) + aturan "cocok untuk SEMUA target".
- Bahan Pokok dikirim sebagai nama ("Protein Ayam/Telur"), bukan id (`protein_ayam_telur`).
- Default wizard `targetConsumers` dulu `anak_sekolah` (id lama, kartunya tak tampil terpilih tapi ikut terkirim) → `anak_sd`.
- Target Modal (langkah 4) DIHAPUS atas permintaan user: langkah 4 kini hanya "Periksa pilihan Anda" (Tipe Hidangan +
  Waktu Persiapan). `budgetPerPortion` wizard = 0 = tidak dibatasi; prompt menulis "TIDAK DIBATASI", validateRecipe
  melewati cek budget, dan putaran perbaikan tanpa aritmetika budget. Jalur chat ("budget 10 ribu" di teks) tetap memakai budget.
- Backend (Bima-Backend-RAG `0bfe914`) dulu memaksa format Markdown untuk request stream → resep sering prosa,
  website retry s/d 4x. Kini prompt yang menyebut JSON mendapat instruksi JSON.

## Catatan teknis

- `src/services/bimaClient.ts` juga membaca `VITE_BIMA_API_KEY` / `VITE_BIMA_MODEL`. Jangan isi
  `VITE_BIMA_API_KEY` — prefix `VITE_` ikut ter-bundle ke browser; pakai `BIMA_API_KEY` (proxy).
- File raksasa yang layak dipecah: `src/App.tsx`, `ExploreRecipesPage.tsx`, `supabase.ts`, `recipeGenerator.ts`.
- Belum ada unit test.
