import { WizardFormData, Recipe, RecipeIngredient, RecipeStep, AiRefusalResponse, RecipeSuggestion } from '../types';
import { INITIAL_FEATURED_RECIPE } from '../data/mockData';
import { FOOD_IMAGES, getRecipeImage } from '../data/imageAssets';
import { slugify } from '../utils/slugify';
import { bimaChat, extractJsonFromLlm } from './bimaClient';
import { validateRecipe } from './recipeGuard';

/** Build a complete Recipe directly from a RecipeSuggestion — no AI call needed.
 *  Guarantees consistency: what the user sees in the card = what they get. */
export function buildRecipeFromSuggestion(suggestion: RecipeSuggestion, formData: WizardFormData): Recipe {
  const title = suggestion.title;
  const categoryMap: Record<string, string> = {
    makanan_berat: 'Makanan Berat',
    camilan_sehat: 'Camilan Sehat',
    minuman_nutrisi: 'Minuman Nutrisi',
    dessert_rendah_gi: 'Dessert Rendah GI',
  };
  const dishCategory = categoryMap[formData.dishCategory] || 'Makanan Sehat';
  const targetLabel = formData.targetConsumers.includes('anak_sekolah')
    ? 'Anak Sekolah (6-12 thn)'
    : formData.targetConsumers.includes('balita')
    ? 'Balita (1-5 thn)'
    : formData.targetConsumers.includes('lansia')
    ? 'Lansia'
    : 'Remaja & Dewasa';

  // Parse ingredientPrices into RecipeIngredient[] with matching names + prices.
  // Handle composite entries like "Bumbu Lain: Rp500" — that's a TOTAL for multiple items.
  const ingredients: RecipeIngredient[] = [];
  let matchedTotal = 0;
  const unmatchedIndices: number[] = [];

  // Detect composite/catch-all price entries (e.g. "Bumbu Lain", "Bumbu lainnya")
  const compositePatterns = /^(bumbu\s*lain|bumbu\s*lainnya|lainnya|lain|bumbu\s*campur)/i;

  // First pass: match ingredients to specific price entries only
  for (let idx = 0; idx < suggestion.ingredients.length; idx++) {
    const ing = suggestion.ingredients[idx];
    let price = 0;
    const firstWord = ing.toLowerCase().split(' ')[0].split('(')[0];

    // Try to find a matching price entry that is NOT a composite/catch-all
    const priceEntry = suggestion.ingredientPrices?.find(ip => {
      const entryName = ip.split(':')[0].trim().toLowerCase();
      // Skip composite entries in first pass
      if (compositePatterns.test(entryName)) return false;
      return entryName.startsWith(firstWord) || firstWord.startsWith(entryName.split(' ')[0]);
    });

    if (priceEntry) {
      const m = priceEntry.match(/rp\s*([\d.]+)/i);
      if (m) price = parseInt(m[1].replace(/\./g, ''), 10) || 0;
    }

    if (price > 0) {
      matchedTotal += price;
      ingredients.push({ name: ing, amount: '', estimatedPrice: price });
    } else {
      ingredients.push({ name: ing, amount: '', estimatedPrice: 0 });
      unmatchedIndices.push(idx);
    }
  }

  // Second pass: distribute remaining budget evenly among unmatched ingredients
  const remainingBudget = Math.max(0, suggestion.estimatedCost - matchedTotal);
  if (unmatchedIndices.length > 0 && remainingBudget > 0) {
    const perUnmatched = Math.round(remainingBudget / unmatchedIndices.length);
    for (const idx of unmatchedIndices) {
      ingredients[idx].estimatedPrice = perUnmatched;
    }
  } else if (unmatchedIndices.length > 0) {
    // No remaining budget — assign minimal price
    for (const idx of unmatchedIndices) {
      ingredients[idx].estimatedPrice = 100;
    }
  }

  // Reconcile total cost — if individual prices exceed the suggestion total,
  // scale proportionally to match the stated estimatedCost
  const ingredientSum = ingredients.reduce((s, i) => s + i.estimatedPrice, 0);
  let estimatedCost = ingredientSum > 0 ? ingredientSum : suggestion.estimatedCost;
  if (ingredientSum > suggestion.estimatedCost && suggestion.estimatedCost > 0) {
    const scale = suggestion.estimatedCost / ingredientSum;
    for (const ing of ingredients) {
      ing.estimatedPrice = Math.round(ing.estimatedPrice * scale / 100) * 100; // round to nearest 100
    }
    // Fix rounding drift: adjust the most expensive ingredient to hit exact total
    const newSum = ingredients.reduce((s, i) => s + i.estimatedPrice, 0);
    const drift = newSum - suggestion.estimatedCost;
    if (drift !== 0) {
      const mostExpensive = ingredients.reduce((max, i) => i.estimatedPrice > max.estimatedPrice ? i : max, ingredients[0]);
      mostExpensive.estimatedPrice = Math.max(100, mostExpensive.estimatedPrice - drift);
    }
    estimatedCost = ingredients.reduce((s, i) => s + i.estimatedPrice, 0);
  }

  // Generate basic cooking steps based on category
  const steps: RecipeStep[] = generateSuggestionSteps(title, formData.dishCategory, ingredients);

  // Nutrition based on category
  const nutritionMap: Record<string, { title: string; description: string; fiberGrams: number; proteinGrams: number; glycemicIndex: 'Rendah (Low GI)' | 'Sedang' | 'Sangat Rendah'; caloriesEstimate: number }> = {
    makanan_berat: { title: 'Nutrisi Lengkap', description: 'Kaya serat dan protein nabati, cocok untuk anak sekolah dan lansia.', fiberGrams: 8, proteinGrams: 10, glycemicIndex: 'Rendah (Low GI)', caloriesEstimate: 280 },
    camilan_sehat: { title: 'Camilan Bergizi', description: 'Rendah gula, tinggi serat, cocok untuk camilan sehat.', fiberGrams: 6, proteinGrams: 5, glycemicIndex: 'Rendah (Low GI)', caloriesEstimate: 180 },
    minuman_nutrisi: { title: 'Minuman Sehat', description: 'Kaya mineral dan vitamin, menyegarkan tanpa gula berlebih.', fiberGrams: 4, proteinGrams: 4, glycemicIndex: 'Rendah (Low GI)', caloriesEstimate: 150 },
    dessert_rendah_gi: { title: 'Dessert Rendah GI', description: 'Manis alami dengan indeks glikemik rendah, aman untuk gula darah.', fiberGrams: 5, proteinGrams: 4, glycemicIndex: 'Rendah (Low GI)', caloriesEstimate: 160 },
  };
  const nutrition = nutritionMap[formData.dishCategory] || nutritionMap.makanan_berat;

  return {
    id: `recipe-suggestion-${Date.now()}`,
    slug: slugify(title),
    title,
    subtitle: suggestion.description || `Resep ${dishCategory} berbasis sorgum yang sehat dan lezat.`,
    targetAge: targetLabel,
    dishCategory,
    targetBudget: formData.budgetPerPortion,
    estimatedCost,
    prepTimeMinutes: Math.round((suggestion.estimatedTimeMinutes || 20) * 0.4),
    cookTimeMinutes: Math.round((suggestion.estimatedTimeMinutes || 20) * 0.6),
    servings: 1,
    ingredients,
    nutritionHighlight: nutrition,
    steps,
    imageUrl: getRecipeImage(title, formData.dishCategory),
    tags: ['Bebas Gluten', 'Sorgum Sehat', dishCategory],
    createdAt: new Date().toISOString(),
  };
}

