/**
 * Backfill image_url / image_key / image_credit / image_page untuk SEMUA resep yang sudah ada.
 *
 * Memakai resolver yang sama dengan aplikasi (src/services/recipeImageResolver.ts) supaya
 * hasil backfill = hasil runtime. Penyebaran foto memakai aturan least-used: resep terlama
 * dapat foto pertama dari menunya, resep berikutnya dapat foto lain, dst.
 *
 * Jalankan: node tools/image-index/backfill-recipe-images.mjs [--dry]
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..', '..');
const dry = process.argv.includes('--dry');
const PROJECT = 'iobregajljmstnjosprn';
const KEYFILE = 'C:\\Users\\shafnats\\Documents\\Key\\Supabase All Access - Shafnat Org.txt';

const token = readFileSync(KEYFILE, 'utf8').match(/sbp_[A-Za-z0-9]+/)[0];
const bundle = resolve(here, '.resolver.mjs');
if (!existsSync(bundle) || process.argv.includes('--rebuild')) {
  execFileSync('npx', ['--yes', 'esbuild', 'src/services/recipeImageResolver.ts',
    '--bundle', '--format=esm', '--platform=neutral', `--outfile=${bundle}`],
    { cwd: repo, stdio: 'inherit', shell: process.platform === 'win32' });
}
const R = await import(pathToFileURL(bundle).href);
R.setMenuImageIndex(JSON.parse(readFileSync(resolve(repo, 'public/menu-images.json'), 'utf8')));

async function sql(query) {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT}/database/query`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      return await res.json();
    } catch (e) {
      if (i === 2) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const rows = await sql("select id, slug, title, dish_category, image_url, image_key from recipes order by created_at asc, id asc;");
console.log('resep:', rows.length);

const usage = {};
for (const r of rows) if (r.image_key) usage[r.image_key] = (usage[r.image_key] || 0) + 1;
R.setImageUsage(usage);

const updates = [];
let matched = 0;
let kept = 0;
const force = process.argv.includes('--force');
for (const r of rows) {
  // idempoten: resep yang sudah punya foto + kunci dibiarkan apa adanya,
  // supaya menjalankan ulang skrip ini tidak mengacak foto resep yang sudah terbit.
  if (!force && r.image_key && r.image_url) {
    kept++;
    continue;
  }
  const out = R.resolveMenuImage(r.title || '', r.dish_category || undefined, r.slug || r.id);
  if (!out.url) continue;
  if (out.matched) matched++;
  if (r.image_key === out.imageKey && r.image_url === out.url) continue;
  usage[out.imageKey] = (usage[out.imageKey] || 0) + 1;
  R.setImageUsage(usage);
  updates.push([r.id, out.url, out.imageKey, (out.credit || '').slice(0, 200), (out.page || '').slice(0, 300)]);
}
console.log('cocok ke menu indeks:', matched, `(${((matched / rows.length) * 100).toFixed(1)}%)`);
console.log('sudah terisi (dilewati):', kept);
console.log('baris yang perlu diupdate:', updates.length);
if (dry) process.exit(0);

const B = 60;
for (let i = 0; i < updates.length; i += B) {
  const values = updates.slice(i, i + B)
    .map((x) => `(cast(${q(x[0])} as uuid),${q(x[1])},${q(x[2])},${q(x[3])},${q(x[4])})`).join(',');
  await sql(`update recipes r set image_url = v.url, image_key = v.ikey, image_credit = v.credit, image_page = v.page
             from (values ${values}) as v(id, url, ikey, credit, page) where r.id = v.id;`);
  console.log(`  update ${Math.min(i + B, updates.length)}/${updates.length}`);
}

console.log('\n== verifikasi ==');
console.log(await sql(`select count(*) resep, count(distinct image_url) foto_unik, count(image_key) punya_key,
                       (select max(u) from (select count(*) u from recipes where image_key is not null group by image_key) t) pemakaian_maks
                       from recipes;`));
console.log(await sql(`select split_part(image_key,'#',1) menu, count(*) resep, count(distinct image_key) foto
                       from recipes where image_key is not null group by 1 order by 2 desc limit 10;`));
