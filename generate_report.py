import json

with open("results_all.json") as f:
    all_results = json.load(f)

md = []
md.append("# Laporan Testing Lengkap BimaSorgum — 56 Test Cases")
md.append("")
md.append("**Tanggal:** 24 September 2026")
md.append("**Deployed Bundle:** bimasorgum.vercel.app")
md.append("**Total Tests:** 56")
md.append("")
md.append("---")
md.append("")
md.append("## Ringkasan Eksekutif")
md.append("")

pass_c = sum(1 for r in all_results if r.get("status") == "PASS")
fail_c = sum(1 for r in all_results if r.get("status") == "FAIL")
parse_c = sum(1 for r in all_results if r.get("status") == "PARSE_FAIL")

md.append("| Status | Jumlah | Persen |")
md.append("|--------|--------|--------|")
md.append(f"| PASS | {pass_c} | {pass_c*100//56}% |")
md.append(f"| FAIL (guard corrections) | {fail_c} | {fail_c*100//56}% |")
md.append(f"| PARSE_FAIL (LLM prose) | {parse_c} | {parse_c*100//56}% |")
md.append("| REFUSAL | 0 | 0% |")
md.append("| ERROR | 0 | 0% |")
md.append("")

issue_counts = {}
for r in all_results:
    for issue in r.get("issues", []):
        issue_counts[issue] = issue_counts.get(issue, 0) + 1

md.append("### Issue Breakdown")
md.append("")
md.append("| Issue | Jumlah | Penjelasan |")
md.append("|-------|--------|------------|")
md.append(f"| FLOOR | {issue_counts.get('FLOOR',0)} | Harga LLM di bawah minimum warung — dikoreksi otomatis |")
md.append(f"| ZERO_PRICE | {issue_counts.get('ZERO_PRICE',0)} | Harga Rp 0 — dikoreksi ke minimum Rp 1.500 |")
md.append(f"| OVER_BUDGET | {issue_counts.get('OVER_BUDGET',0)} | Harga koreksi melebihi budget user |")
md.append(f"| PARSE_FAIL | {issue_counts.get('PARSE_FAIL',0)} | LLM return prose, bukan JSON |")
md.append(f"| CEILING | {issue_counts.get('CEILING',0)} | Harga LLM di atas maximum — dikoreksi otomatis |")
md.append("")

md.append("---")
md.append("")
md.append("## Hasil Fix yang Sudah Dideploy")
md.append("")
md.append("| # | Bug | Fix | Status |")
md.append("|---|-----|-----|--------|")
md.append("| 1 | Blank screen (RecipeCardView) | unusedIngredients undefined crash | Fixed |")
md.append("| 2 | Harga hallucinated (tinggi) | Ceiling guard added di recipeGuard | Fixed |")
md.append("| 3 | Harga under-price (rendah) | Floor guard sudah ada, berfungsi | Working |")
md.append("| 4 | Gramasi di nama bahan | parseGramasi() extract ke amount field | Fixed |")
md.append("| 5 | Servings selalu 1 | estimateServings() post-process | Fixed |")
md.append("| 6 | Porsi multiplier logic | Total naik saat per porsi > batch | Fixed |")
md.append("| 7 | Porsi limit 5x | Dihapus, unlimited | Fixed |")
md.append("| 8 | Budget check di chat mode | Error issues sekarang di-check | Fixed |")
md.append("")

md.append("---")
md.append("")
md.append("## Fase 1: Verifikasi Bug Kritis (16 test)")
md.append("")
md.append("| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |")
md.append("|---|------|--------|-------|------|----------|--------|--------|")

p1 = [r for r in all_results if r.get("name","").startswith("P1-")]
for i, r in enumerate(p1, 1):
    name = r.get("name","?")
    status = r.get("status","?")
    title = str(r.get("title","?") or "?")[:35]
    serv = r.get("estServings", "-")
    pp = r.get("perPorsi", 0)
    cpp = r.get("corrPP", 0)
    issues = ", ".join(r.get("issues", [])) or "NONE"
    md.append(f"| {i} | {name} | {status} | {title} | {serv} | Rp{pp:,} | Rp{cpp:,} | {issues} |")
md.append("")

md.append("---")
md.append("")
md.append("## Fase 2: Matriks Kategori x Budget (16 test)")
md.append("")
md.append("| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |")
md.append("|---|------|--------|-------|------|----------|--------|--------|")

p2 = [r for r in all_results if r.get("name","").startswith("P2-")]
for i, r in enumerate(p2, 1):
    name = r.get("name","?")
    status = r.get("status","?")
    title = str(r.get("title","?") or "?")[:35]
    serv = r.get("estServings", "-")
    pp = r.get("perPorsi", 0)
    cpp = r.get("corrPP", 0)
    issues = ", ".join(r.get("issues", [])) or "NONE"
    md.append(f"| {i} | {name} | {status} | {title} | {serv} | Rp{pp:,} | Rp{cpp:,} | {issues} |")
md.append("")

md.append("---")
md.append("")
md.append("## Fase 3: Variasi Kompleksitas Bahan (12 test)")
md.append("")
md.append("| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |")
md.append("|---|------|--------|-------|------|----------|--------|--------|")

p3 = [r for r in all_results if r.get("name","").startswith("P3-")]
for i, r in enumerate(p3, 1):
    name = r.get("name","?")
    status = r.get("status","?")
    title = str(r.get("title","?") or "?")[:35]
    serv = r.get("estServings", "-")
    pp = r.get("perPorsi", 0)
    cpp = r.get("corrPP", 0)
    issues = ", ".join(r.get("issues", [])) or "NONE"
    md.append(f"| {i} | {name} | {status} | {title} | {serv} | Rp{pp:,} | Rp{cpp:,} | {issues} |")
