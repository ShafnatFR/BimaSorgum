import { WizardFormData, Recipe, RecipeIngredient, RecipeStep, AiRefusalResponse, RecipeSuggestion } from '../types';
import { INITIAL_FEATURED_RECIPE, TARGET_CONSUMERS, DEFAULT_INGREDIENTS } from '../data/mockData';
import { FOOD_IMAGES, getRecipeImageSync } from '../data/imageAssets';
import { slugify } from '../utils/slugify';
import { bimaChat, extractJsonFromLlm } from './bimaClient';
import { validateRecipe } from './recipeGuard';

/** Parse gramasi from ingredient name string.
 *  "Tepung Sorgum (150g)" → { cleanName: "Tepung Sorgum", amount: "150g" }
 *  "Telur Ayam (1 butir)" → { cleanName: "Telur Ayam", amount: "1 butir" }
 *  "Garam Halus" → { cleanName: "Garam Halus", amount: "" }
 */
function parseGramasi(raw: string): { cleanName: string; amount: string } {
  // Extract parenthetical gramasi: (150g), (1 butir ±60 gram), (2 sachet ±30 gram)
  const match = raw.trim().match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) {
    return { cleanName: match[1].trim(), amount: match[2].trim() };
  }
  return { cleanName: raw.trim(), amount: '' };
}

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
  const targetLabel = 'Semua Umur';

  const ingredients: RecipeIngredient[] = suggestion.ingredients.map((ing) => {
    const parsed = parseGramasi(ing);
    return { name: parsed.cleanName, amount: parsed.amount };
  });

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
    prepTimeMinutes: Math.round((suggestion.estimatedTimeMinutes || 20) * 0.4),
    cookTimeMinutes: Math.round((suggestion.estimatedTimeMinutes || 20) * 0.6),
    servings: 1,
    ingredients,
    nutritionHighlight: nutrition,
    steps,
    imageUrl: getRecipeImageSync(title, formData.dishCategory),
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

/** Estimate realistic servings when the LLM returns servings=1 or invalid.
 *  Based on category and ingredient count/weight. */
function estimateServings(llmServings: number | undefined, category: string, ingredients: any[]): number {
  if (llmServings && llmServings > 1) return llmServings; // LLM gave valid servings

  // Count total ingredient weight in grams (parse from name like "150 gram")
  let totalGrams = 0;
  for (const ing of ingredients) {
    const name = ing.name || '';
    const amount = ing.amount || '';
    const m = (amount || name).match(/(\d+)\s*(gram|g|gr)/i);
    if (m) totalGrams += parseInt(m[1], 10);
    const ml = (amount || name).match(/(\d+)\s*ml/i);
    if (ml) totalGrams += parseInt(ml[1], 10); // ml ≈ grams for liquids
  }

  // Minuman: usually 1-2 servings (personal drink)
  if (category === 'minuman_nutrisi') return totalGrams > 500 ? 2 : 1;

  // Others: estimate based on total weight
  // Typical main dish: 250-400g per serving
  // Typical snack: 100-150g per serving
  const gramsPerServing = category === 'camilan_sehat' ? 120 : category === 'dessert_rendah_gi' ? 100 : 300;
  const estimated = totalGrams > 0 ? Math.max(2, Math.round(totalGrams / gramsPerServing)) : 2;

  return Math.min(estimated, 10); // cap at 10
}

/** Build a Recipe object from a parsed LLM JSON, tolerating missing fields. */
function recipeFromLlmJson(parsed: Record<string, any>, fallbackCategory: string): Recipe {
  const title = parsed.title || 'Resep Sorgum Spesial';

  // Clean ingredient names: extract gramasi from name into amount field
  const rawIngredients = Array.isArray(parsed.ingredients) ? parsed.ingredients : [];
  const cleanedIngredients = rawIngredients.map((ing: any) => {
    const parsed_g = parseGramasi(ing.name || '');
    return {
      name: parsed_g.cleanName || ing.name,
      amount: ing.amount || parsed_g.amount,
      ...(ing.notes ? { notes: ing.notes } : {}),
    };
  });

  return {
    id: `recipe-ai-${Date.now()}`,
    slug: slugify(title),
    title,
    subtitle: parsed.subtitle || 'Resep sehat terpersonalisasi oleh SorghumCare AI',
    targetAge: parsed.targetAge || 'Semua Umur',
    dishCategory: parsed.dishCategory || fallbackCategory,
    prepTimeMinutes: parsed.prepTimeMinutes ?? 10,
    cookTimeMinutes: parsed.cookTimeMinutes ?? 15,
    servings: estimateServings(parsed.servings, parsed.dishCategory || fallbackCategory, cleanedIngredients),
    ingredients: cleanedIngredients,
    nutritionHighlight: parsed.nutritionHighlight || {
      title: 'Nutrisi Unggulan',
      description: 'Tinggi serat dan gizi, bebas gluten.',
    },
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    imageUrl: getRecipeImageSync(title, parsed.dishCategory || fallbackCategory),
    tags: Array.isArray(parsed.tags) && parsed.tags.length ? parsed.tags : ['Bebas Gluten', 'Sorgum Sehat'],
    createdAt: new Date().toISOString(),
  };
}

