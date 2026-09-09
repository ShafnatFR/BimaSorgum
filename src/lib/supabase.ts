import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  Recipe,
  RecipeIngredient,
  RecipeStep,
  SavedRecipe,
  ChatMessage,
  NutritionHighlight,
} from '../types';
import { getRecipeImage } from '../data/imageAssets';

/**
 * SorghumCare — Supabase data layer.
 *
 * Anonymous sign-in (enabled on the project) gives every visitor a stable
 * per-browser identity which gates RLS on saved_recipes / chat_sessions.
 *
 * Runtime config comes from Vite env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env var.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

/** Ensure an anonymous session exists (idempotent). Returns user id or null. */
export async function ensureAnonymousSession(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) return session.user.id;

  const { data: { session: anon }, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed:', error.message);
    return null;
  }
  return anon?.user?.id ?? null;
}

/** Current user id (sync read of the in-memory session) — use getUserIdAsync instead */


/** Async current user id */
export async function getUserIdAsync(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

/* ================================================================== *
 *  DB row types (mirror public schema)
 * ================================================================== */

export interface DbRecipeRow {
  id: string;
  source_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  tags: string[] | null;
  target_age_label: string | null;
  dish_category: 'makanan_berat' | 'camilan_sehat' | 'minuman_nutrisi' | 'dessert_rendah_gi' | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  estimated_cost: number | null;
  target_budget: number | null;
  calories_estimate: number | null;
  fiber_grams: number | null;
  protein_grams: number | null;
  glycemic_index: string | null;
  nutrition_title: string | null;
  nutrition_description: string | null;
  prep_time_limit: string | null;
  is_system: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbIngredientRow {
  id: string;
  recipe_id: string;
  ingredient_ref: string | null;
  name: string;
  amount: string;
  notes: string | null;
  estimated_price: number | null;
  sort_order: number;
}

export interface DbStepRow {
  id: string;
  recipe_id: string;
  step_number: number;
  title: string;
  instruction: string;
  timer_minutes: number | null;
  tip: string | null;
}

export interface DbTargetRow {
  recipe_id: string;
  target: string;
}

export interface DbSavedRow {
  id: string;
  user_id: string;
  recipe_id: string;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
}

export interface DbChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbChatMessageRow {
  id: string;
  session_id: string;
  sender: 'user' | 'ai' | 'system';
  content: string | null;
  recipe_id: string | null;
  created_at: string;
  // populated when selecting '*, recipe:recipes(*)'
  recipe?: DbRecipeRow | null;
}

/* ================================================================== *
 *  Mappers DB -> domain (Recipe)
 * ================================================================== */

export const CATEGORY_LABEL: Record<string, string> = {
  makanan_berat: 'Makanan Berat',
  camilan_sehat: 'Camilan Sehat',
  minuman_nutrisi: 'Minuman Nutrisi',
  dessert_rendah_gi: 'Dessert Rendah GI',
};

/** Build a domain Recipe from a db row + its child rows. */
export function mapRecipe(
  r: DbRecipeRow,
  ingredients: DbIngredientRow[] = [],
  steps: DbStepRow[] = []
): Recipe {
  const nh: NutritionHighlight = {
    title: r.nutrition_title || 'Nutrisi Unggulan',
    description:
      r.nutrition_description ||
      'Resep sorgum sehat kaya serat, bebas gluten, dan ramah gula darah.',
    fiberGrams: r.fiber_grams ?? undefined,
    proteinGrams: r.protein_grams ?? undefined,
    glycemicIndex:
      (r.glycemic_index as NutritionHighlight['glycemicIndex']) ?? undefined,
    caloriesEstimate: r.calories_estimate ?? undefined,
  };

  const ingList: RecipeIngredient[] = [...ingredients]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({
      name: i.name,
      amount: i.amount,
      estimatedPrice: i.estimated_price ?? 0,
      notes: i.notes ?? undefined,
    }));

  const stepList: RecipeStep[] = [...steps]
    .sort((a, b) => a.step_number - b.step_number)
    .map((s) => ({
      stepNumber: s.step_number,
      title: s.title,
      instruction: s.instruction,
      timerMinutes: s.timer_minutes ?? undefined,
      tip: s.tip ?? undefined,
    }));

  const categoryLabel = r.dish_category
    ? CATEGORY_LABEL[r.dish_category] || r.dish_category
    : 'Makanan Berat';

  return {
    id: r.id, // uuid from DB — used for detail routing by slug instead
    slug: r.slug,
    title: r.title,
    subtitle: r.subtitle || '',
    targetAge: r.target_age_label || 'Semua Usia',
    dishCategory: categoryLabel,
    targetBudget: r.target_budget ?? r.estimated_cost ?? 0,
    estimatedCost: r.estimated_cost ?? 0,
    prepTimeMinutes: r.prep_time_minutes ?? 0,
    cookTimeMinutes: r.cook_time_minutes ?? 0,
    servings: r.servings ?? 1,
    ingredients: ingList,
    nutritionHighlight: nh,
    steps: stepList,
    imageUrl: r.image_url || getRecipeImage(r.title, r.dish_category || undefined),
    tags: r.tags || [],
    createdAt: r.created_at || new Date().toISOString(),
  };
}

/* ================================================================== *
 *  READ — recipe catalog
 * ================================================================== */

export interface CatalogQuery {
  category?: string; // dish_category key ('makanan_berat' etc.)
  search?: string;
  limit?: number;
}

/**
 * Fetch full recipe catalog (published, system + user) with children.
 * If `ids` provided, only those recipe uuids are returned.
 */
export async function fetchRecipes(opts: CatalogQuery = {}): Promise<Recipe[]> {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (opts.category && opts.category !== 'all') {
    query = query.eq('dish_category', opts.category);
  }
  if (opts.search) {
    query = query.ilike('title', `%${opts.search}%`);
  }
  if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data: rows, error } = await query;
  if (error) {
    console.error('fetchRecipes error:', error.message);
    return [];
  }

  const recipes = rows as DbRecipeRow[];
  const recipeIds = recipes.map((r) => r.id);
  if (recipeIds.length === 0) return [];

  // children in one round each
  const [ing, st, tg] = await Promise.all([
    supabase.from('recipe_ingredients').select('*').in('recipe_id', recipeIds),
    supabase.from('recipe_steps').select('*').in('recipe_id', recipeIds),
    supabase.from('recipe_targets').select('*').in('recipe_id', recipeIds),
  ]);

  const ingBy = groupBy((ing.data as DbIngredientRow[]) || [], 'recipe_id');
  const stBy = groupBy((st.data as DbStepRow[]) || [], 'recipe_id');
  const tgBy = groupBy((tg.data as DbTargetRow[]) || [], 'recipe_id');

  return recipes.map((r) => {
    const recipe = mapRecipe(r, ingBy.get(r.id) || [], stBy.get(r.id) || []);
    // attach targets as synthetic tags (optional; not part of Recipe type)
    (recipe as any)._targets = (tgBy.get(r.id) || []).map((t) => t.target);
    return recipe;
  });
}

