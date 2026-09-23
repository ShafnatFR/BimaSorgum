/**
 * recipeGuard — safety & sanity checks for AI-generated recipes.
 *
 * Guards against the two failure modes found in robustness testing:
 *  1. Illogical ingredient combinations (madu + terasi, madu + cabai, ...)
 *  2. Unrealistic ingredient prices the LLM invents to fit a tight budget.
 *
 * These run AFTER parsing the LLM JSON and BEFORE the recipe is shown/saved,
 * and produce a list of human-readable issues for the UI to surface.
 */

export interface RecipeIssue {
  level: 'warning' | 'error';
  message: string;
}

/** Detect when the LLM declined to make a recipe (empty ingredients / refusal title). */
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

/** Ingredient keyword -> realistic minimum price (IDR) per standard portion. */
export interface PremiumFloor { match: RegExp; min: number; label: string }

// Global minimum price for ALL ingredients (warung minimum purchase unit)
export const GLOBAL_MINIMUM_PRICE = 1500;

// Per-ingredient minimum warung prices (realistic minimum purchase units)
// These override GLOBAL_MINIMUM_PRICE when the ingredient matches
const WARUNG_PRICE_FLOOR: Array<{ match: RegExp; min: number; label: string }> = [
  // Bumbu dasar
  { match: /garam/i, min: 2000, label: 'garam (1 bungkus kecil)' },
  { match: /merica/i, min: 3000, label: 'merica (1 sachet)' },
  { match: /gula\s*(pasir|putih)/i, min: 3500, label: 'gula pasir (1/4 kg)' },
  { match: /gula\s*(merah|jawa|aren)/i, min: 3000, label: 'gula merah (1/4 kg)' },
  { match: /minyak\s*(goreng|kelapa|sayur)/i, min: 5000, label: 'minyak (500ml)' },
  { match: /kecap\s*manis/i, min: 3000, label: 'kecap manis (1 sachet)' },
  // Bawang & bumbu segar
  { match: /bawang\s*merah/i, min: 3000, label: 'bawang merah (1/4 kg)' },
  { match: /bawang\s*putih/i, min: 3000, label: 'bawang putih (1/4 kg)' },
  { match: /cabai|cabe/i, min: 4000, label: 'cabai (1/4 kg)' },
  { match: /jahe/i, min: 2000, label: 'jahe (100g)' },
  { match: /kunyit/i, min: 2000, label: 'kunyit (100g)' },
  { match: /lengkuas/i, min: 2000, label: 'lengkuas (100g)' },
  { match: /serai/i, min: 1500, label: 'serai (3 batang)' },
  { match: /daun\s*(salam|jeruk|pandan)/i, min: 1500, label: 'daun (1 ikat)' },
  // Sayuran
  { match: /bayam/i, min: 2000, label: 'bayam (1 ikat)' },
  { match: /kangkung/i, min: 2000, label: 'kangkung (1 ikat)' },
  { match: /wortel/i, min: 3000, label: 'wortel (1/4 kg)' },
  { match: /kol|kubis/i, min: 3000, label: 'kol (1/4 kg)' },
  { match: /tomat/i, min: 2000, label: 'tomat (3 buah)' },
  // Protein
  { match: /telur\s*ayam/i, min: 2500, label: 'telur ayam (1 butir)' },
  { match: /tahu/i, min: 2000, label: 'tahu (3 potong)' },
  { match: /tempe/i, min: 2000, label: 'tempe (1 papan kecil)' },
  // Sorgum & tepung
  { match: /tepung\s*sorgum/i, min: 8000, label: 'tepung sorgum (250g)' },
  { match: /biji\s*sorgum|beras\s*sorgum/i, min: 6000, label: 'biji sorgum (250g)' },
  // Santan & susu
  { match: /santan/i, min: 3000, label: 'santan (200ml)' },
  { match: /susu\s*(UHT|cair|segar)/i, min: 4000, label: 'susu UHT (200ml)' },
];

/** Get the realistic minimum price for an ingredient from warung lookup. */
export function getWarungFloor(name: string): number | null {
  for (const entry of WARUNG_PRICE_FLOOR) {
    if (entry.match.test(name)) return entry.min;
  }
  return null;
}

const PREMIUM_PRICE_FLOOR: Array<PremiumFloor> = [
  { match: /salmon/i, min: 8000, label: 'salmon' },
  { match: /wagyu/i, min: 15000, label: 'wagyu' },
  { match: /udang\s*jumbo|udang\s*windu|udang\s*besar/i, min: 8000, label: 'udang besar' },
  { match: /udang/i, min: 6000, label: 'udang' },
  { match: /daging\s*sapi/i, min: 6000, label: 'daging sapi' },
  { match: /ikan\s*(tenggiri|kakap|tuna|salmon)/i, min: 7000, label: 'ikan premium' },
  { match: /keju\s*(parmesan|cheddar|mozzarella)/i, min: 3000, label: 'keju' },
  { match: /alpukat/i, min: 3000, label: 'alpukat' },
  { match: /kacang\s*mete/i, min: 3000, label: 'kacang mete' },
  { match: /daging\s*(giling|sapi|cincang)/i, min: 6000, label: 'daging' },
  { match: /telur\s*(ayam\s*kampung|kampung)/i, min: 2500, label: 'telur kampung' },
  { match: /ayam\s*(utuh|fillet|dada|paha)/i, min: 5000, label: 'ayam' },
];