const RECIPE_JSON_SCHEMA = `{
  "title": "string",
  "subtitle": "string",
  "targetAge": "string",
  "dishCategory": "string",
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "servings": number,
  "ingredients": [{"name": "string (Tulis spesifik dengan gramasinya, misal: 'Bawang Merah (80 gram)')", "amount": "string (misal: '80 gram')"}],
  "nutritionHighlight": {"title": "string", "description": "string", "fiberGrams": number, "proteinGrams": number, "glycemicIndex": "string", "caloriesEstimate": number},
  "steps": [{"stepNumber": number, "title": "string", "instruction": "string", "timerMinutes": number}],
  "tags": ["string"]
}`;

const UNPAYLOAD_JSON_SCHEMA = `{
  "status": "unpayload",
  "message": "Penjelasan DETAIL (Gunakan Markdown: list alasan) mengapa resep ditolak (kombinasi aneh).",
  "flaggedIngredients": ["bahan bermasalah"],
  "suggestions": [
    {
      "title": "Judul Resep Alternatif",
      "ingredients": ["bahan A (gram)", "bahan B (gram)"],
      "description": "Deskripsi singkat alasan ini lebih baik",
      "estimatedTimeMinutes": 25,
      "removedIngredients": ["bahan aneh dari input"]
    }
  ]
}`;

const BASE_RULES = `### ATURAN VALIDASI (WAJIB DIIKUTI)
1. DATA WAJIB DARI REFERENSI: Anda WAJIB membaca [DOKUMEN REFERENSI]. Patuhi secara mutlak data kombinasi beracun, konversi satuan, dan perhitungan gram dari dokumen tersebut.
2. KELAYAKAN RESEP: Jika kombinasi bahan dilarang di dokumen (karena toxic) atau tidak lazim / tidak enak (mis. durian dicampur petis), JANGAN paksa membuat resep. TOLAK permintaan dengan format UNPAYLOAD.
3. JUMLAH PORSI: Tentukan servings secara realistis berdasarkan total bahan. Jika total adonan/minuman jelas untuk lebih dari 1 porsi, JANGAN set servings=1. Contoh: adonan 1kg camilan → servings 10-15, minuman 1 liter → servings 4, bubur 500ml → servings 2. servings=1 HANYA untuk resep yang benar-benar1 porsi individu (mis.1 mangkuk nasi).
`;

const FORMAT_RULES = `### FORMAT OUTPUT
Anda WAJIB memberikan satu buah JSON murni (tanpa markdown code block).
Pilih SALAH SATU struktur JSON berikut:

JIKA RESEP DITERIMA (Valid):
${RECIPE_JSON_SCHEMA}

JIKA RESEP DITOLAK (melanggar aturan di atas):
${UNPAYLOAD_JSON_SCHEMA}`;

function promptRules(): string {
  return `${BASE_RULES}
${FORMAT_RULES}`;
}

/** Appended on the retry that follows a non-JSON answer — the schema is often
 *  ignored when the model decides to answer with prose/analysis instead. */
const JSON_ONLY_REMINDER = `

### KOREKSI FORMAT (WAJIB)
Jawaban sebelumnya TIDAK valid karena bukan JSON. Balas ULANG hanya dengan SATU objek JSON sesuai skema di atas — tanpa kalimat pembuka, tanpa penjelasan, tanpa markdown code block, tanpa teks apa pun sebelum '{' atau setelah '}'.`;

/** Final-attempt trick: leave the prompt open inside the JSON object so the model
 *  must continue in JSON instead of writing a prose analysis ("## Konsep Produk"). */
const JSON_PREFILL = `

### MULAI JSON SEKARANG
Tulis LANJUTAN objek JSON di bawah ini saja — tanpa penjelasan, tanpa markdown code block:
{"title": "`;

