/**
 * Wizard healthcheck — runs the REAL production frontend pipeline
 * (generateRecipeFromWizardAsync -> bimaChat -> parseSSE -> validateRecipe)
 * against the deployed backend, and classifies every user-visible outcome.
 *
 * Why bundle with esbuild: bimaClient.ts reads `import.meta.env` (Vite-only),
 * so the runner must be bundled with `--define:import.meta.env={}`.
 * The only shim is global fetch: relative `/bima-api/chat` -> absolute prod URL.
 *
 * Exit code 0 = every config produced a usable result, 1 = at least one failure.
 */
import { generateRecipeFromWizardAsync, generateCustomRecipeQueryAsync } from '../../src/services/recipeGenerator';
import type { WizardFormData } from '../../src/types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';

/** Per-run collector: parallel workers must not see each other's attempts/raw SSE. */
const runStore = new AsyncLocalStorage<{ attempts: { ttftMs: number | null; raw: string; status: number }[] }>();

const BASE = process.env.BIMA_TEST_BASE || 'https://shafnat.llmsorgum.online';
const PARALLEL = Number(process.env.BIMA_TEST_PARALLEL || 3);
const OUT = process.env.BIMA_TEST_OUT || path.join(process.cwd(), 'tools', 'wizard-healthcheck', 'last-report.json');
const RUNS_PER_CONFIG = Number(process.env.BIMA_TEST_RUNS || 1);

interface Cfg extends WizardFormData { label: string; mode?: 'wizard' | 'chat'; userPrompt?: string; }

const makeCfg = (
  label: string, dishCategory: string, selectedIngredientIds: string[],
  customIngredients: string[], budgetPerPortion: number, prepTimeLimit: string
): Cfg => ({ label, targetConsumers: ['anak_sekolah'], dishCategory, selectedIngredientIds, customIngredients, budgetPerPortion, prepTimeLimit } as Cfg);

const CONFIGS: Cfg[] = [
  makeCfg('MB-biji-25k-15m', 'makanan_berat', ['biji_sorgum'], [], 25000, 'Maks 15 Menit'),
  makeCfg('MB-biji-25k-30m', 'makanan_berat', ['biji_sorgum'], ['Bawang Merah', 'Santan'], 25000, 'Maks 30 Menit'),
  makeCfg('MB-ayam-50k-flex', 'makanan_berat', ['protein_ayam_telur'], [], 50000, 'Fleksibel'),
  makeCfg('CS-biji-25k-30m', 'camilan_sehat', ['biji_sorgum'], ['Bawang Merah', 'Santan'], 25000, 'Maks 30 Menit'),
  makeCfg('CS-biji+sayur-15k', 'camilan_sehat', ['biji_sorgum', 'sayuran_hijau'], [], 15000, 'Maks 30 Menit'),
  makeCfg('CS-tepung-25k-15m', 'camilan_sehat', ['tepung_sorgum'], [], 25000, 'Maks 15 Menit'),
  makeCfg('MN-biji-25k-30m', 'minuman_nutrisi', ['biji_sorgum'], ['Bawang Merah', 'Santan'], 25000, 'Maks 30 Menit'),
  makeCfg('MN-tepung-50k-flex', 'minuman_nutrisi', ['tepung_sorgum'], [], 50000, 'Fleksibel'),
  makeCfg('DG-tepung-25k-45m', 'dessert_rendah_gi', ['tepung_sorgum'], [], 25000, 'Maks 45 Menit'),
  makeCfg('DG-biji-15k-30m', 'dessert_rendah_gi', ['biji_sorgum'], [], 15000, 'Maks 30 Menit'),
  makeCfg('MB-all-100k-flex', 'makanan_berat', ['biji_sorgum', 'sayuran_hijau', 'protein_ayam_telur'], ['Bawang Merah', 'Bawang Putih', 'Santan'], 100000, 'Fleksibel'),
  makeCfg('CS-ayam-15k-30m', 'camilan_sehat', ['protein_ayam_telur'], [], 15000, 'Maks 30 Menit'),
];

/** Chat-mode prompts (typed into /generate, no wizard) — the user-visible path that failed first. */
const CHAT_CONFIGS: Cfg[] = [
  { ...CONFIGS[3], label: 'CHAT-camilan-30m', mode: 'chat', userPrompt: 'Rekomendasi resep camilan sehat dengan waktu persiapan maks 30 menit' },
  { ...CONFIGS[0], label: 'CHAT-nasi-ayam', mode: 'chat', userPrompt: 'Buatkan resep nasi sorgum dengan ayam dan sayuran' },
];

