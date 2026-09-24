/**
 * LLM Recipe Quality Test — 10 scenarios, parallel execution
 */

const API_URL = "https://shafnat.llmsorgum.online/bima-api/chat";

const SCENARIOS = [
  { name: "S01-Minuman-100k-Semua", cat: "minuman_nutrisi", ing: "biji_sorgum, tepung_sorgum, protein_ayam_telur, sayuran_hijau, Bawang Merah, Santan, Bawang Putih, Kecap Manis, Tahu, Tempe, Wortel, Minyak Kelapa, Madu, Daun Pandan", budget: 100000, time: "Maks 30 Menit" },
  { name: "S02-MakanBerat-15k-Sedikit", cat: "makanan_berat", ing: "biji_sorgum, Bawang Merah, Santan", budget: 15000, time: "Maks 30 Menit" },
  { name: "S03-Camilan-25k", cat: "camilan_sehat", ing: "tepung_sorgum, Telur, Minyak Kelapa, Gula", budget: 25000, time: "Maks 15 Menit" },
  { name: "S04-Dessert-20k", cat: "dessert_rendah_gi", ing: "tepung_sorgum, Santan, Daun Pandan, Gula Merah", budget: 20000, time: "Maks 45 Menit" },
  { name: "S05-Minuman-10k-Ketat", cat: "minuman_nutrisi", ing: "tepung_sorgum, Santan, Madu, Daun Pandan", budget: 10000, time: "Maks 15 Menit" },
  { name: "S06-MakanBerat-50k-Lengkap", cat: "makanan_berat", ing: "biji_sorgum, sayuran_hijau, protein_ayam_telur, Bawang Merah, Bawang Putih, Wortel, Minyak Kelapa, Kecap Manis", budget: 50000, time: "Maks 45 Menit" },
  { name: "S07-Camilan-5k-SangatKetat", cat: "camilan_sehat", ing: "tepung_sorgum, Garam", budget: 5000, time: "Maks 15 Menit" },
  { name: "S08-Dessert-30k-Premium", cat: "dessert_rendah_gi", ing: "tepung_sorgum, Madu, Santan, Telur, Daun Pandan", budget: 30000, time: "Maks 30 Menit" },
  { name: "S09-Minuman-50k-BahanAneh", cat: "minuman_nutrisi", ing: "biji_sorgum, sayuran_hijau, protein_ayam_telur, Tempe, Tahu", budget: 50000, time: "Maks 30 Menit" },
  { name: "S10-MakanBerat-100k-Longgar", cat: "makanan_berat", ing: "biji_sorgum, tepung_sorgum, protein_ayam_telur, sayuran_hijau, Bawang Merah, Santan, Wortel, Minyak Kelapa", budget: 100000, time: "Fleksibel" },
];

const FLOOR = [
  [/garam/i, 2000], [/merica/i, 3000], [/gula/i, 3000], [/minyak/i, 5000],
  [/kecap/i, 3000], [/bawang/i, 3000], [/wortel/i, 3000], [/sayur|bayam/i, 2000],
  [/telur/i, 2500], [/tahu|tempe/i, 2000], [/tepung.*sorgum/i, 8000],
  [/biji.*sorgum/i, 6000], [/santan/i, 3000], [/susu/i, 4000], [/madu/i, 10000],
  [/daun/i, 1500], [/kurma/i, 5000],
];
const CEILING = [
  [/garam/i, 5000], [/merica/i, 8000], [/gula/i, 12000], [/minyak/i, 18000],
  [/kecap/i, 8000], [/bawang/i, 10000], [/wortel/i, 10000], [/sayur|bayam/i, 8000],
  [/telur/i, 30000], [/tahu|tempe/i, 8000], [/tepung.*sorgum/i, 20000],
  [/biji.*sorgum/i, 15000], [/santan/i, 10000], [/susu/i, 15000], [/madu/i, 35000],
  [/daun/i, 5000], [/kurma/i, 25000],
];
const GMIN = 1500, GMAX = 50000;
function floor(n) { for (const [r,m] of FLOOR) if (r.test(n)) return m; return null; }
function ceil(n) { for (const [r,m] of CEILING) if (r.test(n)) return m; return null; }

