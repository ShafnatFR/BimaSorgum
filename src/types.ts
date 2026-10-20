export type TargetConsumerId =
  | 'anak_sd'
  | 'siswa_smp'
  | 'siswa_sma'
  | 'dewasa_lansia'
  | 'balita'
  | 'anak_sekolah'
  | 'remaja_dewasa'
  | 'lansia';

export type DishCategoryId = 'makanan_berat' | 'camilan_sehat' | 'minuman_nutrisi' | 'dessert_rendah_gi';

export interface TargetConsumerOption {
  id: TargetConsumerId;
  label: string;
  subLabel?: string;
  iconName: string; // Material symbol or Lucide icon
}

export interface DishCategoryOption {
  id: DishCategoryId;
  title: string;
  description: string;
  iconName: string;
}

export interface IngredientItem {
  id: string;
  name: string;
  category: 'utama' | 'sayur' | 'protein' | 'bumbu' | 'pelengkap';
  iconName: string;
  defaultPrice: number;
  unit: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  estimatedPrice: number;
  notes?: string;
}

export interface RecipeStep {
  stepNumber: number;
  title: string;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface NutritionHighlight {
  title: string;
  description: string;
  fiberGrams?: number;
  proteinGrams?: number;
  glycemicIndex?: 'Rendah (Low GI)' | 'Sedang' | 'Sangat Rendah';
  caloriesEstimate?: number;
}

export interface Recipe {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  targetAge: string;
  dishCategory: string;
  targetBudget: number;
  estimatedCost: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  nutritionHighlight: NutritionHighlight;
  steps: RecipeStep[];
  imageUrl?: string;
  /** "<menu-key>#<indeks foto>" — dipakai resolver untuk menyebar pemakaian foto */
  imageKey?: string;
  /** atribusi foto (judul menu · author · lisensi · sumber) */
  imageCredit?: string;
  imagePage?: string;
  tags: string[];
  createdAt: string;
  /** false = private (only visible to owner); true = public in Explore */
  isPublished?: boolean;
  /** whether this recipe can be published (owner's own generated recipe) */
  canPublish?: boolean;
  /** validation/robustness issues surfaced to the UI (see recipeGuard.ts) */
  aiWarnings?: { level: 'warning' | 'error'; message: string }[];
  /** full explanation text when the AI declined the request (illogical/price) */
  aiRefusalText?: string;
}

/** AI's recipe suggestion when it refuses nonsensical input. */
export interface RecipeSuggestion {
  title: string;
  ingredients: string[];
  estimatedCost: number;
  description: string;
  /** Individual ingredient prices, e.g. ["Tepung sorgum: Rp2.500", "Susu: Rp3.000"] */
  ingredientPrices?: string[];
  /** Estimated total cooking time in minutes */
  estimatedTimeMinutes?: number;
  /** Which ingredients from the original request were removed/changed */
  removedIngredients?: string[];
}

/** Structured refusal from the AI (un-payload). */
export interface AiRefusalResponse {
  type: 'refusal';
  message: string;
  flaggedIngredients: string[];
  suggestions: RecipeSuggestion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  recipe?: Recipe;
  /** When the AI refused (nonsensical ingredients), show suggestions as buttons. */
  refusalSuggestions?: RecipeSuggestion[];
  /** True when the AI refused but provided no actionable suggestions — show retry. */
  refusalNoSuggestions?: boolean;
  timestamp: string;
  isTypingStep?: boolean;
  typingText?: string;
}

export interface SavedRecipe {
  id: string;
  recipe: Recipe;
  savedAt: string;
  isFavorite?: boolean;
  notes?: string;
}

export interface WizardFormData {
  targetConsumers: TargetConsumerId[];
  dishCategory: DishCategoryId;
  selectedIngredientIds: string[];
  customIngredients: string[];
  budgetPerPortion: number;
  prepTimeLimit: string;
  notes?: string;
}