/** Retry that reuses the answer we already have: the model often replies with a
 *  complete recipe written as prose/markdown ("## Konsep Produk" + tabel bahan +
 *  langkah). Re-generating from scratch repeats the same mistake, so hand the text
 *  back and ask for the SAME content as JSON — no new analysis, no changed numbers. */
const proseConversionBlock = (prose: string) => `

### KONVERSI WAJIB (JANGAN MENULIS ULANG DARI NOL)
Jawaban sebelumnya isinya SUDAH benar tetapi ditulis sebagai prosa/markdown, sehingga DITOLAK oleh sistem yang hanya menerima JSON. Ambil isi jawaban itu APA ADANYA dan ubah menjadi SATU objek JSON sesuai skema di atas: judul, seluruh bahan beserta takaran, field servings, serta seluruh langkah bernomor. JANGAN menambah analisis/section baru, JANGAN mengubah angka, JANGAN mengulang teks prosa.

"""${prose.slice(0, 1500)}"""`;

/** Max format attempts (answers that actually came back). The 4th attempt exists
 *  because a prose-only streak is the one failure mode the earlier retries can miss;
 *  it only runs on a path that would otherwise surface as a hard error. */
const MAX_FORMAT_ATTEMPTS = 4;

/** Call the LLM up to MAX_FORMAT_ATTEMPTS times; retries on empty/bad JSON and on prose
 *  (the 2nd attempt converts a prose answer into JSON, the later ones force JSON harder).
 *  Transient infrastructure failures (502/503/504/524/network) get their own fast
 *  retry allowance so a Cloudflare/origin hiccup does not surface as a hard error. */
async function generateWithRetry(prompt: string): Promise<Record<string, any> | { __refusal: true; message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] } | null> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let lastProseResponse: string | null = null;
  let lastEmptyIngredients: Record<string, any> | null = null;
  let timeouts = 0;
  let transientRetries = 0;
  let formatAttempts = 0; // attempts that actually returned an answer (JSON or prose)

  while (formatAttempts < MAX_FORMAT_ATTEMPTS) {
    const prefilled = formatAttempts >= 2;
    // A prose answer is fed back verbatim on the next attempt (conversion) instead of
    // being thrown away: the content is usually a complete recipe, only mis-formatted.
    const conversion = lastProseResponse ? proseConversionBlock(lastProseResponse) : '';
    const attemptPrompt = formatAttempts === 0 ? prompt
      : prompt + JSON_ONLY_REMINDER + conversion + (prefilled ? JSON_PREFILL : '');
    try {
      const result = await bimaChat(attemptPrompt, [], { useRag: false, stream: true });
      if (!result || !result.response) { formatAttempts++; continue; }

      const responseText = result.response;
      // With the prefill the completion starts INSIDE the object, so re-attach '{'.
      const parsed = extractJsonFromLlm(responseText)
        || (prefilled ? extractJsonFromLlm('{' + responseText.trim()) : null);

      if (parsed) {
        const status = String((parsed as any).status || '').toLowerCase();
        if (status === 'unpayload' || status === 'ditolak' || status === 'rejected' || status === 'refused') {
          const refMsg = (parsed as any).message || (parsed as any).subtitle || '';
          const suggestions = Array.isArray((parsed as any).suggestions)
            ? (parsed as any).suggestions.map((s: any) => ({
                title: s.title || '',
                ingredients: Array.isArray(s.ingredients) ? s.ingredients : [],
                description: s.description || '',
                estimatedTimeMinutes: Number(s.estimatedTimeMinutes) || undefined,
                removedIngredients: Array.isArray(s.removedIngredients) ? s.removedIngredients : undefined,
              }))
            : [];
          const flaggedIngredients = Array.isArray((parsed as any).flaggedIngredients)
            ? (parsed as any).flaggedIngredients
            : [];
          if (refMsg) return { __refusal: true, message: refMsg, suggestions, flaggedIngredients };
        }
        const ingredientList = Array.isArray((parsed as any).ingredients) ? (parsed as any).ingredients : [];
        if (ingredientList.length === 0) {
          // A JSON object with no usable ingredient list is a MALFORMED answer, not a
          // recipe: the model either got truncated mid-array or "declined" with an empty
          // one (observed at TTFT 167s, backend loaded). Treat it like a non-JSON answer
          // — retry with the JSON-only reminder, then the prefill — instead of refusing a
          // request the backend never actually judged. A real refusal arrives as
          // status:"unpayload" and is returned above.
          lastEmptyIngredients = parsed as Record<string, any>;
          formatAttempts++;
          continue;
        }
        return parsed;
      }

      // No JSON found — keep the prose so the next attempt can CONVERT it into JSON
      // (reminder → conversion → prefill). parseSSE appends the backend reviewer's
      // markdown note to the answer; strip it so the conversion prompt carries only
      // the model's own recipe text.
      const trimmed = responseText.trim()
        .replace(/\n*### Catatan Verifikasi[\s\S]*$/i, '')
        .replace(/\n*_Skor kelayakan:[\s\S]*$/i, '')
        .trim();
      if (trimmed && trimmed.length > 50) lastProseResponse = trimmed;
      formatAttempts++;
    } catch (err) {
      const rejMsg = err instanceof Error ? err.message : String(err);
      // Request-shaped failures: retrying cannot help.
      if (/\b(401|403|405|413|422|429)\b/.test(rejMsg)) throw err;
      // A timeout gets exactly one more attempt: the backend occasionally stalls
      // before its first token, but two 170s waits is the ceiling we accept.
      if (/timeout/i.test(rejMsg)) {
        timeouts++;
        if (timeouts >= 2) throw err;
        formatAttempts++;
        continue;
      }
      // Transient gateway/origin failure (Cloudflare 502/504/530 HTML page, ECONNRESET):
      // retry WITHOUT consuming a format attempt. A ~1 minute origin outage is absorbed.
      if (/\b(500|502|503|504|520|521|522|523|524|525|526|527|529|530)\b/.test(rejMsg) || /fetch failed|ECONNRESET|socket hang up|network/i.test(rejMsg)) {
        transientRetries++;
        if (transientRetries > 6) throw err;
        await sleep(3000 * transientRetries);
        continue;
      }
      // Backend error text / empty body: counts as a format attempt.
      formatAttempts++;
    }
  }

  // All retries exhausted. Prefer the model's own explanation when it produced an
  // ingredient-less object with a message/subtitle; else fall back to the prose it
  // wrote; else hand the empty object back so the caller can still refuse with context.
  const emptyMsg = lastEmptyIngredients
    ? String((lastEmptyIngredients as any).message || (lastEmptyIngredients as any).subtitle || '').trim()
    : '';
  if (emptyMsg) return { __refusal: true, message: emptyMsg };
  if (lastProseResponse) {
    const truncated = lastProseResponse.length > 800
      ? lastProseResponse.substring(0, 800) + '...\n\n*(Resep tidak dapat dihasilkan dalam format yang benar. Silakan coba lagi.)*'
      : lastProseResponse;
    return { __refusal: true, message: truncated };
  }
  if (lastEmptyIngredients) return lastEmptyIngredients;
  return null;
}

