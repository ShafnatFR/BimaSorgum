/**
 * BIMA Recipe Test Runner
 * Usage: node test_runner.mjs <output_file> <test_json_file>
 * 
 * test_json_file format: array of {name, cat, ing, budget, time}
 * output: JSON array of test results
 */

import { readFileSync, writeFileSync } from 'fs';

const API_URL = 'https://shafnat.llmsorgum.online/bima-api/chat';

const FLOOR = [
  [/tepung.*sorgum/i, 8000], [/biji.*sorgum/i, 6000], [/telur/i, 2500],
  [/garam/i, 2000], [/minyak/i, 5000], [/madu/i, 10000], [/santan/i, 3000],
  [/bawang/i, 3000], [/wortel/i, 3000], [/daun/i, 1500], [/gula/i, 3000],
  [/kecap/i, 3000], [/tahu|tempe/i, 2000], [/bayam|sayur/i, 2000],
  [/merica/i, 3000], [/susu/i, 4000],
];
const CEILING = [
  [/tepung.*sorgum/i, 20000], [/biji.*sorgum/i, 15000], [/telur/i, 30000],
  [/garam/i, 5000], [/minyak/i, 18000], [/madu/i, 35000], [/santan/i, 10000],
  [/bawang/i, 10000], [/wortel/i, 10000], [/daun/i, 5000], [/gula/i, 12000],
  [/kecap/i, 8000], [/tahu|tempe/i, 8000], [/bayam|sayur/i, 8000],
  [/merica/i, 8000], [/susu/i, 15000],
];

function fl(n) { for (const [r, m] of FLOOR) if (r.test(n)) return m; return null; }
function cl(n) { for (const [r, m] of CEILING) if (r.test(n)) return m; return null; }

function estimateServings(llmServ, cat, ings) {
  if (llmServ && llmServ > 1) return llmServ;
  let totalG = 0;
  for (const ing of ings) {
    const combined = (ing.amount || '') + ' ' + (ing.name || '');
    const m = combined.match(/(\d+)\s*(gram|g|gr)/i);
    if (m) totalG += parseInt(m[1], 10);
    const ml = combined.match(/(\d+)\s*ml/i);
    if (ml) totalG += parseInt(ml[1], 10);
  }
  if (cat === 'minuman_nutrisi') return totalG > 500 ? 2 : 1;
  const gPer = { camilan_sehat: 120, dessert_rendah_gi: 100 }[cat] || 300;
  const est = totalG > 0 ? Math.max(2, Math.round(totalG / gPer)) : 2;
  return Math.min(est, 10);
}

function makePrompt(s) {
  return `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia. Buat resep ${s.cat} dari ${s.ing}. Budget Rp${s.budget.toLocaleString('id-ID')}/porsi. Waktu ${s.time}. Harga=harga beli satuan warung minimum Rp1500/bahan. Gramasi spesifik. Output JSON murni: {"title":"s","subtitle":"s","targetAge":"s","dishCategory":"s","targetBudget":${s.budget},"estimatedCost":n,"prepTimeMinutes":n,"cookTimeMinutes":n,"servings":n,"ingredients":[{"name":"Nama (gramasi)","amount":"jumlah","estimatedPrice":n}],"nutritionHighlight":{"title":"s","description":"s","fiberGrams":n,"proteinGrams":n,"glycemicIndex":"s","caloriesEstimate":n},"steps":[{"stepNumber":n,"title":"s","instruction":"s","timerMinutes":n}],"tags":["s"]}`;
}

async function callApi(prompt) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 170000);
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Use-RAG': 'false', 'X-Stream': 'true', 'X-Max-Tokens': '4096' },
      body: JSON.stringify({ message: prompt }),
      signal: ctl.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader(), dec = new TextDecoder();
    let full = '', buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const p = line.slice(6).trim();
        if (p === '[DONE]') continue;
        try { const o = JSON.parse(p); if (o.delta) full += o.delta; if (o.response) full = o.response; } catch {}
      }
    }
    return full;
  } catch (e) { clearTimeout(t); throw e; }
}

function extractJson(text) {
  if (!text) return null;
  const s = text.indexOf('{');
  if (s === -1) return null;
  let d = 0;
  for (let i = s; i < text.length; i++) {
    if (text[i] === '{') d++;
    else if (text[i] === '}') { d--; if (d === 0) try { return JSON.parse(text.substring(s, i + 1)); } catch { return null; } }
  }
  return null;
}

