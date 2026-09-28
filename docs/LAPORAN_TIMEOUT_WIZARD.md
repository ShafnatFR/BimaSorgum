# Laporan: uji timeout wizard BimaSorgum

Tanggal: 2026-09-24 23:49 | target: https://shafnat.llmsorgum.online/bima-api/chat (produksi, X-Stream: true, X-Use-RAG: false, X-Max-Tokens: 8192)

## Matrix (12 konfigurasi wizard)

| Konfigurasi | Kategori | Bahan | Budget | Waktu | TTFT sweep1 (PAR=3) | TTFT sweep2 (PAR=3) | Retest (sekuensial) | Hasil |
|---|---|---|---|---|---|---|---|---|
| MB-biji-25k-15m | makanan_berat | biji_sorgum+Bawang Merah+Santan | 25000 | Maks 15 Menit | 96s / 130s | 127s / 162s | - / - | resep OK |
| MB-biji-25k-30m | makanan_berat | biji_sorgum+Bawang Merah+Santan | 25000 | Maks 30 Menit | 121s / 162s | 126s / 159s | - / - | resep OK |
| MB-ayam-50k-flex | makanan_berat | protein_ayam_telur | 50000 | Fleksibel | 126s / 175s | 123s / 153s | - / - | resep OK |
| CS-biji-25k-30m | camilan_sehat | biji_sorgum+Bawang Merah+Santan | 25000 | Maks 30 Menit | 100s / 139s | 114s / 175s | - / - | resep OK |
| CS-biji+sayur-15k | camilan_sehat | biji_sorgum+sayuran_hijau | 15000 | Maks 30 Menit | 89s / 118s | 120s / 149s | - / - | resep OK |
| CS-tepung-25k-15m | camilan_sehat | tepung_sorgum | 25000 | Maks 15 Menit | 85s / 154s | 113s / 146s | - / - | resep OK |
| MN-biji-25k-30m | minuman_nutrisi | biji_sorgum+Bawang Merah+Santan | 25000 | Maks 30 Menit | 68s / 68s | 77s / 121s | 80s / 105s | respons bukan JSON |
| MN-tepung-50k-flex | minuman_nutrisi | tepung_sorgum | 50000 | Fleksibel | 93s / 135s | 106s / 140s | 95s / 143s | respons bukan JSON |
| DG-tepung-25k-45m | dessert_rendah_gi | tepung_sorgum | 25000 | Maks 45 Menit | 114s / 151s | 94s / 136s | - / - | resep OK |
| DG-biji-15k-30m | dessert_rendah_gi | biji_sorgum | 15000 | Maks 30 Menit | 107s / 173s | 88s / 124s | - / - | resep OK |
| CS-ayam-15k-30m | camilan_sehat | protein_ayam_telur | 15000 | Maks 30 Menit | 128s / 198s | 92s / 136s | - / - | resep OK |
| MB-all-100k-flex | makanan_berat | biji_sorgum+sayuran_hijau+protein_ayam_telur+Bawang Merah+Bawang Putih+Santan | 100000 | Fleksibel | TIMEOUT / 260s | 95s / 152s | 86s / 115s | TIMEOUT (tidak ada token) |

## Ringkasan (30 run)

- TTFT: min 68s, p25 88s, median 96s, p75 114s, max 128s (n=29)
- TTFT > 60s (guard lama): 29/29 run ber-TTFT + 1 stall = semua gagal di guard lama
- Tidak ada token dalam 150s (guard sekarang): ['MB-all-100k-flex']
- Total > 175s (cap upstream proxy Vercel): [('CS-ayam-15k-30m', 198), ('MB-all-100k-flex', 260)]
- Respons bukan JSON: [('MN-biji-25k-30m', 'no_json_prose_len_62'), ('MN-tepung-50k-flex', 'no_json_prose_len_5482')]
- Diblokir reviewer (tidak_valid): [('MB-ayam-50k-flex', 20)]