/** Helper: build an AiRefusalResponse from a refusal result. 
 *  When the AI provides no suggestions, falls back to local recipe suggestions. */
function buildRefusalResponse(
  result: { message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] },
  formData?: { dishCategory: string }
): AiRefusalResponse {
  const filtered = (result.suggestions || []).filter(s => s.title && s.ingredients.length > 0);
  // If AI gave no suggestions and we have form context, use local fallback
  const suggestions = filtered.length > 0
    ? filtered
    : formData ? buildLocalSuggestions(formData.dishCategory) : [];
  return {
    type: 'refusal',
    message: result.message,
    flaggedIngredients: result.flaggedIngredients || [],
    suggestions,
  };
}

/**
 * Generate sensible local recipe suggestions when the AI's recipe is rejected by the guard.
 * These are realistic recipes based on the dish category.
 */
export function buildLocalSuggestions(dishCategory: string): RecipeSuggestion[] {
  const pool: Record<string, RecipeSuggestion[]> = {
    makanan_berat: [
      {
        title: 'Bubur Sorgum Sayur Bayam',
        ingredients: ['Biji sorgum (100g)', 'Bayam segar', 'Bawang merah & putih', 'Garam', 'Minyak kelapa'],
        description: 'Bubur hangat kaya serat dengan sayuran segar, cocok untuk semua umur.',
        estimatedTimeMinutes: 30,
        removedIngredients: ['Dada ayam', 'Telur', 'Santan kelapa'],
      },
      {
        title: 'Nasi Sorgum Tahu Tempe',
        ingredients: ['Beras sorgum (150g)', 'Tahu goreng', 'Tempe goreng', 'Bawang putih', 'Kecap'],
        description: 'Nasi sorgum gurih lauk tahu tempe — protein nabati lengkap.',
        estimatedTimeMinutes: 25,
        removedIngredients: ['Daging ayam', 'Sayuran hijau premium'],
      },
      {
        title: 'Sorgum Bihun Goreng Sayur',
        ingredients: ['Biji sorgum rebus', 'Wortel', 'Kol', 'Bawang merah', 'Garam', 'Minyak goreng'],
        description: 'Gorengan sorgum dengan sayuran renyah, praktis dan bergizi.',
        estimatedTimeMinutes: 20,
        removedIngredients: ['Protein hewani', 'Santan'],
      },
    ],
    camilan_sehat: [
      {
        title: 'Cookies Sorgum Cokelat',
        ingredients: ['Tepung sorgum (120g)', 'Gula kelapa', 'Minyak kelapa', 'Bubuk kakao'],
        description: 'Kudapan renyah tanpa terigu, manis alami dari gula kelapa.',
        estimatedTimeMinutes: 30,
        removedIngredients: ['Tepung terigu', 'Mentega'],
      },
      {
        title: 'Lempeng Sorgum Original',
        ingredients: ['Tepung sorgum (100g)', 'Garam', 'Air', 'Minyak goreng'],
        description: 'Kerupuk sorgum renyah klasik, camilan sehat tanpa MSG.',
        estimatedTimeMinutes: 15,
        removedIngredients: ['Tepung terigu', 'Bahan pengawet'],
      },
      {
        title: 'Roti Sorgum Panggang',
        ingredients: ['Tepung sorgum (150g)', 'Ragi', 'Gula pasir', 'Garam', 'Minyak kelapa'],
        description: 'Roti lembut tanpa gluten, cocok untuk sarapan sehat.',
        estimatedTimeMinutes: 40,
        removedIngredients: ['Tepung gandum', 'Mentega', 'Susu'],
      },
    ],
    minuman_nutrisi: [
      {
        title: 'Susu Sorgum Kurma',
        ingredients: ['Tepung sorgum sangrai (30g)', 'Kurma (3 butir)', 'Air hangat'],
        description: 'Minuman hangat kaya magnesium dan serat, pemanis alami dari kurma.',
        estimatedTimeMinutes: 10,
        removedIngredients: ['Susu sapi', 'Gula pasir'],
      },
      {
        title: 'Sorgum Milkshake Vanila',
        ingredients: ['Tepung sorgum (30g)', 'Susu UHT (200ml)', 'Gula kelapa', 'Vanili'],
        description: 'Minuman creamy segar dengan aroma vanila, tinggi kalsium.',
        estimatedTimeMinutes: 10,
        removedIngredients: ['Es krim', 'Sirup buatan'],
      },
      {
        title: 'Es Sorgum Jeruk Nipis',
        ingredients: ['Air sorgum (200ml)', 'Jeruk nipis', 'Gula pasir', 'Es batu'],
        description: 'Minuman segar dengan vitamin C, cocok untuk cuaca panas.',
        estimatedTimeMinutes: 5,
        removedIngredients: ['Soda', 'Pewarna buatan'],
      },
    ],
    dessert_rendah_gi: [
      {
        title: 'Puding Sorgum Pandan',
        ingredients: ['Tepung sorgum (50g)', 'Santan (200ml)', 'Gula kelapa', 'Daun pandan'],
        description: 'Puding lembut pewarna alami pandan, rendah gula.',
        estimatedTimeMinutes: 25,
        removedIngredients: ['Telur', 'Susu', 'Gula pasir'],
      },
      {
        title: 'Bubur Ketan Sorgum',
        ingredients: ['Biji sorgum (100g)', 'Santan kental', 'Gula merah', 'Garam', 'Daun pandan'],
        description: 'Dessert tradisional dengan tekstur ketan dari sorgum.',
        estimatedTimeMinutes: 35,
        removedIngredients: ['Telur', 'Tepung terigu'],
      },
      {
        title: 'Sorgum Flan Karamel',
        ingredients: ['Tepung sorgum (40g)', 'Susu (200ml)', 'Gula pasir', 'Telur (1 butir)'],
        description: 'Flan sutra karamel yang elegan, rendah indeks glikemik.',
        estimatedTimeMinutes: 30,
        removedIngredients: ['Tepung terigu', 'Krim'],
      },
    ],
  };

  const suggestions = pool[dishCategory] || pool.makanan_berat;
  return suggestions;
}

