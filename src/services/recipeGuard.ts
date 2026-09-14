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
  { a: /madu/i, b: /santan|kelapa/i, reason: 'madu + santan' },
  { a: /madu/i, b: /cabai|sambal|pedas/i, reason: 'madu + pedas' },
  { a: /madu/i, b: /terasi|petis|belacan/i, reason: 'madu + terasi/petis' },
  { a: /madu/i, b: /cuka|asam/i, reason: 'madu + cuka' },
  { a: /madu/i, b: /kecap\s*asin|asin/i, reason: 'madu + kecap asin' },
  { a: /madu/i, b: /jengkol/i, reason: 'madu + jengkol' },
  { a: /madu/i, b: /kopi|bubuk\s*kopi/i, reason: 'madu + kopi' },
  { a: /durian/i, b: /terasi|petis|ikan\s*asin/i, reason: 'durian + terasi/petis' },
  { a: /saus\s*sambal|sambal/i, b: /dessert|puding|es\s*krim|manis/i, reason: 'pedas + dessert' },
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
