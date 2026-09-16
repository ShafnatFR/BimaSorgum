import React from 'react';
import { RecipeSuggestion } from '../../types';
import { Utensils, DollarSign } from 'lucide-react';

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
    <div className="flex flex-col gap-2.5 w-full max-w-[85%] sm:max-w-[75%] mt-1">
      <span className="text-[11px] font-bold text-[#727972] uppercase tracking-wider px-1">
        Pilih resep alternatif:
      </span>
      {suggestions.map((s, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(s)}
          disabled={disabled}
          className="flex items-start gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#f4f4f2] border border-[#c2c8c0]/60 hover:border-[#163422]/50 text-left transition-all shadow-xs group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#cbebc3]/40 text-[#163422] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Utensils className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-sm text-[#163422] truncate">{s.title}</span>
              {s.estimatedCost > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#7c5800] bg-[#fdc65c]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
                  <DollarSign className="w-3 h-3" />
                  {formatCurrency(s.estimatedCost)}
                </span>
              )}
            </div>
            {s.description && (
              <p className="text-[11px] text-[#727972] mt-0.5 leading-relaxed line-clamp-2">{s.description}</p>
            )}
            {s.ingredients.length > 0 && (
              <p className="text-[10px] text-[#424843] mt-1 truncate">
                Bahan: {s.ingredients.join(', ')}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
