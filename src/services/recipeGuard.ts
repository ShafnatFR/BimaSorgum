export interface RecipeIssue {
  level: 'warning' | 'error';
  message: string;
}

export function isRefusal(parsed: Record<string, any> | null | undefined): { refused: boolean; message: string } {
  if (!parsed) return { refused: false, message: '' };
  const title = (parsed.title || '').toLowerCase();
  const subtitle = (parsed.subtitle || '').toLowerCase();
  const ings = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
  const refusalKeywords = /tidak dapat dibuat|tidak bisa|tidak dapat disusun|tolak|tidak lazim|tidak cocok|menolak/i;
  if (refusalKeywords.test(title) || refusalKeywords.test(subtitle) || ings.length === 0) {
    return {
      refused: true,
      message: parsed.subtitle || parsed.title || 'Kombinasi bahan tidak dapat dibuat menjadi resep.',
    };
  }
  return { refused: false, message: '' };
}

const CONFLICTING_PAIRS: Array<{ a: RegExp; b: RegExp; reason: string }> = [
  { a: /madu/i, b: /santan|kelapa\s*parut|kelapa\s*kering|air\s*kelapa/i, reason: 'madu + santan/kelapa' },
  { a: /madu/i, b: /cabai|sambal|pedas/i, reason: 'madu + pedas' },
  { a: /madu/i, b: /terasi|petis|belacan/i, reason: 'madu + terasi/petis' },
  { a: /madu/i, b: /cuka|asam/i, reason: 'madu + cuka' },
  { a: /madu/i, b: /kecap\s*asin|asin/i, reason: 'madu + kecap asin' },
  { a: /madu/i, b: /jengkol/i, reason: 'madu + jengkol' },
  { a: /madu/i, b: /kopi|bubuk\s*kopi/i, reason: 'madu + kopi' },
  { a: /durian/i, b: /madu/i, reason: 'durian + madu' },
  { a: /durian/i, b: /terasi|petis|ikan\s*asin/i, reason: 'durian + terasi/petis' },
  { a: /durian/i, b: /bawang|kecap|garam|merica/i, reason: 'durian + bumbu masakan gurih' },
  { a: /saus\s*sambal|sambal/i, b: /dessert|puding|es\s*krim|manis/i, reason: 'pedas + dessert' },
  { a: /cokelat|cocoa/i, b: /terasi|petis|belacan/i, reason: 'cokelat + terasi/petis' },
  { a: /cokelat|cocoa/i, b: /sambal|cabai\s*rawit/i, reason: 'cokelat + cabai rawit' },
  { a: /susu|keju/i, b: /terasi|petis|ikan\s*asin/i, reason: 'susu/keju + terasi/ikan asin' },
  { a: /es\s*krim|ice\s*cream/i, b: /kecap|sambal|terasi/i, reason: 'es krim + kecap/sambal/terasi' },
  { a: /nutella|selai\s*cokelat/i, b: /terasi|petis|sarden|ikan/i, reason: 'nutella + terasi/ikan' },
  { a: /sprite|fanta|cola|soda/i, b: /cabai|sambal|terasi/i, reason: 'soda + cabai/terasi' },
];

export function detectIngredientConflicts(ingredientNames: string[]): string[] {
  const joined = ingredientNames.join(' ');
  const hits: string[] = [];
  for (const pair of CONFLICTING_PAIRS) {
    if (pair.a.test(joined) && pair.b.test(joined)) {
      hits.push(pair.reason);
    }
  }
  return hits;
}

const DRINK_WORDS = 'smoothie|jus|juice|wedang|latte|milkshake|minuman';
const SAVORY_MAIN_WORDS = 'nasi|gulai|kari|curry|semur|rendang|soto|sup|soup|sop|tumis|bakso|pepes';
const wordsRe = (words: string) => new RegExp(`\\b(${words})\\b`, 'i');
const CATEGORY_MISMATCH: Record<string, { re: RegExp; label: string; hint: string }> = {
  makanan_berat: {
    re: wordsRe(`${DRINK_WORDS}|puding|pudding|kue|cookies|biskuit|brownies|keripik`),
    label: 'Makanan Berat',
    hint: 'hidangan utama yang mengenyangkan, bukan minuman, kue, atau camilan',
  },
  camilan_sehat: {
    re: wordsRe(`${DRINK_WORDS}|${SAVORY_MAIN_WORDS}`),
    label: 'Camilan Sehat',
    hint: 'kudapan ringan porsi kecil, bukan lauk/hidangan utama atau minuman',
  },
  minuman_nutrisi: {
    re: wordsRe(`${SAVORY_MAIN_WORDS}|bubur|porridge|goreng|mie|mi|kue|bolu|cake`),
    label: 'Minuman Nutrisi',
    hint: 'minuman yang diminum (smoothie, jus, susu/sari sorgum, wedang)',
  },
  dessert_rendah_gi: {
    re: wordsRe(`${SAVORY_MAIN_WORDS}|ayam|daging|ikan`),
    label: 'Dessert Rendah GI',
    hint: 'hidangan penutup manis yang ramah gula darah, bukan masakan gurih',
  },
};

export function validateRecipe(
  parsed: Record<string, any>,
  dishCategory?: string
): { issues: RecipeIssue[]; repaired: Record<string, any> } {
  const issues: RecipeIssue[] = [];
  const repaired: Record<string, any> = { ...parsed };

  const ingredients: Array<{ name?: string }> = Array.isArray(parsed.ingredients)
    ? parsed.ingredients
    : [];
  const names = ingredients.map((i) => (i.name || '').toString());

  const conflicts = detectIngredientConflicts(names);
  for (const c of conflicts) {
    issues.push({
      level: 'warning',
      message: `Kombinasi bahan tidak lazim (${c}) — hasil mungkin terasa aneh.`,
    });
  }

  const category = dishCategory ? CATEGORY_MISMATCH[dishCategory] : undefined;
  const mismatch = category ? String(parsed.title || '').match(category.re) : null;
  if (category && mismatch) {
    issues.push({
      level: 'error',
      message: `Kategori ${category.label} tetapi resepnya "${parsed.title}" (${mismatch[0]}) tidak sesuai — buat ${category.hint}.`,
    });
  }

  return { issues, repaired };
}
