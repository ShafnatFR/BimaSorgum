import React from 'react';
import { DishCategoryId } from '../../types';
import { DISH_CATEGORIES } from '../../data/mockData';

interface WizardStep2Props {
  selectedCategory: DishCategoryId;
  onSelectCategory: (id: DishCategoryId) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const WizardStep2: React.FC<WizardStep2Props> = ({
  selectedCategory,
  onSelectCategory,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex flex-col flex-1 justify-between max-w-2xl w-full mx-auto px-4 md:px-6 pb-28">
      <div>
        {/* Title and Subtitle */}
        <div className="w-full text-center mt-4 md:mt-8 mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#1a1c1b] tracking-tight leading-tight">
            Apa jenis hidangan yang ingin dibuat?
          </h1>
          <p className="text-sm sm:text-base text-[#424843] mt-2.5 max-w-lg mx-auto leading-relaxed">
            Pilih kategori yang paling sesuai dengan kebutuhan santapan Anda.
          </p>
        </div>

        {/* Categories Grid (2 Columns) */}
        <div
          className="w-full grid grid-cols-2 gap-2.5 sm:gap-4 items-stretch"
          role="radiogroup"
          aria-label="Pilih jenis hidangan"
        >
          {DISH_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <label
                key={cat.id}
                id={`category-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className="group relative cursor-pointer block select-none"
              >
                <input
                  type="radio"
                  name="dish-category"
                  className="peer sr-only"
                  checked={isSelected}
                  onChange={() => onSelectCategory(cat.id)}
                />
                <div
                  className={`w-full border rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center justify-between transition-all duration-200 h-full ${
                    isSelected
                      ? 'bg-[#2d4b37] text-white border-[#2d4b37] shadow-sm'
                      : 'bg-white border-[#c2c8c0]/80 text-[#1a1c1b] hover:border-[#163422]/60 hover:bg-[#f9f9f7]'
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Centered Circle Icon */}
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3 transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#163422] text-white'
                          : 'bg-[#f4f4f2] text-[#163422]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[26px] sm:text-[30px]">
                        {cat.iconName}
                      </span>
                    </div>

                    <h3
                      className={`font-bold text-sm sm:text-base mb-1.5 ${
                        isSelected ? 'text-white' : 'text-[#163422]'
                      }`}
                    >
                      {cat.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isSelected ? 'text-white/80' : 'text-[#424843]'
                      }`}
                    >
                      {cat.description}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#f9f9f7] via-[#f9f9f7] to-transparent pt-8 z-30 flex justify-center">
        <div className="w-full max-w-2xl flex items-center gap-3">
          <button
            id="btn-step2-prev"
            onClick={onPrevious}
            className="w-1/3 py-4 px-4 rounded-full font-semibold text-sm sm:text-base border border-[#163422] text-[#163422] hover:bg-[#163422]/5 active:scale-[0.98] transition-all cursor-pointer text-center"
          >
            Sebelumnya
          </button>

          <button
            id="btn-step2-next"
            onClick={onNext}
            className="w-2/3 bg-[#163422] text-white hover:bg-[#304b2e] transition-colors py-4 rounded-full font-semibold text-sm sm:text-base shadow-md active:scale-[0.98] duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Selanjutnya</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