/**
 * Best-effort dish category from a free-form chat prompt. Chat mode has no wizard step
 * where the user picked a category, so this only feeds LOCAL fallback suggestions when
 * the AI is unavailable — never the AI prompt itself.
 */
export function inferDishCategoryFromText(text: string): string {
  const t = (text || '').toLowerCase();
  if (/minuman|jus|smoothie|teh|susu|wedang|infus/.test(t)) return 'minuman_nutrisi';
  if (/dessert|puding|pudding|kue|bolu|cake|cookies|biskuit|flan|es krim|manis/.test(t)) return 'dessert_rendah_gi';
  if (/camilan|cemilan|snack|gorengan|keripik|kudapan/.test(t)) return 'camilan_sehat';
  return 'makanan_berat';
}

/**
 * Generate a recipe from Wizard data using the BIMA AI LLM (Living Labs).
 * Returns either a valid Recipe or an AiRefusalResponse when ingredients are nonsensical.
 * NO MORE offline fallback — if AI fails entirely, throws an error.
 */
/** What each wizard category means. The raw id alone ("minuman_nutrisi") left the
 *  model free to turn a drink request with chicken in the pantry into a cream soup. */
const CATEGORY_BRIEF: Record<string, string> = {
  makanan_berat: 'Makanan Berat — hidangan utama yang mengenyangkan (nasi, bubur, mi, lauk, sup).',
  camilan_sehat: 'Camilan Sehat — kudapan ringan porsi kecil (kue, keripik, bola-bola, biskuit).',
  minuman_nutrisi: 'Minuman Nutrisi — WAJIB berupa minuman yang diminum (smoothie, jus, susu/sari sorgum, wedang, minuman fermentasi). BUKAN sup, bubur, atau makanan berkuah.',
  dessert_rendah_gi: 'Dessert Rendah GI — hidangan penutup manis yang ramah gula darah (puding, kue, es).',
};

