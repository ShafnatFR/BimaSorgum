/**
 * Unit checks for validateRecipe budget semantics (per-portion budget vs total cost).
 * Run: npx tsx tools/wizard-healthcheck/check-guard.ts
 */
import { validateRecipe } from '../../src/services/recipeGuard';

const ings = (prices: number[]) => prices.map((p, i) => ({ name: `bahan ${i}`, estimatedPrice: p }));
let fails = 0;
function expect(name: string, cond: boolean, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  if (!cond) fails++;
}

// A) total 46.350 for 10 portions (4.635/portion) vs budget 15.000/portion -> must NOT error
{
  const parsed = { servings: 10, estimatedCost: 46350, ingredients: ings([6000, 35000, 1500, 1500, 2350]) };
  const { issues } = validateRecipe(parsed, 15000);
  const errs = issues.filter(i => i.level === 'error');
  expect('A: total > budget tapi biaya/porsi di bawah budget → lolos', errs.length === 0, JSON.stringify(errs.map(e => e.message)));
}
// B) 1 portion costing 30.000 vs budget 15.000 -> MUST error
{
  const parsed = { servings: 1, estimatedCost: 30000, ingredients: ings([20000, 10000]) };
  const { issues } = validateRecipe(parsed, 15000);
  expect('B: biaya/porsi melebihi budget → error', issues.some(i => i.level === 'error'), JSON.stringify(issues.map(i => i.message)));
}
// C) budget 0 (chat mode, tanpa override) -> MUST NOT error
{
  const parsed = { servings: 4, estimatedCost: 20000, ingredients: ings([10000, 10000]) };
  const { issues } = validateRecipe(parsed, 0);
  expect('C: budget 0 = tanpa batas → tidak error', !issues.some(i => i.level === 'error'), JSON.stringify(issues.map(i => i.message)));
}
// D) declared cost jauh lebih rendah dari harga bahan, tapi per porsi masih di bawah budget -> warning saja
{
  const parsed = { servings: 4, estimatedCost: 2000, ingredients: ings([8000, 8000]) };
  const { issues } = validateRecipe(parsed, 25000);
  expect('D: estimatedCost dipalsukan tapi per porsi masih aman → warning, bukan error',
    issues.some(i => i.level === 'warning') && !issues.some(i => i.level === 'error'), JSON.stringify(issues.map(i => i.message)));
}
// E) repair: estimatedCost = jumlah harga bahan, targetBudget = budget
{
  const parsed = { servings: 2, estimatedCost: 1000, ingredients: ings([6000, 6000]) };
  const { repaired } = validateRecipe(parsed, 25000);
  expect('E: repair menyamakan estimatedCost dengan total bahan', repaired.estimatedCost === 12000, String(repaired.estimatedCost));
}
// F) harga receh dinaikkan ke floor warung
{
  const parsed = { servings: 2, estimatedCost: 4, ingredients: [{ name: 'Biji Sorgum (200 gram)', estimatedPrice: 2 }, { name: 'Garam Halus', estimatedPrice: 2 }] };
  const { repaired } = validateRecipe(parsed, 25000);
  expect('F: floor warung diterapkan (biji sorgum >= 6000, garam >= 2000)',
    repaired.ingredients[0].estimatedPrice >= 6000 && repaired.ingredients[1].estimatedPrice >= 2000,
    JSON.stringify(repaired.ingredients.map((i: any) => i.estimatedPrice)));
}

console.log(fails === 0 ? '\nALL GUARD CHECKS PASS' : `\n${fails} CHECK(S) FAILED`);
process.exitCode = fails === 0 ? 0 : 1;
