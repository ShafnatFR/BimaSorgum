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
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  recipe?: Recipe;
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
