import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type { Recipe, SavedRecipe } from '../types';
import {
  ensureAnonymousSession,
  fetchRecipes,
  fetchSavedRecipes,
  fetchSavedRecipeIds,
  saveRecipeForUser,
  unsaveRecipeForUser,
  upsertRecipe,
  fetchRecipeBySlug,
} from './supabase';

interface DataContextValue {
  ready: boolean;
  recipes: Recipe[]; // full catalog
  savedRecipes: SavedRecipe[];
  savedIds: Set<string>;
  // derived category collection helpers
  recipesByCategory: (key: string) => Recipe[];
  getRecipeBySlug: (slug: string) => Recipe | null;
  getRecipeById: (id: string) => Recipe | null;
  toggleSave: (recipe: Recipe) => Promise<boolean>;
  isSavedForRecipe: (recipe: Recipe) => boolean;
  generateAndSave: (recipe: Recipe) => Promise<Recipe | null>;
  refetchSaved: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const loadCatalog = useCallback(async () => {
    const data = await fetchRecipes();
    setRecipes(data);
    setReady(true);
  }, []);

  const refetchSaved = useCallback(async () => {
    const [saved, ids] = await Promise.all([fetchSavedRecipes(), fetchSavedRecipeIds()]);
    setSavedRecipes(saved);
    setSavedIds(ids);
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([loadCatalog(), refetchSaved()]);
  }, [loadCatalog, refetchSaved]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await ensureAnonymousSession();
      if (!alive) return;
      await Promise.all([loadCatalog(), refetchSaved()]);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recipesByCategory = useCallback(
    (key: string) => {
      if (!key || key === 'all') return recipes;
      return recipes.filter((r) => categoryLabelToKey(r.dishCategory) === key);
    },
    [recipes]
  );

  const getRecipeBySlug = useCallback(
    (slug: string) => recipes.find((r) => r.slug === slug) || null,
    [recipes]
  );

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id) || null,
    [recipes]
  );

  const isSavedForRecipe = useCallback(
    (recipe: Recipe) => {
      if (savedRecipes.some((s) => s.recipe.slug === recipe.slug)) return true;
      return savedIds.has(recipe.id);
    },
    [savedRecipes, savedIds]
  );

  const toggleSave = useCallback(
    async (recipe: Recipe) => {
      const isSaved = isSavedForRecipe(recipe);
      // Resolve the db uuid for this recipe (from catalog or the recipe itself)
      const dbRecipe = getRecipeById(recipe.id) || getRecipeBySlug(recipe.slug || '') || recipe;
      const recipeId = dbRecipe.id || recipe.id;
      if (isSaved) {
        const ok = await unsaveRecipeForUser(recipeId);
        if (ok) await refetchSaved();
        return !ok; // returns new state if success
      } else {
        const ok = await saveRecipeForUser(recipeId);
        if (ok) await refetchSaved();
        return ok;
      }
    },
    [getRecipeById, getRecipeBySlug, isSavedForRecipe, refetchSaved]
  );

  const generateAndSave = useCallback(
    async (recipe: Recipe) => {
      const stored = await upsertRecipe(recipe);
      if (stored) {
        setRecipes((prev) => [stored, ...prev.filter((r) => r.slug !== stored.slug)]);
      }
      return stored;
    },
    []
  );

  const value = useMemo<DataContextValue>(
    () => ({
      ready,
      recipes,
      savedRecipes,
      savedIds,
      recipesByCategory,
      getRecipeBySlug,
      getRecipeById,
      toggleSave,
      isSavedForRecipe,
      generateAndSave,
      refetchSaved,
      refresh,
    }),
    [
      ready,
      recipes,
      savedRecipes,
      savedIds,
      recipesByCategory,
      getRecipeBySlug,
      getRecipeById,
      toggleSave,
      isSavedForRecipe,
      generateAndSave,
      refetchSaved,
      refresh,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function categoryLabelToKey(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('camilan')) return 'camilan_sehat';
  if (l.includes('minuman')) return 'minuman_nutrisi';
  if (l.includes('dessert') || l.includes('rendah gi')) return 'dessert_rendah_gi';
  return 'makanan_berat';
}

export { fetchRecipeBySlug };