function makePrompt(s) {
  return `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia.

### INPUT USER
- Kategori Hidangan: ${s.cat}
- Bahan Pokok: ${s.ing}
- Target Budget per porsi: Rp ${s.budget.toLocaleString("id-ID")}
- Batas Waktu Persiapan: ${s.time}

### ATURAN
- HANYA gunakan Bahan Pokok + bahan dapur umum.
- Harga minimum Rp 1.500/bahan. Gramasi spesifik.
- estimatedCost = total estimatedPrice. Servings realistis.

### FORMAT: JSON murni
{"title":"string","subtitle":"string","targetAge":"string","dishCategory":"string","targetBudget":n,"estimatedCost":n,"prepTimeMinutes":n,"cookTimeMinutes":n,"servings":n,"ingredients":[{"name":"string (gramasi)","amount":"string","estimatedPrice":n}],"nutritionHighlight":{"title":"string","description":"string","fiberGrams":n,"proteinGrams":n,"glycemicIndex":"string","caloriesEstimate":n},"steps":[{"stepNumber":n,"title":"string","instruction":"string","timerMinutes":n}],"tags":["string"]}`;
}

async function callApi(prompt) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 170000);
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Use-RAG": "false", "X-Stream": "true", "X-Max-Tokens": "4096" },
      body: JSON.stringify({ message: prompt }),
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let full = "", buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() || "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const p = line.slice(6).trim();
        if (p === "[DONE]") continue;
        try { const o = JSON.parse(p); if (o.delta) full += o.delta; if (o.response) full = o.response; } catch {}
      }
    }
    return full;
  } catch (e) { clearTimeout(t); throw e; }
}

function extractJson(text) {
  if (!text) return null;
  const s = text.indexOf("{");
  if (s === -1) return null;
  let d = 0;
  for (let i = s; i < text.length; i++) {
    if (text[i] === "{") d++;
    else if (text[i] === "}") { d--; if (d === 0) { try { return JSON.parse(text.substring(s, i + 1)); } catch { return null; } } }
  }
  return null;
}

function evaluate(json, scenario) {
  const issues = [];
  const ings = json.ingredients || [];

  // Servings
  if (!json.servings || json.servings < 1) issues.push("servings invalid: " + json.servings);

  // Per-ingredient checks
  const priceDetails = [];
  for (const ing of ings) {
    const n = ing.name || "", p = Number(ing.estimatedPrice) || 0, a = ing.amount || "";
    const f = floor(n), c = ceil(n);
    const minP = f !== null ? f : GMIN, maxP = c !== null ? c : GMAX;
    let corrected = p;
    let flags = [];
    if (p < minP) { corrected = minP; flags.push("TERLALU_RENDAH"); }
    if (p > maxP) { corrected = maxP; flags.push("TERLALU_TINGGI"); }
    if (p === 0) flags.push("ZERO");
    if (!a) flags.push("NO_GRAMASI");
    priceDetails.push({ name: n, raw: p, corrected, flags, amount: a });
    for (const f of flags) {
      if (f === "TERLALU_RENDAH") issues.push(`HARGA_RENDAH: "${n}" Rp ${p.toLocaleString("id-ID")} (min ${minP.toLocaleString("id-ID")})`);
      if (f === "TERLALU_TINGGI") issues.push(`HARGA_TINGGI: "${n}" Rp ${p.toLocaleString("id-ID")} (max ${maxP.toLocaleString("id-ID")})`);
      if (f === "NO_GRAMASI") issues.push(`NO_GRAMASI: "${n}"`);
      if (f === "ZERO") issues.push(`ZERO_PRICE: "${n}"`);
    }
  }

  // Cost mismatch
  const rawSum = ings.reduce((s, i) => s + (Number(i.estimatedPrice) || 0), 0);
  const corrSum = priceDetails.reduce((s, p) => s + p.corrected, 0);
  const declared = Number(json.estimatedCost) || 0;
  if (Math.abs(rawSum - declared) > 100) issues.push(`COST_MISMATCH: raw ${rawSum} vs declared ${declared}`);

  // Budget per porsi
  const perPorsi = json.servings > 0 ? Math.round(corrSum / json.servings) : corrSum;
  if (perPorsi > scenario.budget * 1.15) issues.push(`OVER_BUDGET: Rp ${perPorsi.toLocaleString("id-ID")}/porsi > ${scenario.budget.toLocaleString("id-ID")}`);

  // Steps
  if (!json.steps || json.steps.length === 0) issues.push("NO_STEPS");

  // Nutrition
  if (!json.nutritionHighlight || !json.nutritionHighlight.title) issues.push("NO_NUTRITION");

  return {
    pass: issues.length === 0,
    issues,
    title: json.title,
    servings: json.servings,
    rawTotal: rawSum,
    correctedTotal: corrSum,
    declaredTotal: declared,
    perPorsi,
    ingCount: ings.length,
    stepCount: (json.steps || []).length,
    priceDetails,
  };
}