/** What each target group needs. The wizard asks for it in step 1, so the prompt has to carry it. */
const CONSUMER_BRIEF: Record<string, string> = {
  anak_sd: 'Anak SD (6–12 tahun) — rasa manis/gurih ringan yang disukai anak, TIDAK pedas dan tidak pahit, tekstur mudah dikunyah, porsi anak, tanpa kafein.',
  siswa_smp: 'Siswa SMP (12–15 tahun) — masa pertumbuhan dan aktivitas tinggi: cukup energi dan protein, sumber kalsium dan zat besi.',
  siswa_sma: 'Siswa SMA (15–18 tahun) — fokus belajar dan daya tahan tubuh: energi stabil dari karbohidrat kompleks, protein, sayur/buah.',
  dewasa_lansia: 'Dewasa & Lansia — rendah gula dan rendah indeks glikemik, serat tinggi, rendah garam dan lemak jenuh, tekstur lembut dan mudah dicerna.',
};

function describeConsumers(ids: string[]): string {
  const briefs = ids.map(id => CONSUMER_BRIEF[id] || TARGET_CONSUMERS.find(c => c.id === id)?.label || id);
  return briefs.length > 0 ? briefs.join(' | ') : 'Umum';
}

/** Ingredient ids ("protein_ayam_telur") read as names; custom ones are already names. */
function ingredientNames(formData: WizardFormData): string {
  const picked = formData.selectedIngredientIds.map(id => DEFAULT_INGREDIENTS.find(i => i.id === id)?.name || id);
  return picked.concat(formData.customIngredients).join(', ');
}

