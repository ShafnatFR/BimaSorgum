/**
 * Uji resolver gambar: pastikan setiap resep dapat foto yang sesuai namanya & tidak menumpuk.
 *
 * Jalankan:  node tools/image-index/test-resolver.mjs
 * (skrip ini bundle src/services/recipeImageResolver.ts pakai esbuild, lalu jalankan di Node)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const bundle = resolve(here, '.resolver.mjs');

if (!existsSync(bundle) || process.argv.includes('--rebuild')) {
  execFileSync('npx', ['--yes', 'esbuild', 'src/services/recipeImageResolver.ts',
    '--bundle', '--format=esm', '--platform=neutral', `--outfile=${bundle}`],
    { cwd: repo, stdio: 'inherit', shell: process.platform === 'win32' });
}

const R = await import(pathToFileURL(bundle).href + '?t=' + Date.now());
const index = JSON.parse(readFileSync(resolve(repo, 'public/menu-images.json'), 'utf8'));
R.setMenuImageIndex(index);

const titles = JSON.parse(readFileSync(resolve(here, 'recipe-titles.json'), 'utf8'));
const usage = {};
const rows = [];

for (const r of titles) {
  const out = R.resolveMenuImage(r.title, r.dish_category || undefined, r.slug || r.id);
  usage[out.imageKey] = (usage[out.imageKey] || 0) + 1;
  R.setImageUsage(usage);             // simulasi: pemakaian bertambah tiap resep baru
  rows.push({ title: r.title, key: out.menuKey, imageKey: out.imageKey, url: out.url, matched: out.matched });
}

const matched = rows.filter((r) => r.matched).length;
const noUrl = rows.filter((r) => !r.url).length;
const distinctImages = new Set(rows.map((r) => r.imageKey)).size;
const distinctUrls = new Set(rows.map((r) => r.url)).size;
const uses = Object.values(usage);
const maxUses = Math.max(...uses);
const menus = new Set(rows.filter((r) => r.matched).map((r) => r.key)).size;

// pelanggaran: dua resep beda menu tapi foto sama
const byImage = {};
for (const r of rows) (byImage[r.imageKey] ||= []).push(r);
const bedaMenuSatuFoto = Object.entries(byImage).filter(
  ([, list]) => new Set(list.map((x) => x.key)).size > 1);

console.log('=== hasil uji resolver ===');
console.log('resep diuji          :', rows.length);
console.log('cocok ke menu indeks :', matched, `(${((matched / rows.length) * 100).toFixed(1)}%)`);
console.log('tanpa foto           :', noUrl);
console.log('menu indeks terpakai :', menus, 'dari', Object.keys(index.items).length);
console.log('foto unik terpakai   :', distinctImages, '(url unik:', distinctUrls + ')');
console.log('pemakaian maksimum   :', maxUses, 'kali per foto');
console.log('foto dipakai beda menu:', bedaMenuSatuFoto.length, '(harus 0)');
console.log('');
console.log('contoh 14 pemetaan:');
for (const r of rows.slice(0, 14)) console.log(`  ${r.title.slice(0, 52).padEnd(54)} -> ${r.imageKey}`);

const gagal = [];
if (noUrl > 0) gagal.push('ada resep tanpa foto');
if (bedaMenuSatuFoto.length > 0) gagal.push('ada foto dipakai lintas menu');
if (matched / rows.length < 0.5) gagal.push('tingkat kecocokan < 50%');
if (distinctImages < 10) gagal.push('variasi foto terlalu sedikit');
writeFileSync(resolve(here, 'resolver-test-result.json'),
  JSON.stringify({ summary: { total: rows.length, matched, noUrl, distinctImages, maxUses, menus }, rows }, null, 1));
console.log('');
console.log(gagal.length ? 'GAGAL: ' + gagal.join('; ') : 'LULUS: semua pemeriksaan lolos');
process.exit(gagal.length ? 1 : 0);
