import { Recipe } from '../types';
import { HOME_VIDEO_TUTORIALS, VideoTutorialItem } from '../data/homeData';
import { INITIAL_FEATURED_RECIPE, INITIAL_SAVED_RECIPES } from '../data/mockData';
import { EXPLORE_RECIPES_DATABASE } from '../data/exploreRecipesData';

/**
 * Converts arbitrary text into a URL-friendly slug.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces & dashes
    .replace(/[\s_-]+/g, '-') // collapse whitespace and replace by -
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
}

/**
 * Known fixed slugs for all standard recipes to ensure canonical URLs.
 */
export const RECIPE_SLUG_MAP: Record<string, string> = {
  'healthy-bowl-sorghum': 'sorghum-power-bowl',
  'pancakes-sorghum': 'pancakes-sorghum-gluten-free',
  'nasi-goreng-sorgum-sd': 'nasi-goreng-sorgum-ceria-sd-edition',
  'recipe-sd-1': 'nasi-goreng-sorgum-ceria-sd-edition',
  'roti-tawar-sorgum': 'roti-tawar-biji-sorgum-artisanal',
  'bubur-manado-sorgum': 'bubur-tinutuan-sorgum-manado',
  'risotto-jamur-sorgum': 'risotto-jamur-liar-sorgum-creamy',
  'cookies-cokelat-sorgum': 'cookies-keping-cokelat-sorgum',
  'cendol-sorgum-nangka': 'es-cendol-sorgum-nangka-gula-aren',
  'bolu-kukus-pandan-sorgum': 'bolu-kukus-pandan-sorgum-mekar',
  'sup-jagung-sorgum': 'sup-krim-jagung-sorgum-hangat',
};

/**
 * Get canonical slug for any recipe.
 */
export function getRecipeSlug(recipe: Recipe): string {
  if (recipe.slug) return recipe.slug;
  if (recipe.id && RECIPE_SLUG_MAP[recipe.id]) {
    return RECIPE_SLUG_MAP[recipe.id];
  }
  return slugify(recipe.title || recipe.id || 'resep');
}

/**
 * Get all available system recipes consolidated.
 */
export function getAllSystemRecipes(customRecipes: Recipe[] = []): Recipe[] {
  const map = new Map<string, Recipe>();

  // Add initial featured
  map.set(INITIAL_FEATURED_RECIPE.id, INITIAL_FEATURED_RECIPE);

  // Add explore database
  EXPLORE_RECIPES_DATABASE.forEach((r) => map.set(r.id, r));

  // Add saved recipes
  INITIAL_SAVED_RECIPES.forEach((s) => map.set(s.recipe.id, s.recipe));

  // Add user custom recipes
  customRecipes.forEach((r) => map.set(r.id, r));

  return Array.from(map.values());
}

/**
 * Find recipe by its slug or ID.
 */
export function findRecipeBySlug(slug: string, customRecipes: Recipe[] = []): Recipe | null {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();
  const all = getAllSystemRecipes(customRecipes);

  // Direct match on id or mapped slug
  for (const r of all) {
    const rSlug = getRecipeSlug(r);
    if (rSlug === normalizedSlug || r.id.toLowerCase() === normalizedSlug) {
      return r;
    }
  }

  // Fallback title slug match
  for (const r of all) {
    if (slugify(r.title) === normalizedSlug) {
      return r;
    }
  }

  return null;
}

/**
 * Known fixed slugs for all tutorial videos.
 */
export const TUTORIAL_SLUG_MAP: Record<string, string> = {
  'tut-1': 'cara-merendam-biji-sorgum',
  'tut-2': 'rasio-air-masak-pulen',
  'tut-3': 'tepung-sorgum-bebas-gluten',
};

/**
 * Get canonical slug for a tutorial video.
 */
export function getTutorialSlug(tutorial: VideoTutorialItem): string {
  if (TUTORIAL_SLUG_MAP[tutorial.id]) {
    return TUTORIAL_SLUG_MAP[tutorial.id];
  }
  return slugify(tutorial.title || tutorial.id || 'tutorial');
}

/**
 * Find tutorial by its slug or ID.
 */
export function findTutorialBySlug(slug: string): VideoTutorialItem | null {
  if (!slug) return null;
  const normalizedSlug = slug.toLowerCase().trim();

  for (const tut of HOME_VIDEO_TUTORIALS) {
    const tutSlug = getTutorialSlug(tut);
    if (tutSlug === normalizedSlug || tut.id.toLowerCase() === normalizedSlug) {
      return tut;
    }
    if (slugify(tut.title) === normalizedSlug) {
      return tut;
    }
  }

  return null;
}

/**
 * Category slug mapping.
 */
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  'makanan_berat': 'makanan-berat',
  'camilan_sehat': 'camilan-sehat',
  'minuman_nutrisi': 'minuman-nutrisi',
  'dessert_rendah_gi': 'dessert-rendah-gi',
};

export const SLUG_TO_CATEGORY_MAP: Record<string, string> = {
  'makanan-berat': 'makanan_berat',
  'camilan-sehat': 'camilan_sehat',
  'minuman-nutrisi': 'minuman_nutrisi',
  'dessert-rendah-gi': 'dessert_rendah_gi',
};