export async function generateRecipeFromWizardAsync(formData: WizardFormData): Promise<Recipe | AiRefusalResponse> {
  const prompt = `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia.
Tugas Anda adalah merancang resep masakan sorgum yang sehat dan lezat.

### INPUT USER
- Target Konsumen: ${describeConsumers(formData.targetConsumers)}
- Kategori Hidangan: ${CATEGORY_BRIEF[formData.dishCategory] || formData.dishCategory}
- Bahan Pokok: ${ingredientNames(formData)}
- Batas Waktu Persiapan: ${formData.prepTimeLimit}

### ATURAN BAHAN
- Rasa, tekstur, porsi, dan kandungan gizi WAJIB cocok untuk Target Konsumen. Bila lebih dari satu target, buat satu resep yang aman dan cocok untuk SEMUA target (pakai batasan yang paling ketat).
- Bentuk hidangan WAJIB sesuai Kategori Hidangan. Bahan Pokok yang tidak cocok untuk kategori itu (mis. ayam atau bawang untuk minuman) JANGAN dipakai — tidak semua Bahan Pokok harus masuk resep.
- HANYA gunakan Bahan Pokok di atas.
- DIIZINKAN menambahkan bahan dapur umum (air, garam, merica, minyak goreng, bawang).
- DILARANG menambahkan bahan khusus lainnya (mis. keju, saus tiram, madu) kecuali sudah ada di Bahan Pokok.

${promptRules()}`;

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
        message: parsed.subtitle || 'Kombinasi bahan yang diminta tidak dapat dibuat menjadi resep.',
        flaggedIngredients: [],
      }, formData);
    }
    const { issues } = validateRecipe(parsed, formData.dishCategory);
    const errorIssues = issues.filter(i => i.level === 'error');

    if (errorIssues.length > 0) {
      const feedback = errorIssues.map(i => `- ${i.message}`).join('\n');
      const repairPrompt = `${prompt}

### KOREKSI WAJIB DARI VALIDATOR SISTEM
Resep sebelumnya DITOLAK karena:
${feedback}

Susun ULANG satu resep JSON yang IDENTIK strukturnya dan perbaiki pelanggaran di atas. Bentuk hidangan WAJIB sesuai Kategori Hidangan dan cocok untuk Target Konsumen. Jangan mengulangi pelanggaran yang sama.`;

      const repairedAttempt = await generateWithRetry(repairPrompt);
      if (repairedAttempt && '__refusal' in repairedAttempt) {
        return buildRefusalResponse(repairedAttempt as { message: string; suggestions?: RecipeSuggestion[]; flaggedIngredients?: string[] }, formData);
      }
      const repairedParsed = repairedAttempt as Record<string, any> | null;
      if (repairedParsed && repairedParsed.title && Array.isArray(repairedParsed.ingredients) && repairedParsed.ingredients.length > 0) {
        const second = validateRecipe(repairedParsed, formData.dishCategory);
        if (!second.issues.some(i => i.level === 'error')) {
          return recipeFromLlmJson(second.repaired, formData.dishCategory);
        }
      }
    }

    if (errorIssues.length > 0) {
      const ingredientNames = ingredients.map((i: any) => i.name || '').filter(Boolean);
      const errorDetail = errorIssues.map(i => `- ${i.message}`).join('\n');

      return buildRefusalResponse({
        message: `**Resep tidak dapat dibuat**\n\n${errorDetail}\n\nSilakan pilih salah satu alternatif di bawah:`,
        flaggedIngredients: ingredientNames.slice(0, 5),
      }, formData);
    }

    const { repaired } = validateRecipe(parsed, formData.dishCategory);
    const recipe = recipeFromLlmJson(repaired, formData.dishCategory);
    return recipe;
  }

  // Case 3: AI returned nothing usable — return local suggestions as refusal (not a crash)
  return buildRefusalResponse({
    message: 'AI tidak memberikan respons yang valid. Berikut alternatif resep yang bisa Anda pilih:',
    flaggedIngredients: [],
  }, formData);
}