// ---------------------------------------------------------------------------
// fetch shim: absolutize the relative proxy path + tee the raw SSE stream
// ---------------------------------------------------------------------------
const realFetch = globalThis.fetch.bind(globalThis);
let attemptStart = 0;

(globalThis as any).fetch = async (input: any, init?: any) => {
  const url = typeof input === 'string' ? input : input?.url;
  const abs = typeof url === 'string' && url.startsWith('/') ? BASE + url : url;
  attemptStart = Date.now();
  const rec = { ttftMs: null as number | null, raw: '', status: 0 };
  const store = runStore.getStore();
  store?.attempts.push(rec);
  const res = await realFetch(abs, init);
  rec.status = res.status;
  try {
    const clone = res.clone();
    const reader = clone.body?.getReader();
    if (reader) {
      const dec = new TextDecoder();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const txt = dec.decode(value, { stream: true });
            rec.raw += txt;
            if (rec.ttftMs === null && /"(delta|response)"\s*:/.test(txt)) rec.ttftMs = Date.now() - attemptStart;
          }
        } catch { /* tee is best-effort */ }
      })();
    }
  } catch { /* ignore */ }
  return res;
};

// ---------------------------------------------------------------------------
// classification
// ---------------------------------------------------------------------------
type Outcome =
  | 'PASS_RECIPE' | 'PASS_REFUSAL_AI'
  | 'FAIL_TIMEOUT' | 'FAIL_GENERIC_FALLBACK' | 'FAIL_NONJSON_PROSE'
  | 'FAIL_BACKEND_ERROR' | 'FAIL_BLOCKED_REVIEWER' | 'FAIL_GUARD_BUDGET'
  | 'FAIL_EMPTY_INGREDIENTS' | 'FAIL_THROWN' | 'FAIL_BACKEND_DOWN' | 'FAIL_UNKNOWN';

const FAILS: Outcome[] = ['FAIL_TIMEOUT', 'FAIL_GENERIC_FALLBACK', 'FAIL_NONJSON_PROSE', 'FAIL_BACKEND_ERROR', 'FAIL_BLOCKED_REVIEWER', 'FAIL_GUARD_BUDGET', 'FAIL_EMPTY_INGREDIENTS', 'FAIL_THROWN', 'FAIL_BACKEND_DOWN', 'FAIL_UNKNOWN'];

/** Every request died at the edge (Cloudflare 502/530…) — the origin was unreachable,
 *  which is an infrastructure outage, not a pipeline bug. */
function isInfraOutage(statuses: number[], outcome: Outcome) {
  return (outcome === 'FAIL_THROWN' || outcome === 'FAIL_GENERIC_FALLBACK') && statuses.length > 0 && statuses.every(s => s === 0 || s >= 500);
}

