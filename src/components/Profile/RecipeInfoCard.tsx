import React from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Recipe } from '../../types';

interface RecipeInfoCardProps {
  recipe: Recipe;
  saveCount?: number;
  commentCount?: number;
  onClick: () => void;
  /** Bila diisi, ikon hati jadi tombol "hapus dari tersimpan". */
  onRemoveSaved?: () => void;
}

/** Kartu resep tanpa gambar: judul, deskripsi, Nutrition Facts, save & komentar. */
export const RecipeInfoCard: React.FC<RecipeInfoCardProps> = ({
  recipe,
  saveCount,
  commentCount,
  onClick,
  onRemoveSaved,
}) => {
  const n = recipe.nutritionHighlight;
  const description = recipe.subtitle || n?.description || '';
  const facts = [
    { label: 'Kalori', value: n?.caloriesEstimate != null ? `${n.caloriesEstimate} kkal` : null },
    { label: 'Protein', value: n?.proteinGrams != null ? `${n.proteinGrams} g` : null },
    { label: 'Serat', value: n?.fiberGrams != null ? `${n.fiberGrams} g` : null },
    { label: 'Indeks Glikemik', value: n?.glycemicIndex ?? null },
  ].filter((f) => f.value);

  const saves = (
    <>
      <Heart className="w-4 h-4 fill-red-600 text-red-600" />
      {saveCount ?? 0}
    </>
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_4px_12px_rgba(45,75,55,0.06)] border border-[#2d4b37]/10 group cursor-pointer hover:shadow-md transition-all"
    >
      <h3 className="text-sm font-bold text-[#1a1c1b] leading-snug line-clamp-2 group-hover:text-[#163422]">
        {recipe.title}
      </h3>
      {description && (
        <p className="text-xs text-[#424843] leading-relaxed line-clamp-3">{description}</p>
      )}
      {facts.length > 0 && (
        <div className="rounded-xl bg-[#f4f4f2] px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#163422] mb-1">
            Nutrition Facts
          </p>
          <dl className="space-y-0.5">
            {facts.map((f) => (
              <div key={f.label} className="flex justify-between gap-2 text-[11px]">
                <dt className="text-[#727972]">{f.label}</dt>
                <dd className="font-bold text-[#1a1c1b] text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <div className="mt-auto flex items-center gap-4 pt-1 border-t border-[#c2c8c0]/30">
        {onRemoveSaved ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveSaved();
            }}
            className="inline-flex items-center gap-1 pt-2 text-[11px] font-bold text-[#424843] hover:text-[#ba1a1a] cursor-pointer"
            title="Hapus dari tersimpan"
            aria-label="Hapus dari tersimpan"
          >
            {saves}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 pt-2 text-[11px] font-bold text-[#424843]" title="Disimpan">
            {saves}
          </span>
        )}
        <span className="inline-flex items-center gap-1 pt-2 text-[11px] font-bold text-[#424843]" title="Komentar">
          <MessageCircle className="w-4 h-4 text-[#163422]" />
          {commentCount ?? 0}
        </span>
      </div>
    </div>
  );
};