/** Generate basic cooking steps for a suggestion-based recipe. */
function generateSuggestionSteps(_title: string, category: string, ingredients: RecipeIngredient[]): RecipeStep[] {
  const mainIng = ingredients.map(i => i.name).join(', ');
  const minutes = category === 'minuman_nutrisi' ? 5 : category === 'camilan_sehat' ? 20 : 25;

  if (category === 'minuman_nutrisi') {
    return [
      { stepNumber: 1, title: 'Siapkan Bahan', instruction: `Siapkan ${mainIng}.`, timerMinutes: 2 },
      { stepNumber: 2, title: 'Blender / Aduk', instruction: 'Campurkan semua bahan ke dalam blender atau gelas. Aduk/blender hingga rata dan halus.', timerMinutes: 2 },
      { stepNumber: 3, title: 'Sajikan', instruction: 'Tuang ke gelas, tambahkan es batu jika dinginkan. Sajikan segera.', timerMinutes: 1 },
    ];
  }

  if (category === 'dessert_rendah_gi') {
    return [
      { stepNumber: 1, title: 'Siapkan Bahan', instruction: `Siapkan ${mainIng}. Larutkan tepung sorgum dengan sedikit air jika menggunakan tepung.`, timerMinutes: 5 },
      { stepNumber: 2, title: 'Masak Adonan', instruction: 'Masak bahan utama dengan api kecil sambil diaduk terus hingga mengental dan matang merata.', timerMinutes: Math.round(minutes * 0.5) },
      { stepNumber: 3, title: 'Dinginkan & Sajikan', instruction: 'Tuang ke cetakan atau mangkuk. Dinginkan di kulkas sebelum disajikan.', timerMinutes: Math.round(minutes * 0.2) },
    ];
  }

  // Default: makanan_berat / camilan_sehat
  return [
    { stepNumber: 1, title: 'Siapkan Bahan', instruction: `Siapkan ${mainIng}. Cuci bersih dan potong sesuai kebutuhan.`, timerMinutes: 5 },
    { stepNumber: 2, title: 'Tumis Bumbu', instruction: 'Panaskan minyak, tumis bawang hingga harum.', timerMinutes: 3 },
    { stepNumber: 3, title: 'Masak Bahan Utama', instruction: 'Masukkan bahan utama, aduk rata. Tambahkan sedikit air jika perlu, masak hingga matang.', timerMinutes: Math.round(minutes * 0.5) },
    { stepNumber: 4, title: 'Bumbui & Sajikan', instruction: 'Tambahkan garam dan bumbu sesuai selera. Aduk rata, koreksi rasa. Sajikan hangat.', timerMinutes: 2 },
  ];
}

/** Build a Recipe object from a parsed LLM JSON, tolerating missing fields. */
function recipeFromLlmJson(parsed: Record<string, any>, fallbackBudget: number, fallbackCategory: string): Recipe {
  const title = parsed.title || 'Resep Sorgum Spesial';
  return {
    id: `recipe-ai-${Date.now()}`,
    slug: slugify(title),
    title,
    subtitle: parsed.subtitle || 'Resep sehat terpersonalisasi oleh SorghumCare AI',
    targetAge: parsed.targetAge || 'Semua Umur',
    dishCategory: parsed.dishCategory || fallbackCategory,
    targetBudget: parsed.targetBudget ?? fallbackBudget,
    estimatedCost: parsed.estimatedCost ?? Math.min(fallbackBudget, 9500),
    prepTimeMinutes: parsed.prepTimeMinutes ?? 10,
    cookTimeMinutes: parsed.cookTimeMinutes ?? 15,
    servings: parsed.servings ?? 1,
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    nutritionHighlight: parsed.nutritionHighlight || {
      title: 'Nutrisi Unggulan',
      description: 'Tinggi serat dan gizi, bebas gluten.',
    },
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    imageUrl: getRecipeImage(title, parsed.dishCategory || fallbackCategory),
    tags: Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags : ['Bebas Gluten', 'Sorgum Sehat'],
    createdAt: new Date().toISOString(),
  };
}