function classify(result: any, err: any, raws: string[]): { outcome: Outcome; detail: string } {
  const allRaw = raws.join('\n');
  const looksBlocked = /Resep Ditolak \(Skor Kelayakan/i.test(allRaw);
  const looksBackendErr = /Server AI gagal merespons/i.test(allRaw);
  const looksProseOnly = raws.length > 0 && raws.every(r => r.trim().length > 0) && !/\{\s*"/.test(allRaw);

  if (err) {
    const msg = String(err?.message || err);
    if (/timeout/i.test(msg)) return { outcome: 'FAIL_TIMEOUT', detail: msg.slice(0, 200) };
    // chat mode throws instead of returning a refusal object
    if (/tidak memberikan respons yang valid/i.test(msg)) return { outcome: 'FAIL_GENERIC_FALLBACK', detail: msg.slice(0, 200) };
    if (/Server AI gagal merespons/i.test(msg)) return { outcome: 'FAIL_BACKEND_ERROR', detail: msg.slice(0, 200) };
    if (/Skor Kelayakan/i.test(msg)) return { outcome: 'FAIL_BLOCKED_REVIEWER', detail: msg.replace(/\s+/g, ' ').slice(0, 200) };
    if (/Resep ditolak|BIMA menolak resep ini|Kombinasi bahan \/ budget/i.test(msg)) return { outcome: 'FAIL_GUARD_BUDGET', detail: msg.replace(/\s+/g, ' ').slice(0, 200) };
    return { outcome: 'FAIL_THROWN', detail: msg.slice(0, 200) };
  }
  const isRefusal = result && result.type === 'refusal';
  if (!isRefusal) {
    if (Array.isArray(result?.ingredients) && result.ingredients.length > 0) {
      return { outcome: 'PASS_RECIPE', detail: result.title };
    }
    return { outcome: 'FAIL_UNKNOWN', detail: 'recipe object without ingredients' };
  }
  const msg: string = result.message || '';
  if (/tidak memberikan respons yang valid/i.test(msg)) return { outcome: 'FAIL_GENERIC_FALLBACK', detail: msg.slice(0, 120) };
  if (looksBackendErr || /Server AI gagal merespons/i.test(msg)) return { outcome: 'FAIL_BACKEND_ERROR', detail: msg.slice(0, 200) };
  if (looksBlocked || /Skor Kelayakan/i.test(msg)) return { outcome: 'FAIL_BLOCKED_REVIEWER', detail: msg.replace(/\s+/g, ' ').slice(0, 160) };
  if (/Resep tidak dapat dibuat/i.test(msg)) return { outcome: 'FAIL_GUARD_BUDGET', detail: msg.replace(/\s+/g, ' ').slice(0, 160) };
  if (/Kombinasi bahan \/ budget yang diminta tidak dapat dibuat/i.test(msg)) return { outcome: 'FAIL_EMPTY_INGREDIENTS', detail: msg.slice(0, 160) };
  if (looksProseOnly) return { outcome: 'FAIL_NONJSON_PROSE', detail: msg.replace(/\s+/g, ' ').slice(0, 160) };
  return { outcome: 'PASS_REFUSAL_AI', detail: msg.replace(/\s+/g, ' ').slice(0, 160) };
}

function extractValidation(raws: string[]) {
  let verdict: string | null = null, score: number | null = null;
  for (const r of raws) {
    for (const line of r.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      try {
        const o = JSON.parse(line.slice(6));
        if (o.validation) { verdict = o.validation.verdict; score = o.validation.score; }
      } catch { /* ignore */ }
    }
  }
  return { verdict, score };
}

// ---------------------------------------------------------------------------
// runner
// ---------------------------------------------------------------------------
async function runOne(cfg: Cfg) {
  const store = { attempts: [] as { ttftMs: number | null; raw: string; status: number }[] };
  const t0 = Date.now();
  let result: any = null, err: any = null;
  try {
    result = await runStore.run(store, async () => (cfg.mode === 'chat'
      ? await generateCustomRecipeQueryAsync(cfg.userPrompt || '')
      : await generateRecipeFromWizardAsync(cfg)));
  } catch (e) { err = e; }
  const attempts = store.attempts;
  const durationMs = Date.now() - t0;
  const raws = attempts.map(a => a.raw);
  const statuses = attempts.map(a => a.status);
  let { outcome, detail } = classify(result, err, raws);
  if (isInfraOutage(statuses, outcome as Outcome)) {
    outcome = 'FAIL_BACKEND_DOWN' as Outcome;
    detail = `semua percobaan gagal di edge (HTTP ${statuses.join(', ')}) — origin tidak bisa dihubungi`;
  }
  const { verdict, score } = extractValidation(raws);
  return {
    label: cfg.label, mode: cfg.mode || 'wizard', dishCategory: cfg.dishCategory,
    ingredients: cfg.selectedIngredientIds.concat(cfg.customIngredients).join('+'),
    budget: cfg.budgetPerPortion, prepTime: cfg.prepTimeLimit,
    outcome, detail, durationMs,
    attempts: attempts.length,
    attemptStatuses: attempts.map(a => a.status),
    ttftMs: attempts.map(a => a.ttftMs),
    verdict, score,
    recipeTitle: result && result.type !== 'refusal' ? result.title : null,
    suggestionTitles: result?.type === 'refusal' ? (result.suggestions || []).map((s: any) => s.title) : [],
  };
}

async function main() {
  const started = new Date();
  const filter = (process.env.BIMA_TEST_FILTER || '').split(',').map(s => s.trim()).filter(Boolean);
  const active = filter.length ? [...CONFIGS, ...CHAT_CONFIGS].filter(c => filter.includes(c.label)) : [...CONFIGS, ...CHAT_CONFIGS];
  const queue = Array.from({ length: RUNS_PER_CONFIG }, () => active).flat();
  const results: any[] = [];

  // Preflight: without a reachable origin every config fails at the edge and the run
  // is worthless. Wait up to ~4 minutes for the backend to answer.
  for (let i = 0; i < 8; i++) {
    let st = 0;
    try {
      const r = await realFetch(BASE + '/bima-api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Stream': 'false' },
        body: JSON.stringify({ message: 'ping' }),
      });
      st = r.status;
      try { await r.body?.cancel(); } catch { /* ignore */ }
    } catch { st = 0; }
    if (st >= 200 && st < 500) { console.log(`preflight: backend OK (HTTP ${st})`); break; }
    console.log(`preflight: backend HTTP ${st} — tunggu 30s (${i + 1}/8)`);
    await new Promise((r) => setTimeout(r, 30_000));
  }

  const workers = Array.from({ length: PARALLEL }, async () => {
    while (queue.length) {
      const cfg = queue.shift()!;
      const r = await runOne(cfg);
      results.push(r);
      process.stdout.write(`[${results.length}/${active.length * RUNS_PER_CONFIG}] ${r.label} ${r.outcome} ${Math.round(r.durationMs / 1000)}s attempts=${r.attempts} ttft=${JSON.stringify(r.ttftMs.map(t => t && Math.round(t / 1000)))} verdict=${r.verdict} ${r.recipeTitle || r.detail}\n`);
    }
  });
  await Promise.all(workers);

  const failures = results.filter(r => FAILS.includes(r.outcome));
  const infraOutage = failures.length > 0 && failures.every(f => f.outcome === 'FAIL_BACKEND_DOWN');
  const report = {
    startedAt: started.toISOString(),
    finishedAt: new Date().toISOString(),
    base: BASE, parallel: PARALLEL, runsPerConfig: RUNS_PER_CONFIG,
    total: results.length,
    passed: results.length - failures.length,
    failed: failures.length,
    infraOutage,
    failureCounts: failures.reduce((acc: Record<string, number>, f) => ({ ...acc, [f.outcome]: (acc[f.outcome] || 0) + 1 }), {}),
    failures,
    results,
    toolchain: {
      noContentGuardMs: Number(process.env.BIMA_GUARD_MS || 0) || null,
      note: 'outcome gating from src/services/bimaClient.ts + recipeGenerator.ts as shipped',
    },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(report, null, 1));
  fs.writeFileSync(OUT.replace(/\.json$/, '.md'), renderMarkdown(report));
  console.log(`\nRESULT: ${report.passed}/${report.total} pass, ${report.failed} fail ${JSON.stringify(report.failureCounts)}${infraOutage ? ' [BACKEND/ORIGIN DOWN — infra, bukan bug kode]' : ''}`);
  console.log('report:', OUT);
  if (infraOutage) process.exitCode = 3;
  else if (report.failed > 0) process.exitCode = 1;
}