/** Look up the realistic minimum price for an ingredient name, or null if it's a normal (cheap) ingredient. */
export function getPremiumFloor(name: string): { min: number; label: string } | null {
  for (const floor of PREMIUM_PRICE_FLOOR) {
    if (floor.match.test(name)) return { min: floor.min, label: floor.label };
  }
  return null;
}

/** Pairs of flavours that clash and should trigger a warning (not an error). */
const CONFLICTING_PAIRS: Array<{ a: RegExp; b: RegExp; reason: string }> = [
  { a: /madu/i, b: /santan|kelapa\s*parut|kelapa\s*kering|air\s*kelapa/i, reason: 'madu + santan/kelapa' }, // Safe kelapa check
  { a: /madu/i, b: /cabai|sambal|pedas/i, reason: 'madu + pedas' },
  { a: /madu/i, b: /terasi|petis|belacan/i, reason: 'madu + terasi/petis' },
  { a: /madu/i, b: /cuka|asam/i, reason: 'madu + cuka' },
  { a: /madu/i, b: /kecap\s*asin|asin/i, reason: 'madu + kecap asin' },
  { a: /madu/i, b: /jengkol/i, reason: 'madu + jengkol' },
  { a: /madu/i, b: /kopi|bubuk\s*kopi/i, reason: 'madu + kopi' },
  { a: /durian/i, b: /madu/i, reason: 'durian + madu' }, // Added durian + madu
  { a: /durian/i, b: /terasi|petis|ikan\s*asin/i, reason: 'durian + terasi/petis' },
  { a: /durian/i, b: /bawang|kecap|garam|merica/i, reason: 'durian + bumbu masakan gurih' }, // Durian in savory food
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

/** Apply a realistic minimum price to each ingredient and re-sum the cost. */
export function realisticCost(ingredients: Array<{ name?: string; estimatedPrice?: number }>): number {
  let total = 0;
  for (const ing of ingredients) {
    const name = ing.name || '';
    let price = Number(ing.estimatedPrice) || 0;
    // 1. Check warung lookup table (highest priority)
    const warungPrice = getWarungFloor(name);
    if (warungPrice !== null && price < warungPrice) {
      price = warungPrice;
    } else if (price < GLOBAL_MINIMUM_PRICE) {
      // 2. Fallback to global minimum for unknown ingredients
      price = GLOBAL_MINIMUM_PRICE;
    }
    // 3. Apply premium floor for expensive ingredients
    for (const floor of PREMIUM_PRICE_FLOOR) {
      if (floor.match.test(name) && price < floor.min) {
        price = floor.min;
        break;
      }
    }
    total += price;
  }
  return total;
}

/**
 * Validate a parsed LLM recipe and return issues + a repaired recipe object.
 * Repairs:
 *  - estimatedCost is forced to equal the (floor-corrected) sum of ingredients
 *    when the LLM faked a lower number to fit the budget.
 */
export function validateRecipe(
  parsed: Record<string, any>,
  requestedBudget?: number
): { issues: RecipeIssue[]; repaired: Record<string, any> } {
  const issues: RecipeIssue[] = [];
  const repaired: Record<string, any> = { ...parsed };

  const ingredients: Array<{ name?: string; estimatedPrice?: number }> = Array.isArray(parsed.ingredients)
    ? parsed.ingredients
    : [];
  const names = ingredients.map((i) => (i.name || '').toString());

  // 1) Conflict detection
  const conflicts = detectIngredientConflicts(names);
  for (const c of conflicts) {
    issues.push({
      level: 'warning',
      message: `Kombinasi bahan tidak lazim (${c}) — hasil mungkin terasa aneh.`,
    });
  }

  // 2) Price integrity
  const rawSum = ingredients.reduce((s, i) => s + (Number(i.estimatedPrice) || 0), 0);
  const honestSum = realisticCost(ingredients);
  const declared = Number(parsed.estimatedCost);

  if (Number.isFinite(declared) && rawSum > 0) {
    // declared cost materially lower than the actual ingredient sum -> LLM faked it
    if (declared < rawSum - rawSum * 0.1) {
      issues.push({
        level: 'error',
        message: 'Estimasi biaya AI tidak konsisten dengan harga bahan — dikoreksi ke total bahan sebenarnya.',
      });
    }
  }

  // 3) Budget feasibility
  if (requestedBudget != null && honestSum > requestedBudget) {
    issues.push({
      level: 'error',
      message: `Total bahan (Rp ${honestSum.toLocaleString('id-ID')}) melebihi budget Rp ${requestedBudget.toLocaleString('id-ID')}.`,
    });
  }

  // Repair: force estimatedCost = honest ingredient sum
  if (ingredients.length > 0) {
    repaired.estimatedCost = honestSum;
    repaired.targetBudget = requestedBudget ?? parsed.targetBudget;
  }

  return { issues, repaired };
}