const RECIPE_JSON_SCHEMA = `{
  "title": "string",
  "subtitle": "string",
  "targetAge": "string",
  "dishCategory": "string",
  "targetBudget": number,
  "estimatedCost": number,
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "servings": number,
  "ingredients": [{"name": "string", "amount": "string", "estimatedPrice": number}],
  "nutritionHighlight": {"title": "string", "description": "string", "fiberGrams": number, "proteinGrams": number, "glycemicIndex": "string", "caloriesEstimate": number},
  "steps": [{"stepNumber": number, "title": "string", "instruction": "string", "timerMinutes": number}],
  "tags": ["string"]
}`;

const UNPAYLOAD_JSON_SCHEMA = `{
  "status": "unpayload",
  "message": "Penjelasan DETAIL (Gunakan Markdown: tabel harga, list alasan) mengapa resep ditolak (kombinasi aneh / budget kurang).",
  "flaggedIngredients": ["bahan bermasalah"],
  "suggestions": [
    {
      "title": "Judul Resep Alternatif",
      "ingredients": ["bahan A", "bahan B"],
      "estimatedCost": 8500,
      "description": "Deskripsi singkat alasan ini lebih baik",
      "ingredientPrices": ["Bahan A: Rp2.500", "Bahan B: Rp6.000"],
      "estimatedTimeMinutes": 25,
      "removedIngredients": ["bahan aneh dari input"]
    }
  ]
}`;

const PROMPT_RULES = `### ATURAN VALIDASI (WAJIB DIIKUTI)
1. KELAYAKAN RESEP: Jika kombinasi bahan tidak lazim / tidak enak (mis. durian dicampur petis), JANGAN paksa membuat resep. TOLAK permintaan dengan format UNPAYLOAD.
2. KELAYAKAN BUDGET: Jika budget terlalu rendah untuk bahan yang diminta (mis. budget Rp5.000 tapi minta salmon), TOLAK permintaan dengan format UNPAYLOAD.
3. HARGA REALISTIS: Harga bahan (\`estimatedPrice\`) HARUS wajar sesuai harga pasar Indonesia 2026. DILARANG menurunkan harga fiktif hanya agar muat di budget.
4. KALKULASI: \`estimatedCost\` HARUS SAMA dengan total seluruh \`estimatedPrice\`.

### FORMAT OUTPUT
Anda WAJIB memberikan satu buah JSON murni (tanpa markdown \`\`\` block).
Pilih SALAH SATU struktur JSON berikut:

JIKA RESEP DITERIMA (Valid):
${RECIPE_JSON_SCHEMA}

JIKA RESEP DITOLAK (Melanggar aturan 1 atau 2):
${UNPAYLOAD_JSON_SCHEMA}`;