/** Fetch a single recipe by its SLUG (used by /recipe/:slug). */
export async function fetchRecipeBySlug(slug: string): Promise<Recipe | null> {
  const { data: row, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error || !row) return null;

  const r = row as DbRecipeRow;
  const [ing, st] = await Promise.all([
    supabase.from('recipe_ingredients').select('*').eq('recipe_id', r.id).order('sort_order'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', r.id).order('step_number'),
  ]);
  return mapRecipe(
    r,
    (ing.data as DbIngredientRow[]) || [],
    (st.data as DbStepRow[]) || []
  );
}

function groupBy<T>(arr: T[], key: keyof T): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of arr) {
    const k = String(item[key]);
    if (!m.has(k)) m.set(k, []);
    m.get(k)!.push(item);
  }
  return m;
}

/* ================================================================== *
 *  WRITE — recipe (used when wizard/chat "generates" a recipe:
 *  we store a user-created recipe row + children)
 * ================================================================== */

/** Persist a generated recipe. Returns stored recipe (with slug) or null. */
export async function upsertRecipe(recipe: Recipe): Promise<Recipe | null> {
  let slug = recipe.slug || slugifyTitle(recipe.title);
  const userId = await getUserIdAsync();

  // User-generated recipe that collides with a system/other-user slug must
  // get a unique slug (system rows are public-read, not user-owned, so an
  // upsert-by-slug update would violate RLS). Appending a short suffix keeps
  // every generated recipe as its own saved creation. Check happens for ANY
  // incoming slug (generated recipes often carry a system slug already).
  if (userId) {
    const { data: existing } = await supabase
      .from('recipes')
      .select('id, created_by')
      .eq('slug', slug)
      .maybeSingle();
    if (existing && existing.created_by !== userId) {
      slug = `${slug}-${Date.now().toString(36).slice(-5)}`;
    }
  }
  const nh: NutritionHighlight = recipe.nutritionHighlight ?? {
    title: 'Nutrisi Unggulan',
    description: 'Kaya serat dan gizi untuk pertumbuhan.',
  };
  const categoryKey = categoryToKey(recipe.dishCategory);

  // Normalize glycemic_index to the DB check constraint values.
  const giRaw = (nh.glycemicIndex || '').toLowerCase();
  const glycemicIndex =
    giRaw.includes('sangat') ? 'Sangat Rendah'
    : giRaw.includes('rendah') || giRaw.includes('low') ? 'Rendah (Low GI)'
    : giRaw.includes('sedang') || giRaw.includes('medium') || giRaw.includes('moderate') ? 'Sedang'
    : null;

  const row: Partial<DbRecipeRow> = {
    source_id: recipe.id || `user-${Date.now()}`,
    slug,
    title: recipe.title,
    subtitle: recipe.subtitle || '',
    image_url: recipe.imageUrl || null,
    tags: recipe.tags || [],
    target_age_label: recipe.targetAge || null,
    dish_category: categoryKey,
    prep_time_minutes: recipe.prepTimeMinutes,
    cook_time_minutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    estimated_cost: recipe.estimatedCost,
    target_budget: recipe.targetBudget,
    calories_estimate: nh.caloriesEstimate,
    fiber_grams: nh.fiberGrams,
    protein_grams: nh.proteinGrams,
    glycemic_index: glycemicIndex,
    nutrition_title: nh.title || null,
    nutrition_description: nh.description || null,
    is_system: false,
    is_published: true,
    created_by: userId ?? undefined,
  };

  const { data, error } = await supabase
    .from('recipes')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();
  if (error || !data) {
    console.error('upsertRecipe error:', error?.message);
    return null;
  }
  const saved = data as DbRecipeRow;

  // Replace children (delete + insert) to keep in sync.
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', saved.id);
  if (recipe.ingredients?.length) {
    const ingRows = recipe.ingredients.map((ing, idx) => ({
      recipe_id: saved.id,
      name: ing.name,
      amount: ing.amount,
      notes: ing.notes || null,
      estimated_price: ing.estimatedPrice,
      sort_order: idx,
    }));
    await supabase.from('recipe_ingredients').insert(ingRows);
  }

  await supabase.from('recipe_steps').delete().eq('recipe_id', saved.id);
  if (recipe.steps?.length) {
    const stepRows = recipe.steps.map((s) => ({
      recipe_id: saved.id,
      step_number: s.stepNumber,
      title: s.title,
      instruction: s.instruction,
      timer_minutes: s.timerMinutes ?? null,
      tip: s.tip || null,
    }));
    await supabase.from('recipe_steps').insert(stepRows);
  }

  return mapRecipe(saved);
}