export function generateRecipeFromWizard(formData: WizardFormData): Recipe {
  const { dishCategory, selectedIngredientIds, customIngredients } = formData;

  const targetLabel = 'Semua Umur';

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


  if (dishCategory === 'makanan_berat') {
    if (true) { // anak_sekolah
      return {
        ...INITIAL_FEATURED_RECIPE,
        id: `recipe-${Date.now()}`,
        imageUrl: FOOD_IMAGES.nasiGoreng,
      };
    }

    if (false) { // balita
      ingredients.push(
        { name: 'Biji sorgum giling halus (bubur)', amount: '50g' },
        { name: 'Kuning telur ayam kampung', amount: '1 butir' },
        { name: 'Wortel & bayam cincang halus', amount: '1 genggam' },
        { name: 'Kaldu ayam kampung alami', amount: '150ml' },
        { name: 'Minyak kelapa murni (EVCO)', amount: '1 sdt' }
      );
      const title = 'Bubur Tim Sorgum Sayur Pelangi (MPASI)';
      return {
        id: `recipe-${Date.now()}`,
        slug: slugify(title),
        title,
        subtitle: 'Tekstur super lembut, kaya zat besi dan prebiotik alami untuk tumbuh kembang optimal balita:',
        targetAge: 'Balita (1-5 thn)',
        dishCategory: 'Makanan Berat',
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

    if (false) { // lansia
      ingredients.push(
        { name: 'Nasi sorgum empuk kukus', amount: '1 mangkok kecil (100g)' },
        { name: 'Sup bayam jagung bening', amount: '1 mangkuk' },
        { name: 'Tahu / tempe kukus bumbu kuning', amount: '2 potong' },
        { name: 'Ikan suwir / telur rebus', amount: '40g' }
      );
      const title = 'Nasi Sorgum Gurih dengan Sayur Bening & Protein';
      return {
        id: `recipe-${Date.now()}`,
        slug: slugify(title),
        title,
        subtitle: 'Menu ramah gula darah, mudah dikunyah dan kaya antioksidan polifenol:',
        targetAge: 'Lansia',
        dishCategory: 'Makanan Berat',
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
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 4,
      ingredients: [
        { name: 'Tepung sorgum murni', amount: '120g' },
        { name: 'Bubuk kakao murni (unsweetened)', amount: '2 sdm' },
        { name: 'Gula kelapa / madu', amount: '2 sdm' },
        { name: 'Minyak kelapa & vanili', amount: '2 sdm' },
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
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 1,
      ingredients: [
        { name: 'Susu biji sorgum sangrai / tepung sorgum matang', amount: '2 sdm (30g)' },
        { name: 'Kurma matang (buang biji)', amount: '3 butir' },
        { name: 'Susu cair / air kelapa hangat', amount: '200ml' },
        { name: 'Kayu manis bubuk sejumput', amount: '1/4 sdt' },
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
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Tepung sorgum putih halus', amount: '40g' },
      { name: 'Jus daun pandan & suji alami', amount: '100ml' },
      { name: 'Santan encer / susu kedelai', amount: '200ml' },
      { name: 'Gula singkong / pemanis stevia', amount: '1 sdm' },
      { name: 'Garam & daun pandan simpul', amount: '1 lembar' },
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
  // User wants raw AI output, not "Nasi Goreng Sorgum Ceria".
  const prompt = `Anda adalah SorghumCare AI, ahli gizi dan koki spesialis sorgum Indonesia.
Tugas Anda adalah merancang SATU resep masakan sorgum yang sehat, lezat, dan bisa langsung dipraktikkan.

### INPUT USER
Permintaan: "${userPrompt}"

### ATURAN BAHAN
- Sorgum (biji sorgum atau tepung sorgum) WAJIB menjadi bahan pokok resep ini.
- DIIZINKAN menambahkan bahan dapur umum (air, garam, merica, minyak goreng, bawang).
- Patuhi batasan yang disebut pengguna bila ada (kategori hidangan, waktu persiapan, jumlah bahan).
- DILARANG menambahkan bahan khusus lain (mis. keju, saus tiram, madu) kecuali pengguna menyebutnya.

### FORMAT WAJIB
Balas LANGSUNG dengan SATU objek JSON — karakter pertama jawaban HARUS '{' dan terakhir '}'.
DILARANG menulis prosa, heading markdown, tabel naratif, bagian "Konsep Produk"/"Analisis"/"Bahan" dalam bentuk teks, kalimat pembuka, atau penjelasan apa pun di luar objek JSON.
Field "subtitle" berisi deskripsi singkat tentang masakan itu sendiri — rasa, tekstur, kenikmatan, dan cara disajikan. JANGAN tulis kandungan gizi, komposisi nutrisi, atau perhitungan harga di subtitle. Data gizi dan komposisi hanya masuk ke field "nutritionHighlight".
${promptRules()}`;

  const result = await generateWithRetry(prompt);
  if (result && !('__refusal' in result) && result.title) {
    const ingredients = Array.isArray(result.ingredients) ? result.ingredients : [];
    if (ingredients.length === 0) {
      const refusalText = (result as any).subtitle || 'Kombinasi bahan yang diminta tidak dapat dibuat menjadi resep.';
      throw new Error(refusalText);
    }
    const { issues, repaired } = validateRecipe(result);

    // Jika ada error, tolak resepnya!
    const errorIssues = issues.filter(i => i.level === 'error');
    if (errorIssues.length > 0) {
      const errorMsgs = errorIssues.map(i => i.message).join('; ');
      throw new Error(`Resep ditolak: ${errorMsgs}`);
    }

    // Jika ada peringatan kombinasi bahan tidak lazim, tolak resepnya!
    const conflictIssue = issues.find(i => i.message.includes('Kombinasi bahan tidak lazim'));
    if (conflictIssue) {
      throw new Error(`BIMA menolak resep ini: ${conflictIssue.message}`);
    }

    const recipe = recipeFromLlmJson(repaired, 'camilan_sehat');
        return recipe;
  }
  if (result && '__refusal' in result) {
    throw new Error(result.message);
  }
  throw new Error('AI backend tidak memberikan respons yang valid.');
}
