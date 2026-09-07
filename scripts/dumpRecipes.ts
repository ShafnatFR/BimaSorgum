/* eslint-disable */
// Generates a JSON dump of every system Recipe from the TS source modules.
// Run: npx tsx scripts/dumpRecipes.ts > recipes.dump.json
import { INITIAL_FEATURED_RECIPE, INITIAL_SAVED_RECIPES } from '../src/data/mockData';
import { EXPLORE_RECIPES_DATABASE } from '../src/data/exploreRecipesData';

const out: any[] = [];
const seen = new Map<string, any>();

function push(r: any, isSaved: boolean, savedAt?: string) {
  if (!r) return;
  const key = r.slug || r.id;
  if (seen.has(key)) return;
  seen.set(key, r);
  out.push({ recipe: r, isSaved, savedAt });
}

// 1. Featured + saved (mockData) - marked as pre-saved demo
push(INITIAL_FEATURED_RECIPE, true, '2026-08-26T10:42:00Z');
INITIAL_SAVED_RECIPES.forEach((s) => push(s.recipe, s.isFavorite ?? false, s.savedAt));

// 2. Explore database (includes the 3 saved + featured + all others)
EXPLORE_RECIPES_DATABASE.forEach((r) => push(r, false));

console.log(JSON.stringify(out, null, 1));