function renderMarkdown(rep: any) {
  const lines: string[] = [];
  lines.push(`# Wizard healthcheck — ${rep.finishedAt}`, '');
  lines.push(`Target: ${rep.base} | parallel=${rep.parallel} | ${rep.passed}/${rep.total} pass, ${rep.failed} fail`, '');
  lines.push('| Konfigurasi | Outcome | Durasi | Attempt | TTFT (s) | Verdict/Skor | Judul/Detail |');
  lines.push('|---|---|---|---|---|---|---|');
  for (const r of rep.results) {
    lines.push(`| ${r.label} | ${r.outcome} | ${(r.durationMs / 1000).toFixed(0)}s | ${r.attempts} | ${r.ttftMs.map((t: number | null) => t ? Math.round(t / 1000) : '-').join(', ')} | ${r.verdict || '-'}${r.score ? ' / ' + r.score : ''} | ${(r.recipeTitle || r.detail || '').slice(0, 70)} |`);
  }
  if (rep.failures.length) {
    lines.push('', '## Failures', '');
    for (const f of rep.failures) lines.push(`- **${f.label}** — ${f.outcome}: ${f.detail}`);
  }
  return lines.join('\n') + '\n';
}

main().catch(e => { console.error('healthcheck crashed:', e); process.exitCode = 2; });