function evaluate(json, scenario) {
  const issues = [];
  const ings = json.ingredients || [];
  const rawServings = json.servings;
  const servings = estimateServings(rawServings, scenario.cat, ings);
  const details = [];

  for (const ing of ings) {
    const name = ing.name || '', price = Number(ing.estimatedPrice) || 0, amount = ing.amount || '';
    let corrected = price; const flags = [];
    const f = fl(name), c = cl(name);
    const minP = f ?? 1500, maxP = c ?? 50000;
    if (price < minP) { corrected = minP; flags.push('FLOOR'); }
    if (price > maxP) { corrected = maxP; flags.push('CEILING'); }
    if (price === 0) flags.push('ZERO');
    if (!amount || amount === '?') flags.push('NO_AMOUNT');
    details.push({ name, amount, rawPrice: price, correctedPrice: corrected, flags });
  }

  const rawTotal = ings.reduce((s, i) => s + (Number(i.estimatedPrice) || 0), 0);
  const corrTotal = details.reduce((s, d) => s + d.correctedPrice, 0);
  const perPorsi = rawTotal / Math.max(servings, 1);
  const corrPP = corrTotal / Math.max(servings, 1);

  if (corrPP > scenario.budget * 1.15) issues.push('OVER_BUDGET');
  if (!json.steps || json.steps.length === 0) issues.push('NO_STEPS');
  if (!json.nutritionHighlight?.title) issues.push('NO_NUTRITION');
  if (details.some(d => d.flags.includes('NO_AMOUNT'))) issues.push('NO_AMOUNT');
  if (details.some(d => d.flags.includes('FLOOR'))) issues.push('FLOOR');
  if (details.some(d => d.flags.includes('CEILING'))) issues.push('CEILING');
  if (details.some(d => d.flags.includes('ZERO'))) issues.push('ZERO_PRICE');

  return {
    pass: issues.length === 0,
    issues,
    title: json.title || '?',
    llmServings: rawServings,
    estServings: servings,
    rawTotal,
    corrTotal,
    perPorsi: Math.round(perPorsi),
    corrPP: Math.round(corrPP),
    ingCount: ings.length,
    stepCount: (json.steps || []).length,
    hasNutrition: !!json.nutritionHighlight?.title,
    details,
  };
}

async function runTest(scenario) {
  const t0 = Date.now();
  try {
    const raw = await callApi(makePrompt(scenario));
    const json = extractJson(raw);
    if (!json) {
      const isRef = /tidak dapat|unpayload|ditolak/i.test(raw);
      return { name: scenario.name, status: isRef ? 'REFUSAL' : 'PARSE_FAIL', time: Date.now() - t0, issues: [isRef ? 'REFUSAL' : 'PARSE_FAIL'], title: isRef ? '(AI refused)' : '(no JSON)' };
    }
    if (json.status === 'unpayload') return { name: scenario.name, status: 'REFUSAL', time: Date.now() - t0, issues: ['REFUSAL'], title: '(AI refused)' };
    const ev = evaluate(json, scenario);
    return { name: scenario.name, status: ev.pass ? 'PASS' : 'FAIL', time: Date.now() - t0, ...ev };
  } catch (e) {
    return { name: scenario.name, status: 'ERROR', time: Date.now() - t0, issues: ['ERROR'], title: e.message };
  }
}

// Main
const outputFile = process.argv[2];
const testFile = process.argv[3];

if (!outputFile || !testFile) {
  console.error('Usage: node test_runner.mjs <output_file> <test_json_file>');
  process.exit(1);
}

const tests = JSON.parse(readFileSync(testFile, 'utf-8'));
console.log(`Running ${tests.length} tests...`);

const results = [];
for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  console.log(`[${i + 1}/${tests.length}] ${t.name}...`);
  const result = await runTest(t);
  results.push(result);
  console.log(`  ${result.status} (${(result.time / 1000).toFixed(0)}s) ${result.title || ''}`);
}

writeFileSync(outputFile, JSON.stringify(results, null, 2));
console.log(`\nDone: ${results.length} tests. Results saved to ${outputFile}`);

// Summary
const pass = results.filter(r => r.status === 'PASS').length;
const fail = results.filter(r => r.status === 'FAIL').length;
const refusal = results.filter(r => r.status === 'REFUSAL').length;
const parseFail = results.filter(r => r.status === 'PARSE_FAIL').length;
const error = results.filter(r => r.status === 'ERROR').length;
console.log(`PASS:${pass} FAIL:${fail} REFUSAL:${refusal} PARSE_FAIL:${parseFail} ERROR:${error}`);
