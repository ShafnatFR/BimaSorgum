import { detectIngredientConflicts } from './recipeGuard';

/**
 * Pre-generation sanity check: hanya deteksi kombinasi bahan yang tidak logis.
 */

export interface IngredientIssue {
  name: string;
  kind: 'conflict';
  reason: string;
}

export interface PreflightResult {
  ok: boolean;
  issues: IngredientIssue[];
}

/** Ekstrak kandidat nama bahan dari teks bebas (dipisah koma/dan). */
function extractNames(text: string): string[] {
  return text
    .split(/[,;\n]+|\b dan \b/gi)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}

export function preflightPrompt(prompt: string): PreflightResult {
  const names = extractNames(prompt);
  const conflicts = detectIngredientConflicts(names);
  if (conflicts.length === 0) return { ok: true, issues: [] };
  return {
    ok: false,
    issues: conflicts.map((reason) => ({
      name: reason,
      kind: 'conflict' as const,
      reason,
    })),
  };
}
