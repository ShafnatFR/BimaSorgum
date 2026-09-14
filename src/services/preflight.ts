/**
 * preflight — analyze a recipe request BEFORE the AI generates anything.
 *
 * Goal: catch illogical ingredient combos and unrealistic price/budget
 * requests up front, so the UI can route the user to a warning screen
 * (remove flagged ingredients / raise the budget) instead of showing a
 * recipe with red guard badges (which made the AI look like it was
 * hallucinating).
 */
import { detectIngredientConflicts, getPremiumFloor } from './recipeGuard';

export interface IngredientIssue {
  /** ingredient text as written by the user */
  name: string;
  /** 'conflict' = illogical pairing, 'price' = premium ingredient likely over budget */
  kind: 'conflict' | 'price';
  /** human-readable reason */
  reason: string;
  /** realistic minimum price when kind === 'price' (IDR), else 0 */
  minPrice: number;
}

export interface PreflightResult {
  ok: boolean;
  ingredients: string[];
  budget: number | null;
  conflicts: string[];
  issues: IngredientIssue[];
  /** total realistic minimum cost of premium ingredients (IDR) */
  estimatedFloor: number;
}

/** A small lexicon of common Indonesian ingredient words + premium markers. */
const INGREDIENT_WORDS = [
  'madu', 'santan', 'cabai', 'cabe', 'terasi', 'petis', 'belacan', 'durian', 'kopi',
  'kecap asin', 'kecap', 'cuka', 'asam', 'jengkol', 'sambal', 'pedas',
  'daging sapi', 'wagyu', 'salmon', 'udang', 'ayam', 'telur', 'keju', 'alpukat',
  'kacang mete', 'mete', 'ikan', 'tenggiri', 'kakap', 'tuna', 'bawang', 'sorgum',
  'tepung sorgum', 'nasi sorgum', 'tempe', 'tahu', 'sayur', 'bayam', 'wortel', 'kangkung',
];

function extractIngredients(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const found = new Set<string>();
  for (const w of INGREDIENT_WORDS) {
    if (lower.includes(w)) found.add(w);
  }
  // Also catch "madu dengan santan" style explicit mentions not in lexicon.
  return Array.from(found);
}

function extractBudget(prompt: string): number | null {
  // Match "budget 20000", "20 ribu", "Rp 20.000", "20000"
  const m = prompt.match(/budget\s*(?:rp\s*)?([0-9][0-9.,]*)\s*(ribu)?/i) ||
            prompt.match(/rp\s*([0-9][0-9.,]*)\s*(ribu)?/i) ||
            prompt.match(/([0-9]{4,6})\s*(ribu)?/i);
  if (!m) return null;
  let val = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
  if (m[2]) val *= 1000;
  return Number.isFinite(val) && val > 0 ? Math.round(val) : null;
}

export function preflightPrompt(prompt: string): PreflightResult {
  const ingredients = extractIngredients(prompt);
  const budget = extractBudget(prompt);
  const joined = ingredients.join(' ');
  const conflicts = detectIngredientConflicts(ingredients);

  const issues: IngredientIssue[] = [];
  let estimatedFloor = 0;

  // Flag each premium ingredient whose floor price is known.
  for (const ing of ingredients) {
    const floor = getPremiumFloor(ing);
    if (floor) {
      estimatedFloor += floor.min;
    }
  }

  // Illogical pairings -> conflict issues.
  for (const c of conflicts) {
    // c looks like "madu + santan"; split into the two ingredients involved.
    const parts = c.split('+').map((s) => s.trim());
    for (const p of parts) {
      if (ingredients.some((i) => i === p) && !issues.some((iss) => iss.name === p && iss.kind === 'conflict')) {
        issues.push({ name: p, kind: 'conflict', reason: c, minPrice: 0 });
      }
    }
  }

  // If a budget is present and the premium floor already exceeds it, flag price issues.
  if (budget != null && estimatedFloor > budget) {
    for (const ing of ingredients) {
      const floor = getPremiumFloor(ing);
      if (floor && !issues.some((iss) => iss.name === ing && iss.kind === 'price')) {
        issues.push({
          name: ing,
          kind: 'price',
          reason: `harga wajar ${ing} ±Rp ${floor.min.toLocaleString('id-ID')}`,
          minPrice: floor.min,
        });
      }
    }
  }

  return {
    ok: issues.length === 0,
    ingredients,
    budget,
    conflicts,
    issues,
    estimatedFloor,
  };
}