/** One attempt at calling the LLM. Returns parsed JSON, or a refusal marker with the raw text. */
async function tryGenerate(prompt: string): Promise<Record<string, any> | { __refusal: true; message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] } | null> {
  const result = await bimaChat(prompt, [], { useRag: false, stream: false }); // RAG dimatikan, dan non-stream agar Backend Guard dapat berjalan
  if (!result || !result.response) return null;
  const responseText = result.response;

  const parsed = extractJsonFromLlm(responseText); // 🔧 sekarang ada auto-repair truncated JSON
  if (parsed) {
    const status = String((parsed as any).status || '').toLowerCase();
    // 🔧 Detect structured unpayload response from the new prompt format
    if (status === 'unpayload' || status === 'ditolak' || status === 'rejected' || status === 'refused') {
      const msg = (parsed as any).message || (parsed as any).subtitle || '';
      const suggestions = Array.isArray((parsed as any).suggestions)
        ? (parsed as any).suggestions.map((s: any) => ({
            title: s.title || '',
            ingredients: Array.isArray(s.ingredients) ? s.ingredients : [],
            estimatedCost: Number(s.estimatedCost) || 0,
            description: s.description || '',
            ingredientPrices: Array.isArray(s.ingredientPrices) ? s.ingredientPrices : undefined,
            estimatedTimeMinutes: Number(s.estimatedTimeMinutes) || undefined,
            removedIngredients: Array.isArray(s.removedIngredients) ? s.removedIngredients : undefined,
          }))
        : [];
      const flaggedIngredients = Array.isArray((parsed as any).flaggedIngredients)
        ? (parsed as any).flaggedIngredients
        : [];
      if (msg) return { __refusal: true, message: msg, suggestions, flaggedIngredients };
    }
    return parsed;
  }

  // LLM declined with a prose explanation instead of JSON — surface it.
  const msg = responseText.trim();
  if (msg) {
    const looksLikeJson = /^\s*[\[{]/.test(msg) || /```json|"estimatedPrice"|"ingredients"|"metadata"/.test(msg);
    if (looksLikeJson) return null;
    return { __refusal: true, message: msg };
  }
  return null;
}

/** Call the LLM up to 2 times; retries once on empty/bad JSON. */
async function generateWithRetry(prompt: string): Promise<Record<string, any> | { __refusal: true; message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const parsed = await tryGenerate(prompt);
      if (parsed) return parsed;
    } catch (err) {
      console.warn(`BIMA AI attempt ${attempt + 1} failed:`, err);
    }
  }
  return null;
}

/** Helper: build an AiRefusalResponse from a refusal result. 
 *  When the AI provides no suggestions, falls back to local recipe suggestions. */
function buildRefusalResponse(
  result: { message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] },
  formData?: { dishCategory: string; budgetPerPortion: number }
): AiRefusalResponse {
  const filtered = (result.suggestions || []).filter(s => s.title && s.ingredients.length > 0);
  // If AI gave no suggestions and we have form context, use local fallback
  const suggestions = filtered.length > 0
    ? filtered
    : formData ? buildLocalSuggestions(formData.dishCategory, formData.budgetPerPortion) : [];
  return {
    type: 'refusal',
    message: result.message,
    flaggedIngredients: result.flaggedIngredients || [],
    suggestions,
  };
}

/**
 * Generate sensible local recipe suggestions when the AI's recipe is rejected by the guard.
 * These are realistic recipes that actually fit the budget, based on the dish category.
 */
function buildLocalSuggestions(dishCategory: string, budget: number): RecipeSuggestion[] {
  const pool: Record<string, RecipeSuggestion[]> = {
    makanan_berat: [
      {
        title: 'Bubur Sorgum Sayur Bayam',
        ingredients: ['Biji sorgum (100g)', 'Bayam segar', 'Bawang merah & putih', 'Garam', 'Minyak kelapa'],
        estimatedCost: 6500,
        description: 'Bubur hangat kaya serat dengan sayuran segar, cocok untuk semua umur.',
        ingredientPrices: ['Biji sorgum 100g: Rp2.500', 'Bayam segar: Rp1.500', 'Bawang merah & putih: Rp1.000', 'Garam: Rp200', 'Minyak kelapa: Rp1.300'],
        estimatedTimeMinutes: 30,
        removedIngredients: ['Dada ayam', 'Telur', 'Santan kelapa'],
      },
      {
        title: 'Nasi Sorgum Tahu Tempe',
        ingredients: ['Beras sorgum (150g)', 'Tahu goreng', 'Tempe goreng', 'Bawang putih', 'Kecap'],
        estimatedCost: 8000,
        description: 'Nasi sorgum gurih lauk tahu tempe — protein nabati lengkap.',
        ingredientPrices: ['Beras sorgum 150g: Rp3.500', 'Tahu goreng: Rp2.000', 'Tempe goreng: Rp1.500', 'Bawang putih: Rp500', 'Kecap: Rp500'],
        estimatedTimeMinutes: 25,
        removedIngredients: ['Daging ayam', 'Sayuran hijau premium'],
      },
      {
        title: 'Sorgum Bihun Goreng Sayur',
        ingredients: ['Biji sorgum rebus', 'Wortel', 'Kol', 'Bawang merah', 'Garam', 'Minyak goreng'],
        estimatedCost: 6000,
        description: 'Gorengan sorgum dengan sayuran renyah, praktis dan bergizi.',
        ingredientPrices: ['Biji sorgum: Rp2.000', 'Wortel: Rp1.500', 'Kol: Rp1.000', 'Bawang merah: Rp500', 'Garam: Rp200', 'Minyak goreng: Rp800'],
        estimatedTimeMinutes: 20,
        removedIngredients: ['Protein hewani', 'Santan'],
      },
    ],
    camilan_sehat: [
      {
        title: 'Cookies Sorgum Cokelat',
        ingredients: ['Tepung sorgum (120g)', 'Gula kelapa', 'Minyak kelapa', 'Bubuk kakao'],
        estimatedCost: 7500,
        description: 'Kudapan renyah tanpa terigu, manis alami dari gula kelapa.',
        ingredientPrices: ['Tepung sorgum 120g: Rp3.000', 'Gula kelapa: Rp1.500', 'Minyak kelapa: Rp1.500', 'Bubuk kakao: Rp1.500'],
        estimatedTimeMinutes: 30,
        removedIngredients: ['Tepung terigu', 'Mentega'],
      },
      {
        title: 'Lempeng Sorgum Original',
        ingredients: ['Tepung sorgum (100g)', 'Garam', 'Air', 'Minyak goreng'],
        estimatedCost: 4500,
        description: 'Kerupuk sorgum renyah klasik, camilan sehat tanpa MSG.',
        ingredientPrices: ['Tepung sorgum 100g: Rp2.500', 'Garam: Rp200', 'Air: Rp0', 'Minyak goreng: Rp1.800'],
        estimatedTimeMinutes: 15,
        removedIngredients: ['Tepung terigu', 'Bahan pengawet'],
      },
      {
        title: 'Roti Sorgum Panggang',
        ingredients: ['Tepung sorgum (150g)', 'Ragi', 'Gula pasir', 'Garam', 'Minyak kelapa'],
        estimatedCost: 7000,
        description: 'Roti lembut tanpa gluten, cocok untuk sarapan sehat.',
        ingredientPrices: ['Tepung sorgum 150g: Rp3.500', 'Ragi: Rp1.000', 'Gula pasir: Rp1.000', 'Garam: Rp200', 'Minyak kelapa: Rp1.300'],
        estimatedTimeMinutes: 40,
        removedIngredients: ['Tepung gandum', 'Mentega', 'Susu'],
      },
    ],
    minuman_nutrisi: [
      {
        title: 'Susu Sorgum Kurma',
        ingredients: ['Tepung sorgum sangrai (30g)', 'Kurma (3 butir)', 'Air hangat'],
        estimatedCost: 5500,
        description: 'Minuman hangat kaya magnesium dan serat, pemanis alami dari kurma.',
        ingredientPrices: ['Tepung sorgum sangrai 30g: Rp2.000', 'Kurma 3 butir: Rp2.500', 'Air hangat: Rp0', 'Gula: Rp1.000'],
        estimatedTimeMinutes: 10,
        removedIngredients: ['Susu sapi', 'Gula pasir'],
      },
      {
        title: 'Sorgum Milkshake Vanila',
        ingredients: ['Tepung sorgum (30g)', 'Susu UHT (200ml)', 'Gula kelapa', 'Vanili'],
        estimatedCost: 7500,
        description: 'Minuman creamy segar dengan aroma vanila, tinggi kalsium.',
        ingredientPrices: ['Tepung sorgum 30g: Rp2.000', 'Susu UHT 200ml: Rp3.500', 'Gula kelapa: Rp1.000', 'Vanili: Rp1.000'],
        estimatedTimeMinutes: 10,
        removedIngredients: ['Es krim', 'Sirup buatan'],
      },
      {
        title: 'Es Sorgum Jeruk Nipis',
        ingredients: ['Air sorgum (200ml)', 'Jeruk nipis', 'Gula pasir', 'Es batu'],
        estimatedCost: 5000,
        description: 'Minuman segar dengan vitamin C, cocok untuk cuaca panas.',
        ingredientPrices: ['Air sorgum 200ml: Rp1.500', 'Jeruk nipis: Rp1.500', 'Gula pasir: Rp1.000', 'Es batu: Rp1.000'],
        estimatedTimeMinutes: 5,
        removedIngredients: ['Soda', 'Pewarna buatan'],
      },
    ],
    dessert_rendah_gi: [
      {
        title: 'Puding Sorgum Pandan',
        ingredients: ['Tepung sorgum (50g)', 'Santan (200ml)', 'Gula kelapa', 'Daun pandan'],
        estimatedCost: 7000,
        description: 'Puding lembut pewarna alami pandan, rendah gula.',
        ingredientPrices: ['Tepung sorgum 50g: Rp2.500', 'Santan 200ml: Rp3.000', 'Gula kelapa: Rp1.000', 'Daun pandan: Rp500'],
        estimatedTimeMinutes: 25,
        removedIngredients: ['Telur', 'Susu', 'Gula pasir'],
      },
      {
        title: 'Bubur Ketan Sorgum',
        ingredients: ['Biji sorgum (100g)', 'Santan kental', 'Gula merah', 'Garam', 'Daun pandan'],
        estimatedCost: 6500,
        description: 'Dessert tradisional dengan tekstur ketan dari sorgum.',
        ingredientPrices: ['Biji sorgum 100g: Rp2.000', 'Santan kental: Rp3.000', 'Gula merah: Rp1.000', 'Garam: Rp200', 'Daun pandan: Rp300'],
        estimatedTimeMinutes: 35,
        removedIngredients: ['Telur', 'Tepung terigu'],
      },
      {
        title: 'Sorgum Flan Karamel',
        ingredients: ['Tepung sorgum (40g)', 'Susu (200ml)', 'Gula pasir', 'Telur (1 butir)'],
        estimatedCost: 8500,
        description: 'Flan sutra karamel yang elegan, rendah indeks glikemik.',
        ingredientPrices: ['Tepung sorgum 40g: Rp2.000', 'Susu 200ml: Rp3.500', 'Gula pasir: Rp1.500', 'Telur 1 butir: Rp1.500'],
        estimatedTimeMinutes: 30,
        removedIngredients: ['Tepung terigu', 'Krim'],
      },
    ],
  };

  const suggestions = pool[dishCategory] || pool.makanan_berat;
  // 🔧 Show ALL suggestions regardless of budget — prices are displayed
  // so users learn realistic costs and can raise their budget accordingly.
  // The refusal message already explains the budget issue.
  return suggestions;
}

/**
 * Generate a recipe from Wizard data using the BIMA AI LLM (Living Labs).
 * Returns either a valid Recipe or an AiRefusalResponse when ingredients are nonsensical.
 * NO MORE offline fallback — if AI fails entirely, throws an error.
 */
export async function generateRecipeFromWizardAsync(formData: WizardFormData): Promise<Recipe | AiRefusalResponse> {
  const prompt = `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia.
Tugas Anda adalah merancang resep masakan sorgum yang sehat dan lezat.

### INPUT USER
- Target Konsumen: ${formData.targetConsumers.join(', ')}
- Kategori Hidangan: ${formData.dishCategory}
- Bahan Pokok: ${formData.selectedIngredientIds.concat(formData.customIngredients).join(', ')}
- Target Budget per porsi: Rp ${formData.budgetPerPortion}
- Batas Waktu Persiapan: ${formData.prepTimeLimit}

### ATURAN BAHAN
- HANYA gunakan Bahan Pokok di atas.
- DIIZINKAN menambahkan bahan dapur umum (air, garam, merica, minyak goreng, bawang).
- DILARANG menambahkan bahan khusus lainnya (mis. keju, saus tiram, madu) kecuali sudah ada di Bahan Pokok.

${PROMPT_RULES}`;

  const result = await generateWithRetry(prompt);

  // Case 1: AI returned a structured unpayload/refusal
  if (result && '__refusal' in result) {
    return buildRefusalResponse(result as { message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] }, formData);
  }

  // Case 2: Valid JSON recipe (result is Record<string, any> here)
  const parsed = result as Record<string, any> | null;
  if (parsed && parsed.title) {
    const ingredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
    if (ingredients.length === 0) {
      // Valid JSON but empty ingredients — treat as refusal with local suggestions
      return buildRefusalResponse({
        message: parsed.subtitle || 'Kombinasi bahan / budget yang diminta tidak dapat dibuat menjadi resep.',
        flaggedIngredients: [],
      }, formData);
    }
    const { issues } = validateRecipe(parsed, formData.budgetPerPortion);
    const errorIssues = issues.filter(i => i.level === 'error');

    // If guard found critical errors (price fraud, budget overrun), refuse the recipe entirely.
    // Don't show a broken recipe card with red badges — show a chat bubble instead.
    if (errorIssues.length > 0) {
      const ingredientNames = ingredients.map((i: any) => i.name || '').filter(Boolean);
      const errorDetail = errorIssues.map(i => `- ${i.message}`).join('\n');

      // Build detailed price table from the AI's ingredients
      const priceTable = ingredients
        .filter((i: any) => i.name && i.estimatedPrice > 0)
        .map((i: any) => `| ${i.name} | Rp ${Number(i.estimatedPrice).toLocaleString('id-ID')} |`)
        .join('\n');
      const priceSection = priceTable
        ? `\n\n**Rincian harga bahan yang diajukan:**\n\n| Bahan | Harga |\n|---|---|\n${priceTable}\n| **Total** | **Rp ${ingredients.reduce((s: number, i: any) => s + (Number(i.estimatedPrice) || 0), 0).toLocaleString('id-ID')}** |\n| Budget Anda | Rp ${formData.budgetPerPortion.toLocaleString('id-ID')} |`
        : '';

      return buildRefusalResponse({
        message: `**Resep tidak dapat dibuat**\n\n${errorDetail}${priceSection}\n\nSilakan pilih salah satu alternatif di bawah. Perhatikan bahwa harga alternatif mungkin lebih tinggi dari budget Anda — naikkan budget jika diperlukan:`,
        flaggedIngredients: ingredientNames.slice(0, 5),
      }, formData);
    }

    const { repaired } = validateRecipe(parsed, formData.budgetPerPortion);
    const recipe = recipeFromLlmJson(repaired, formData.budgetPerPortion, formData.dishCategory);
    return recipe;
  }

  // Case 3: AI returned nothing usable — return local suggestions as refusal (not a crash)
  return buildRefusalResponse({
    message: 'AI tidak memberikan respons yang valid. Berikut alternatif resep yang bisa Anda pilih:',
    flaggedIngredients: [],
  }, formData);
}

export function generateRecipeFromWizard(formData: WizardFormData): Recipe {
  const { targetConsumers, dishCategory, selectedIngredientIds, customIngredients, budgetPerPortion } = formData;

  const targetLabel = targetConsumers.includes('anak_sekolah')
    ? 'Anak Sekolah (6-12 thn)'
    : targetConsumers.includes('balita')
    ? 'Balita (1-5 thn)'
    : targetConsumers.includes('lansia')
    ? 'Lansia'
    : 'Remaja & Dewasa';

  // Format category name
  const categoryNames: Record<string, string> = {
    makanan_berat: 'Makanan Berat',
    camilan_sehat: 'Camilan Sehat',
    minuman_nutrisi: 'Minuman Nutrisi',
    dessert_rendah_gi: 'Dessert Rendah GI',
  };

  const categoryLabel = categoryNames[dishCategory] || 'Makanan Sehat';

  // Base ingredients builder
  const ingredients: RecipeIngredient[] = [];
  let currentCost = 0;

  if (dishCategory === 'makanan_berat') {
    if (targetConsumers.includes('anak_sekolah')) {
      return {
        ...INITIAL_FEATURED_RECIPE,
        id: `recipe-${Date.now()}`,
        imageUrl: FOOD_IMAGES.nasiGoreng,
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, 9500),
      };
    }

    if (targetConsumers.includes('balita')) {
      ingredients.push(
        { name: 'Biji sorgum giling halus (bubur)', amount: '50g', estimatedPrice: 2000 },
        { name: 'Kuning telur ayam kampung', amount: '1 butir', estimatedPrice: 2500 },
        { name: 'Wortel & bayam cincang halus', amount: '1 genggam', estimatedPrice: 1500 },
        { name: 'Kaldu ayam kampung alami', amount: '150ml', estimatedPrice: 2000 },
        { name: 'Minyak kelapa murni (EVCO)', amount: '1 sdt', estimatedPrice: 1000 }
      );
      currentCost = 9000;
      const title = 'Bubur Tim Sorgum Sayur Pelangi (MPASI)';
      return {
        id: `recipe-${Date.now()}`,
        slug: slugify(title),
        title,
        subtitle: 'Tekstur super lembut, kaya zat besi dan prebiotik alami untuk tumbuh kembang optimal balita:',
        targetAge: 'Balita (1-5 thn)',
        dishCategory: 'Makanan Berat',
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, currentCost),
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 1,
        ingredients,
        nutritionHighlight: {
          title: 'Nutrisi Unggulan',
          description: 'Kaya asam folat, zat besi, dan bebas gluten, sangat lembut untuk lambung si kecil.',
          fiberGrams: 5.0,
          proteinGrams: 8.0,
          glycemicIndex: 'Rendah (Low GI)',
          caloriesEstimate: 220,
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Rebus Sorgum',
            instruction: 'Rebus tepung/biji sorgum giling dengan kaldu ayam sambil diaduk hingga mengental menjadi bubur lembut.',
            timerMinutes: 12,
          },
          {
            stepNumber: 2,
            title: 'Masukkan Sayur & Telur',
            instruction: 'Masukkan cincangan wortel halus dan bayam, lalu masukkan kuning telur. Aduk cepat hingga matang sempurna.',
            timerMinutes: 5,
          },
          {
            stepNumber: 3,
            title: 'Tambahkan Lemak Tambahan',
            instruction: 'Matikan api, campurkan 1 sdt minyak kelapa murni sebagai lemak tambahan bergizi. Sajikan hangat.',
            timerMinutes: 1,
          },
        ],
        imageUrl: FOOD_IMAGES.mpasiPorridge,
        tags: ['MPASI Sehat', 'Bebas Gluten', 'Mudah Dicerna', 'Zat Besi Alami'],
        createdAt: new Date().toISOString(),
      };
    }

    if (targetConsumers.includes('lansia')) {
      ingredients.push(
        { name: 'Nasi sorgum empuk kukus', amount: '1 mangkok kecil (100g)', estimatedPrice: 2500 },
        { name: 'Sup bayam jagung bening', amount: '1 mangkuk', estimatedPrice: 2500 },
        { name: 'Tahu / tempe kukus bumbu kuning', amount: '2 potong', estimatedPrice: 2000 },
        { name: 'Ikan suwir / telur rebus', amount: '40g', estimatedPrice: 2500 }
      );
      currentCost = 9500;
      const title = 'Nasi Sorgum Gurih dengan Sayur Bening & Protein';
      return {
        id: `recipe-${Date.now()}`,
        slug: slugify(title),
        title,
        subtitle: 'Menu ramah gula darah, mudah dikunyah dan kaya antioksidan polifenol:',
        targetAge: 'Lansia',
        dishCategory: 'Makanan Berat',
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, currentCost),
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        servings: 1,
        ingredients,
        nutritionHighlight: {
          title: 'Nutrisi Unggulan',
          description: 'Indeks Glikemik rendah mencegah lonjakan gula darah dan tinggi kalium untuk kesehatan jantung.',
          fiberGrams: 9.5,
          proteinGrams: 12.0,
          glycemicIndex: 'Sangat Rendah',
          caloriesEstimate: 290,
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Kukus Nasi Sorgum',
            instruction: 'Kukus nasi sorgum hingga berbutir lembut dan mekar empuk.',
            timerMinutes: 10,
          },
          {
            stepNumber: 2,
            title: 'Masak Kuah Bening',
            instruction: 'Rebus temu kunci, bawang merah, bayam segar dan sedikit garam rendah natrium.',
            timerMinutes: 8,
          },
          {
            stepNumber: 3,
            title: 'Sajikan Lengkap',
            instruction: 'Tata dengan lauk tempe/ikan suwir hangat untuk asupan gizi seimbang.',
            timerMinutes: 2,
          },
        ],
        imageUrl: FOOD_IMAGES.buddhaBowl,
        tags: ['Ramah Diabetes', 'Rendah Natrium', 'Jantung Sehat'],
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (dishCategory === 'camilan_sehat') {
    const title = 'Cookies Renyah Sorgum Cokelat Kenari';
    return {
      id: `recipe-${Date.now()}`,
      slug: slugify(title),
      title,
      subtitle: 'Kudapan sehat tanpa terigu gandum, renyah manis alami pas untuk teman santai:',
      targetAge: targetLabel,
      dishCategory: 'Camilan Sehat',
      targetBudget: budgetPerPortion,
      estimatedCost: Math.min(budgetPerPortion, 8500),
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 4,
      ingredients: [
        { name: 'Tepung sorgum murni', amount: '120g', estimatedPrice: 4000 },
        { name: 'Bubuk kakao murni (unsweetened)', amount: '2 sdm', estimatedPrice: 2000 },
        { name: 'Gula kelapa / madu', amount: '2 sdm', estimatedPrice: 1500 },
        { name: 'Minyak kelapa & vanili', amount: '2 sdm', estimatedPrice: 1000 },
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Tinggi antioksidan flavonoid cokelat & bebas gula rafinasi untuk energi bersih tanpa rasa bersalah.',
        fiberGrams: 7.2,
        proteinGrams: 5.4,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 160,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Campur Adonan Kering',
          instruction: 'Aduk tepung sorgum, bubuk kakao, dan sedikit garam halus.',
          timerMinutes: 3,
        },
        {
          stepNumber: 2,
          title: 'Bentuk Bulatan Keping',
          instruction: 'Satukan dengan minyak kelapa dan madu hingga kalis. Pipihkan di atas loyang beralas baking paper.',
          timerMinutes: 5,
        },
        {
          stepNumber: 3,
          title: 'Panggang Kering',
          instruction: 'Panggang pada suhu 160°C selama 12-15 menit. Dinginkan agar tekstur menjadi renyah maksimal.',
          timerMinutes: 15,
        },
      ],
      imageUrl: FOOD_IMAGES.cookies,
      tags: ['Bebas Terigu', 'Camilan Sehat', 'Rendah Gula'],
      createdAt: new Date().toISOString(),
    };
  }

  if (dishCategory === 'minuman_nutrisi') {
    const title = 'Sorghum Milkshake Susu Nabati Kurma';
    return {
      id: `recipe-${Date.now()}`,
      slug: slugify(title),
      title,
      subtitle: 'Minuman booster energi menyegarkan kaya kalsium dan serat larut prebiotik:',
      targetAge: targetLabel,
      dishCategory: 'Minuman Nutrisi',
      targetBudget: budgetPerPortion,
      estimatedCost: Math.min(budgetPerPortion, 7500),
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 1,
      ingredients: [
        { name: 'Susu biji sorgum sangrai / tepung sorgum matang', amount: '2 sdm (30g)', estimatedPrice: 2500 },
        { name: 'Kurma matang (buang biji)', amount: '3 butir', estimatedPrice: 2000 },
        { name: 'Susu cair / air kelapa hangat', amount: '200ml', estimatedPrice: 2000 },
        { name: 'Kayu manis bubuk sejumput', amount: '1/4 sdt', estimatedPrice: 500 },
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Bebas laktosa (jika memakai air nabati), kaya magnesium dan kalsium nabati untuk daya tahan tubuh.',
        fiberGrams: 6.8,
        proteinGrams: 6.2,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 195,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Seduh / Blender',
          instruction: 'Masukkan sari sorgum, kurma lembut, dan cairan ke dalam blender.',
          timerMinutes: 2,
        },
        {
          stepNumber: 2,
          title: 'Haluskan Sempurna',
          instruction: 'Blender kecepatan tinggi selama 1 menit hingga berbuih halus dan creamy lembut.',
          timerMinutes: 1,
        },
        {
          stepNumber: 3,
          title: 'Sajikan Segar',
          instruction: 'Tuang ke gelas saji, taburi sedikit bubuk kayu manis wangi. Nikmati hangat atau dingin!',
          timerMinutes: 1,
        },
      ],
      imageUrl: FOOD_IMAGES.milkshake,
      tags: ['Minuman Sehat', 'Plant-Based', 'Booster Energi'],
      createdAt: new Date().toISOString(),
    };
  }

  // Dessert Rendah GI
  const dessertTitle = 'Puding Sutra Sorgum Pandan Suji (Low GI)';
  return {
    id: `recipe-${Date.now()}`,
    slug: slugify(dessertTitle),
    title: dessertTitle,
    subtitle: 'Pencuci mulut manis alami yang lembut di lidah dan ramah kestabilan gula darah:',
    targetAge: targetLabel,
    dishCategory: 'Dessert Rendah GI',
    targetBudget: budgetPerPortion,
    estimatedCost: Math.min(budgetPerPortion, 8000),
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Tepung sorgum putih halus', amount: '40g', estimatedPrice: 2000 },
      { name: 'Jus daun pandan & suji alami', amount: '100ml', estimatedPrice: 1500 },
      { name: 'Santan encer / susu kedelai', amount: '200ml', estimatedPrice: 2500 },
      { name: 'Gula singkong / pemanis stevia', amount: '1 sdm', estimatedPrice: 1500 },
      { name: 'Garam & daun pandan simpul', amount: '1 lembar', estimatedPrice: 500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Serat larut sorgum memperlambat penyerapan karbohidrat sehingga aman dinikmati tanpa rasa cemas.',
      fiberGrams: 8.0,
      proteinGrams: 4.8,
      glycemicIndex: 'Sangat Rendah',
      caloriesEstimate: 140,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Larutkan Tepung',
        instruction: 'Aduk tepung sorgum bersama air perasan pandan dan santan hingga tidak ada gumpalan.',
        timerMinutes: 3,
      },
      {
        stepNumber: 2,
        title: 'Masak Meletup-letup',
        instruction: 'Masak dengan api kecil sambil terus diaduk searah jarum jam hingga adonan mengkilap dan meletup.',
        timerMinutes: 6,
      },
      {
        stepNumber: 3,
        title: 'Tuang Cetakan & Dinginkan',
        instruction: 'Tuang ke mangkuk cetakan kecil, dinginkan di kulkas selama 20 menit sebelum disajikan dingin.',
        timerMinutes: 20,
      },
    ],
    imageUrl: FOOD_IMAGES.pudding,
    tags: ['Dessert Sehat', 'Low GI', 'Pewarna Alami', 'Gluten Free'],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate a custom recipe from a user prompt using the BIMA AI LLM.
 * Falls back to the offline smart query matcher if the call fails.
 */
export async function generateCustomRecipeQueryAsync(userPrompt: string): Promise<Recipe> {
  // 🔧 FALLBACK OFF: throw error instead of returning offline recipe.
  // User wants raw AI output, not "Nasi Goreng Sorgum Ceria".
  const prompt = `Anda adalah SorghumCare AI, koki dan pakar sorgum Indonesia.
Tugas Anda adalah merancang resep masakan sorgum sehat berdasarkan permintaan pengguna.

### INPUT USER
Permintaan: "${userPrompt}"

${PROMPT_RULES}`;

  const result = await generateWithRetry(prompt);
  if (result && !('__refusal' in result) && result.title) {
    const ingredients = Array.isArray(result.ingredients) ? result.ingredients : [];
    if (ingredients.length === 0) {
      const refusalText = (result as any).subtitle || 'Kombinasi bahan / budget yang diminta tidak dapat dibuat menjadi resep.';
      throw new Error(refusalText);
    }
    const { issues, repaired } = validateRecipe(result, 12000);
    
    // Jika ada peringatan kombinasi bahan tidak lazim, tolak resepnya!
    const conflictIssue = issues.find(i => i.message.includes('Kombinasi bahan tidak lazim'));
    if (conflictIssue) {
      throw new Error(`BIMA menolak resep ini: ${conflictIssue.message}`);
    }

    const recipe = recipeFromLlmJson(repaired, 12000, 'camilan_sehat');
    (recipe as any).aiWarnings = issues;
    return recipe;
  }
  if (result && '__refusal' in result) {
    throw new Error(result.message);
  }
  throw new Error('AI backend tidak memberikan respons yang valid.');
}