async function runOne(scenario, idx) {
  const t0 = Date.now();
  try {
    const raw = await callApi(makePrompt(scenario));
    const json = extractJson(raw);
    if (!json) {
      const isRefusal = /tidak dapat|unpayload|ditolak/i.test(raw);
      return { idx: idx+1, name: scenario.name, status: isRefusal ? "REFUSAL" : "PARSE_FAIL", time: Date.now()-t0, issues: [], title: isRefusal ? "(AI refused)" : "(no JSON)" };
    }
    if (json.status === "unpayload") return { idx: idx+1, name: scenario.name, status: "REFUSAL", time: Date.now()-t0, issues: [], title: "(AI refused: unpayload)" };
    const ev = evaluate(json, scenario);
    return { idx: idx+1, name: scenario.name, status: ev.pass ? "PASS" : "FAIL", time: Date.now()-t0, ...ev };
  } catch (e) {
    return { idx: idx+1, name: scenario.name, status: "ERROR", time: Date.now()-t0, issues: [e.message], title: "" };
  }
}

async function main() {
  console.log("Running 10 LLM recipe tests in parallel (3 batches)...\n");
  const results = [];

  // Run in batches of 3 to avoid overloading
  for (let b = 0; b < SCENARIOS.length; b += 3) {
    const batch = SCENARIOS.slice(b, b + 3);
    const batchResults = await Promise.all(batch.map((s, i) => runOne(s, b + i)));
    results.push(...batchResults);
    for (const r of batchResults) {
      const icon = { PASS: "PASS", FAIL: "FAIL", REFUSAL: "REF", ERROR: "ERR", PARSE_FAIL: "ERR" }[r.status] || "???";
      console.log(`[${icon}] S${String(r.idx).padStart(2,"0")} ${r.name} (${(r.time/1000).toFixed(0)}s)${r.title ? " — " + r.title : ""}`);
    }
  }

  // Full report
  console.log("\n" + "=".repeat(80));
  console.log("FULL REPORT — 10 LLM Recipe Quality Tests");
  console.log("=".repeat(80));

  const pass = results.filter(r => r.status === "PASS").length;
  const fail = results.filter(r => r.status === "FAIL").length;
  const ref = results.filter(r => r.status === "REFUSAL").length;
  const err = results.filter(r => r.status === "ERROR" || r.status === "PARSE_FAIL").length;
  console.log(`\nPASS: ${pass} | FAIL: ${fail} | REFUSAL: ${ref} | ERROR: ${err} | Pass Rate: ${((pass/(pass+fail))*100).toFixed(0)}%`);

  for (const r of results) {
    console.log(`\n--- ${r.name} ---`);
    console.log(`Status: ${r.status} | Title: ${r.title || "N/A"}`);
    if (r.servings) console.log(`Servings: ${r.servings} | Raw Total: Rp ${(r.rawTotal||0).toLocaleString("id-ID")} | Corrected: Rp ${(r.correctedTotal||0).toLocaleString("id-ID")} | Per Porsi: Rp ${(r.perPorsi||0).toLocaleString("id-ID")}`);
    if (r.ingCount) console.log(`Ingredients: ${r.ingCount} | Steps: ${r.stepCount}`);
    if (r.priceDetails) {
      console.log("Ingredient Details:");
      for (const p of r.priceDetails) {
        const flagStr = p.flags.length ? " [" + p.flags.join(",") + "]" : "";
        console.log(`  ${p.name} | ${p.amount || "?"} | Rp ${p.raw.toLocaleString("id-ID")} → Rp ${p.corrected.toLocaleString("id-ID")}${flagStr}`);
      }
    }
    if (r.issues && r.issues.length > 0) {
      console.log("Issues:");
      for (const i of r.issues) console.log(`  - ${i}`);
    }
  }

  const fs = await import("fs");
  fs.writeFileSync("test_results.json", JSON.stringify(results, null, 2));
  console.log("\n\nResults saved to test_results.json");
}

main().catch(console.error);