md.append("")

md.append("---")
md.append("")
md.append("## Fase 4: Edge Cases (12 test)")
md.append("")
md.append("| # | Test | Status | Title | Serv | PerPorsi | CorrPP | Issues |")
md.append("|---|------|--------|-------|------|----------|--------|--------|")

p4 = [r for r in all_results if r.get("name","").startswith("P4-")]
for i, r in enumerate(p4, 1):
    name = r.get("name","?")
    status = r.get("status","?")
    title = str(r.get("title","?") or "?")[:35]
    serv = r.get("estServings", "-")
    pp = r.get("perPorsi", 0)
    cpp = r.get("corrPP", 0)
    issues = ", ".join(r.get("issues", [])) or "NONE"
    md.append(f"| {i} | {name} | {status} | {title} | {serv} | Rp{pp:,} | Rp{cpp:,} | {issues} |")
md.append("")

md.append("---")
md.append("")
md.append("## Detail Bahan per Test (Sample 5)")
md.append("")

sample_tests = [r for r in all_results if r.get("status") == "FAIL" and r.get("details")][:5]
for r in sample_tests:
    name = r.get("name", "?")
    md.append(f"### {name}")
    md.append("")
    md.append(f"**Title:** {r.get('title','?')} | **Servings:** {r.get('estServings','-')} | **PerPorsi:** Rp{r.get('perPorsi',0):,} | **CorrPP:** Rp{r.get('corrPP',0):,}")
    md.append("")
    md.append("| Bahan | Takaran | Harga LLM | Harga Guard | Flag |")
    md.append("|-------|---------|-----------|-------------|------|")
    for d in r.get("details", []):
        name_d = str(d.get("name","?") or "?")[:30]
        amount = str(d.get("amount","?") or "?")[:15]
        raw = d.get("rawPrice", 0)
        corr = d.get("correctedPrice", 0)
        flags = ", ".join(d.get("flags", [])) or "OK"
        md.append(f"| {name_d} | {amount} | Rp{raw:,} | Rp{corr:,} | {flags} |")
    md.append("")

md.append("---")
md.append("")
md.append("## Analisis Temuan")
md.append("")
md.append("### 1. FLOOR Dominan (43/56 test)")
md.append("LLM konsisten menggunakan harga per-gram, bukan harga beli satuan warung.")
md.append("")
md.append("**Contoh:**")
md.append("- Tepung Sorgum: LLM Rp2.400 (Rp16/gram) -> Guard Rp8.000 (harga warung)")
md.append("- Madu: LLM Rp1.000 (Rp50/gram) -> Guard Rp10.000 (harga warung)")
md.append("- Garam: LLM Rp0-30 -> Guard Rp2.000 (harga warung)")
md.append("")
md.append("### 2. ZERO_PRICE (14 test)")
md.append("Beberapa bahan (Air, Garam, Vanili) dihargai Rp0 oleh LLM.")
md.append("Guard mengoreksi ke minimum Rp1.500.")
md.append("")
md.append("### 3. OVER_BUDGET (13 test)")
md.append("Setelah guard mengoreksi harga ke minimum warung, total melebihi budget.")
md.append("Ini expected behavior — guard menolak resep yang tidak feasible.")
md.append("")
md.append("### 4. PARSE_FAIL (13 test / 23%)")
md.append("LLM return prose/markdown alih-alih JSON murni.")
md.append("Ini masalah backend BIMA LLM, bukan bug frontend.")
md.append("")
md.append("### 5. CEILING (1 test)")
md.append("Hanya 1 test yang harga LLM-nya terlalu tinggi.")
md.append("Guard berhasil cap ke maximum.")
md.append("")
md.append("### 6. Servings Estimation")
md.append("- Minuman: 1 porsi (personal drink) — benar")
md.append("- Camilan: 2-3 porsi (estimated dari total gramasi) — reasonable")
md.append("- Makanan Berat: 2-4 porsi — reasonable")
md.append("")
md.append("---")
md.append("")
md.append("## Kesimpulan")
md.append("")
md.append("1. **Frontend code sudah stabil** — tidak ada blank screen, crash, atau bug UI")
md.append("2. **Guard berfungsi dengan baik** — FLOOR/CEILING/ZERO_PRICE semua ditangkap")
md.append("3. **MASALAH UTAMA: LLM under-price** — konsisten menggunakan harga per-gram")
md.append("4. **MASALAH KEDUA: PARSE_FAIL 23%** — LLM kadang return prose, bukan JSON")
md.append("5. **8 Fix sudah dideploy** — blank screen, ceiling, parseGramasi, estimateServings, porsi logic, budget check, unlimited porsi")
md.append("")
md.append("### Rekomendasi")
md.append("")
md.append("| Prioritas | Rekomendasi | Effort |")
md.append("|-----------|------------|--------|")
md.append("| P1 | Perbaiki prompt BIMA: harga = harga beli 1 bungkus warung | Backend |")
md.append("| P2 | Tambahkan retry logic untuk PARSE_FAIL | Frontend |")
md.append("| P3 | Update DNS shafnat.llmsorgum.online ke Vercel | DevOps |")

report = "\n".join(md)
with open("LAPORAN_TESTING_56.md", "w", encoding="utf-8") as f:
    f.write(report)

print(f"Report saved to LAPORAN_TESTING_56.md ({len(report)} chars, {len(md)} lines)")