export function slugifyTitle(title: string): string {
  return title
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryToKey(label: string): DbRecipeRow['dish_category'] {
  const l = label.toLowerCase();
  if (l.includes('camilan')) return 'camilan_sehat';
  if (l.includes('minuman')) return 'minuman_nutrisi';
  if (l.includes('dessert') || l.includes('rendah gi') || l.includes('kue')) return 'dessert_rendah_gi';
  return 'makanan_berat';
}

/* ================================================================== *
 *  SAVED RECIPES (per anonymous user)
 * ================================================================== */

/** Fetch saved recipe rows for current user, joined with recipe + children. */
export async function fetchSavedRecipes(): Promise<SavedRecipe[]> {
  const userId = await getUserIdAsync();
  if (!userId) return [];

  const { data: saved, error } = await supabase
    .from('saved_recipes')
    .select('*, recipe:recipes(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !saved) {
    console.error('fetchSavedRecipes:', error?.message);
    return [];
  }

  const result: SavedRecipe[] = [];
  for (const s of saved as any[]) {
    const recipeRow = s.recipe as DbRecipeRow | null;
    if (!recipeRow) continue;
    const ing = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', recipeRow.id)
      .order('sort_order');
    const st = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', recipeRow.id)
      .order('step_number');
    result.push({
      id: s.id,
      recipe: mapRecipe(
        recipeRow,
        (ing.data as DbIngredientRow[]) || [],
        (st.data as DbStepRow[]) || []
      ),
      savedAt: s.created_at,
      isFavorite: s.is_favorite,
      notes: s.notes || undefined,
    });
  }
  return result;
}

/** Save a recipe (by its db uuid). Anonymous identity required. */
export async function saveRecipeForUser(recipeId: string): Promise<boolean> {
  const userId = await getUserIdAsync();
  if (!userId) return false;
  const { error } = await supabase.from('saved_recipes').upsert(
    { user_id: userId, recipe_id: recipeId, is_favorite: true },
    { onConflict: 'user_id,recipe_id' }
  );
  if (error) {
    console.error('saveRecipeForUser:', error.message);
    return false;
  }
  return true;
}

/** Remove a saved recipe for current user. */
export async function unsaveRecipeForUser(recipeId: string): Promise<boolean> {
  const userId = await getUserIdAsync();
  if (!userId) return false;
  const { error } = await supabase
    .from('saved_recipes')
    .delete()
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);
  if (error) {
    console.error('unsaveRecipeForUser:', error.message);
    return false;
  }
  return true;
}

