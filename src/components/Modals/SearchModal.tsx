import React, { useState } from 'react';
import { X, Search, Sparkles, ChefHat } from 'lucide-react';
import { Recipe } from '../../types';
import { HOME_CATEGORIES } from '../../data/homeData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
  onSearchQuery: (query: string) => void;
  recipes: Recipe[]; // full catalog from Supabase
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  onSearchQuery,
  recipes,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const allAvailableRecipes: Recipe[] = recipes;

  const filteredRecipes = allAvailableRecipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.dishCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const quickKeywords = [
    'Nasi Goreng',
    'Bebas Gluten',
    'Low GI',
    'Pancake',
    'Roti Sorgum',
    'Budget 10 Ribu',
    'Anak SD',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C1B]/70 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-[#e2e3e1] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#727972] flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari resep, bahan, atau kebutuhan diet..."
            autoFocus
            className="flex-1 text-sm sm:text-base outline-none text-[#1A1C1B] placeholder-[#727972]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchTerm.trim()) {
                onSearchQuery(searchTerm.trim());
                onClose();
              }
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="p-1 rounded-full text-[#727972] hover:bg-[#f4f4f2]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-bold text-[#163422] px-2 py-1 rounded-lg hover:bg-[#f4f4f2]"
          >
            Batal
          </button>
        </div>

        {/* Quick keywords */}
        <div className="px-4 py-2.5 bg-[#f9f9f7] border-b border-[#e2e3e1] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#727972] flex-shrink-0">
            Saran:
          </span>
          {quickKeywords.map((kw, i) => (
            <button
              key={i}
              onClick={() => setSearchTerm(kw)}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white border border-[#e2e3e1] text-[#424843] hover:border-[#163422] whitespace-nowrap"
            >
              {kw}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {searchTerm ? (
            filteredRecipes.length > 0 ? (
              filteredRecipes.map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => {
                    onSelectRecipe(rec);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#f9f9f7] border border-[#e2e3e1] cursor-pointer transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#f4f4f2] overflow-hidden flex-shrink-0">
                    <img
                      src={rec.imageUrl}
                      alt={rec.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#163422] truncate">
                      {rec.title}
                    </h4>
                    <span className="text-[11px] text-[#727972]">
                      {rec.dishCategory} • Rp {rec.estimatedCost.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#163422] flex items-center gap-1">
                    Lihat →
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 space-y-3">
                <ChefHat className="w-10 h-10 text-[#c2c8c0] mx-auto" />
                <p className="text-xs text-[#727972]">
                  Tidak ada resep lokal tersimpan untuk &ldquo;{searchTerm}&rdquo;.
                </p>
                <button
                  onClick={() => {
                    onSearchQuery(`Buatkan resep sorgum kreatif dengan kata kunci: ${searchTerm}`);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#163422] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#fdc65c]" />
                  Tanyakan pada AI Generator
                </button>
              </div>
            )
          ) : (
            <div className="space-y-3 py-2">
              <span className="text-xs font-bold text-[#163422] uppercase tracking-wider block">
                Kategori Populer
              </span>
              <div className="grid grid-cols-2 gap-2">
                {HOME_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSearchTerm(cat.name)}
                    className="p-2.5 rounded-xl border border-[#e2e3e1] text-left hover:border-[#163422] hover:bg-[#f9f9f7] transition-all flex items-center justify-between"
                  >
                    <span className="font-bold text-xs text-[#163422]">
                      {cat.name}
                    </span>
                    <span className="text-[11px] text-[#727972]">
                      {cat.nameId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
