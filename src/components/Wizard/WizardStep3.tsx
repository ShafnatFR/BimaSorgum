import React, { useState } from 'react';
import { ArrowRight, Search, Plus, X, Check, Sparkles } from 'lucide-react';
import { DEFAULT_INGREDIENTS } from '../../data/mockData';

interface WizardStep3Props {
  selectedIngredientIds: string[];
  customIngredients: string[];
  onToggleIngredient: (id: string) => void;
  onAddCustomIngredient: (name: string) => void;
  onRemoveCustomIngredient: (name: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const WizardStep3: React.FC<WizardStep3Props> = ({
  selectedIngredientIds,
  customIngredients,
  onToggleIngredient,
  onAddCustomIngredient,
  onRemoveCustomIngredient,
  onPrevious,
  onNext,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [showMoreList, setShowMoreList] = useState(false);

  // 4 primary ingredients from the mockup
  const primaryIngredients = [
    {
      id: 'biji_sorgum',
      name: 'Biji Sorgum',
      iconEmoji: 'grain',
      materialIcon: 'grain',
    },
    {
      id: 'tepung_sorgum',
      name: 'Tepung Sorgum',
      iconEmoji: 'blur_on',
      materialIcon: 'blur_on',
    },
    {
      id: 'sayuran_hijau',
      name: 'Sayuran Hijau',
      iconEmoji: 'eco',
      materialIcon: 'eco',
    },
    {
      id: 'protein_ayam_telur',
      name: 'Protein Ayam/Telur',
      iconEmoji: 'egg',
      materialIcon: 'egg',
    },
  ];

  // Quick suggestions for additional ingredients
  const quickSuggestions = [
    'Bawang Merah',
    'Bawang Putih',
    'Santan',
    'Wortel',
    'Kecap Manis',
    'Minyak Kelapa',
    'Tempe',
    'Tahu',
    'Madu',
    'Daun Pandan',
    'Garam & Merica',
  ];

  const handleAddFromInput = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed && !customIngredients.includes(trimmed)) {
      onAddCustomIngredient(trimmed);
      setSearchInput('');
    }
  };

  const handleSelectQuickSuggestion = (item: string) => {
    if (!customIngredients.includes(item)) {
      onAddCustomIngredient(item);
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between max-w-md w-full mx-auto px-5 py-3 min-h-[calc(100vh-100px)]">
      <div>
        {/* Title and Subtitle */}
        <div className="text-center mt-2 mb-6">
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#163422] tracking-tight mb-2">
            Bahan apa saja yang tersedia?
          </h1>
          <p className="text-sm text-[#424843] leading-relaxed max-w-xs mx-auto">
            Pilih bahan yang ada di dapur Anda untuk rekomendasi resep terbaik.
          </p>
        </div>

        {/* 2x2 Grid of Main Ingredients */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {primaryIngredients.map((item) => {
            const isSelected = selectedIngredientIds.includes(item.id);

            return (
              <div
                key={item.id}
                id={`ingredient-${item.id}`}
                onClick={() => onToggleIngredient(item.id)}
                className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-center flex flex-col items-center justify-center min-h-[110px] bg-white ${
                  isSelected
                    ? 'border-[#f4be55] bg-white shadow-sm ring-1 ring-[#f4be55]'
                    : 'border-[#c2c8c0]/70 hover:border-[#163422]/40 hover:bg-[#f9f9f7]'
                }`}
              >
                {/* Yellow Checkmark Badge in Top Right */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#f4be55] text-[#271900] flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Circle Icon Container */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isSelected ? 'bg-[#163422] text-white' : 'bg-[#f4f4f2] text-[#163422]'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">
                    {item.materialIcon}
                  </span>
                </div>

                <span className="font-semibold text-sm text-[#1A1C1B]">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* "+ Lainnya..." button / expander */}
        <button
          type="button"
          onClick={() => setShowMoreList(!showMoreList)}
          className="w-full py-3.5 px-4 mb-4 rounded-2xl border border-[#c2c8c0]/70 bg-white hover:bg-[#f9f9f7] flex items-center justify-center gap-2 text-[#424843] font-medium text-sm transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-[#f4f4f2] flex items-center justify-center">
            <Plus className="w-4 h-4 text-[#163422]" />
          </div>
          <span>{showMoreList ? 'Sembunyikan Pilihan Bahan' : 'Lainnya...'}</span>
        </button>

        {/* Quick Suggestion List when expanded */}
        {showMoreList && (
          <div className="mb-4 p-3.5 rounded-2xl bg-white border border-[#c2c8c0]/60 space-y-2 animate-in fade-in duration-200">
            <p className="text-xs font-semibold text-[#727972] mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#7c5800]" />
              Rekomendasi Bahan Dapur Pelengkap:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickSuggestions.map((item) => {
                const isAdded = customIngredients.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectQuickSuggestion(item)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      isAdded
                        ? 'bg-[#163422] text-white shadow-xs'
                        : 'bg-[#f4f4f2] text-[#424843] hover:bg-[#e2e3e1]'
                    }`}
                  >
                    {item} {isAdded ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search / Add input field matching Image 9 */}
        <form onSubmit={handleAddFromInput} className="relative mb-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-[#727972] absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari atau tambah bahan lain..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#c2c8c0] rounded-xl text-sm text-[#1A1C1B] placeholder-[#727972] focus:outline-none focus:border-[#163422] focus:ring-1 focus:ring-[#163422] shadow-xs"
            />
            {searchInput.trim() && (
              <button
                type="submit"
                className="absolute right-2 px-2.5 py-1 bg-[#163422] text-white rounded-lg text-xs font-medium hover:bg-[#2d4b37]"
              >
                Tambah
              </button>
            )}
          </div>
        </form>

        {/* Removable Tag Chips matching Image 9: "Bawang Merah x", "Santan x" */}
        {customIngredients.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {customIngredients.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#afcfa9]/40 border border-[#afcfa9] text-[#163422] text-xs font-semibold"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCustomIngredient(item)}
                  className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#163422]/10 transition-colors"
                  aria-label={`Hapus ${item}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      <div className="pt-6 pb-4 flex items-center justify-between gap-4">
        <button
          id="btn-step3-prev"
          onClick={onPrevious}
          className="text-sm font-semibold text-[#163422] hover:underline px-3 py-2"
        >
          Sebelumnya
        </button>

        <button
          id="btn-step3-next"
          onClick={onNext}
          className="py-3.5 px-7 rounded-full font-semibold text-sm bg-[#163422] text-white hover:bg-[#2d4b37] active:scale-[0.98] transition-all shadow-md flex items-center gap-2"
        >
          <span>Selanjutnya</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
