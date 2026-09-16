import React from 'react';
import { RecipeSuggestion } from '../../types';
import { Utensils, DollarSign, Clock, X, ChevronRight } from 'lucide-react';

interface RecipeSuggestionButtonsProps {
  suggestions: RecipeSuggestion[];
  onSelect: (suggestion: RecipeSuggestion) => void;
  disabled?: boolean;
}

export const RecipeSuggestionButtons: React.FC<RecipeSuggestionButtonsProps> = ({
  suggestions,
  onSelect,
  disabled = false,
}) => {
  if (!suggestions.length) return null;

  const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <div className="flex flex-col gap-3 w-full max-w-[85%] sm:max-w-[75%] mt-1">
      <span className="text-[11px] font-bold text-[#727972] uppercase tracking-wider px-1">
        Pilih resep alternatif:
      </span>
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="flex flex-col gap-2.5 p-4 rounded-2xl bg-white hover:bg-[#f4f4f2] border border-[#c2c8c0]/60 hover:border-[#163422]/50 text-left transition-all shadow-xs group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {/* Header: title + cost + time */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#cbebc3]/40 text-[#163422] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm text-[#163422] block">{s.title}</span>
                {s.description && (
                  <p className="text-[11px] text-[#727972] mt-0.5 leading-relaxed">{s.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {s.estimatedCost > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#7c5800] bg-[#fdc65c]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(s.estimatedCost)}
                </span>
              )}
              {s.estimatedTimeMinutes && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#424843] bg-[#f4f4f2] px-2 py-0.5 rounded-full whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  ~{s.estimatedTimeMinutes} mnt
                </span>
              )}
            </div>
          </div>

          {/* Ingredient list with prices */}
          {s.ingredientPrices && s.ingredientPrices.length > 0 && (
            <div className="bg-[#f9f9f7] rounded-xl p-2.5 border border-[#e2e3e1]">
              <span className="text-[10px] font-bold text-[#727972] uppercase tracking-wider block mb-1.5">
                Rincian Bahan:
              </span>
              <ul className="space-y-0.5">
                {s.ingredientPrices.map((ip, i) => (
                  <li key={i} className="text-[11px] text-[#424843] flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[#163422] flex-shrink-0" />
                    {ip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Removed ingredients */}
          {s.removedIngredients && s.removedIngredients.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-[#ba1a1a]/70 uppercase tracking-wider">
                Dihapus:
              </span>
              {s.removedIngredients.map((ri, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#ba1a1a]/80 bg-[#ffdad6]/30 px-2 py-0.5 rounded-full">
                  <X className="w-2.5 h-2.5" />
                  {ri}
                </span>
              ))}
            </div>
          )}

          {/* CTA arrow */}
          <div className="flex items-center justify-end">
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#163422] opacity-0 group-hover:opacity-100 transition-opacity">
              Gunakan resep ini <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