/** Resolve saved (uuid set) for current user in one query. */
export async function fetchSavedRecipeIds(): Promise<Set<string>> {
  const userId = await getUserIdAsync();
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', userId);
  if (error || !data) return new Set();
  return new Set((data as { recipe_id: string }[]).map((d) => d.recipe_id));
}

/* ================================================================== *
 *  CHAT SESSIONS & MESSAGES
 * ================================================================== */

export async function fetchChatSessions(): Promise<DbChatSessionRow[]> {
  const userId = await getUserIdAsync();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) return [];
  return (data as DbChatSessionRow[]) || [];
}

/** Fetch full messages (with optional recipe embed) for a chat session. */
export async function fetchChatSessionMessages(
  sessionId: string
): Promise<DbChatMessageRow[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*, recipe:recipes(*)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) {
    console.error('fetchChatSessionMessages error:', error.message);
    return [];
  }
  const rows = (data as DbChatMessageRow[]) || [];
  // Hydrate full recipe cards: fetch children (ingredients/steps) for any
  // embedded recipe so re-opened sessions show complete recipes.
  const recipeRows = rows.filter((r) => r.recipe).map((r) => r.recipe as DbRecipeRow);
  if (recipeRows.length) {
    const [ings, sts] = await Promise.all([
      supabase.from('recipe_ingredients').select('*').in('recipe_id', recipeRows.map((r) => r.id)),
      supabase.from('recipe_steps').select('*').in('recipe_id', recipeRows.map((r) => r.id)),
    ]);
    const ingBy = groupBy((ings.data as DbIngredientRow[]) || [], 'recipe_id');
    const stBy = groupBy((sts.data as DbStepRow[]) || [], 'recipe_id');
    for (const row of rows) {
      if (row.recipe) {
        (row as any)._recipeWithChildren = mapRecipe(
          row.recipe,
          ingBy.get(row.recipe.id) || [],
          stBy.get(row.recipe.id) || []
        );
      }
    }
  }
  return rows;
}

/** Rename an existing chat session (smart summary titles). */
export async function renameChatSession(
  sessionId: string,
  title: string
): Promise<boolean> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', sessionId);
  if (error) {
    console.error('renameChatSession error:', error.message);
    return false;
  }
  return true;
}

/** Bump updated_at so "Recent" sorts by most recent activity. */
export async function touchChatSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) console.error('touchChatSession error:', error.message);
}

export async function createChatSession(title: string): Promise<DbChatSessionRow | null> {
  const userId = await getUserIdAsync();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) return null;
  return data as DbChatSessionRow;
}

export async function saveChatMessages(
  sessionId: string,
  messages: { sender: 'user' | 'ai'; content: string; recipe_id?: string | null }[]
): Promise<boolean> {
  if (!messages.length) return true;
  const rows = messages.map((m) => ({
    session_id: sessionId,
    sender: m.sender,
    content: m.content ?? null,
    recipe_id: m.recipe_id ?? null,
  }));
  const { error } = await supabase.from('chat_messages').insert(rows);
  return !error;
}

/* ================================================================== *
 *  PROFILES (anonymous user info)
 * ================================================================== */

export async function fetchProfile(): Promise<{ full_name: string; avatar_url: string | null } | null> {
  const userId = await getUserIdAsync();
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return data as { full_name: string; avatar_url: string | null };
}

export async function updateProfileName(fullName: string): Promise<boolean> {
  const userId = await getUserIdAsync();
  if (!userId) return false;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName }, { onConflict: 'id' });
  return !error;
}