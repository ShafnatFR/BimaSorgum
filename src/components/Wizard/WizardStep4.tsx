import React from 'react';
import { Sparkles, Utensils, Clock } from 'lucide-react';
import { WizardFormData } from '../../types';

interface WizardStep4Props {
  formData: WizardFormData;
  onUpdateBudget: (budget: number) => void;
  onUpdatePrepTime: (time: string) => void;
  onPrevious: () => void;
  onGenerateRecipe: () => void;
  isLoading?: boolean;
}

export const WizardStep4: React.FC<WizardStep4Props> = ({
  formData,
  onUpdateBudget,
  onUpdatePrepTime,
  onPrevious,
  onGenerateRecipe,
  isLoading = false,
}) => {
  const formatCurrency = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'makanan_berat':
        return 'Makan Siang / Malam Padat Gizi';
      case 'camilan_sehat':
        return 'Camilan Sehat & Bergizi';
      case 'minuman_nutrisi':
        return 'Minuman Nutrisi Segar';
      case 'dessert_rendah_gi':
        return 'Dessert Sehat Rendah Gula (Low GI)';
      default:
        return 'Makanan Sehat Berbasis Sorgum';
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-between max-w-md w-full mx-auto px-5 py-4 min-h-[calc(100vh-100px)]">
      <div>
        {/* Title & Subtitle */}
        <div className="text-center mt-2 mb-8">
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#163422] tracking-tight mb-3">
            Berapa anggaran modal per porsi?
          </h1>
          <p className="text-sm text-[#424843] leading-relaxed max-w-xs mx-auto">
            Pilih target biaya yang sesuai untuk memastikan resep ekonomis.
          </p>
        </div>

        {/* Budget Display Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#c2c8c0]/60 shadow-earthy-glow mb-6">
          <div className="text-center mb-6">
            <span className="text-xs font-semibold text-[#727972] uppercase tracking-wider block mb-1">
              Target Modal
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#163422] tracking-tight">
              {formatCurrency(formData.budgetPerPortion)}
            </div>
          </div>

          {/* Custom Slider */}
          <div className="px-2 mb-4">
            <div className="relative flex items-center">
              <input
                id="budget-slider"
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={formData.budgetPerPortion}
                onChange={(e) => onUpdateBudget(Number(e.target.value))}
                className="w-full h-2.5 bg-[#afcfa9]/40 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-[#727972] mt-2">
              <span>Rp 5.000</span>
              <span>Rp 15.000</span>
              <span>Rp 25.000</span>
            </div>
          </div>
        </div>

        {/* Pilihan Sebelumnya Card */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-[#163422] block px-1">
            Pilihan Sebelumnya:
          </span>

          {/* Tipe Hidangan */}
          <div className="bg-[#f4f4f2]/80 rounded-2xl p-3.5 flex items-center gap-3.5 border border-[#e2e3e1]">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#163422] shadow-xs">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-[#727972] block">Tipe Hidangan</span>
              <span className="font-semibold text-sm text-[#1A1C1B]">
                {getCategoryTitle(formData.dishCategory)}
              </span>
            </div>
          </div>

          {/* Waktu Persiapan */}
          <div className="bg-[#f4f4f2]/80 rounded-2xl p-3.5 flex items-center justify-between border border-[#e2e3e1]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#163422] shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#727972] block">Waktu Persiapan</span>
                <span className="font-semibold text-sm text-[#1A1C1B]">
                  {formData.prepTimeLimit}
                </span>
              </div>
            </div>

            {/* Quick time selection toggle */}
            <select
              value={formData.prepTimeLimit}
              onChange={(e) => onUpdatePrepTime(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#c2c8c0] text-[#163422] rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="Maks 15 Menit">Maks 15 Menit</option>
              <option value="Maks 30 Menit">Maks 30 Menit</option>
              <option value="Maks 45 Menit">Maks 45 Menit</option>
              <option value="Fleksibel">Fleksibel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Buttons matching Image 11 */}
      <div className="pt-8 pb-4 flex items-center gap-3">
        <button
          id="btn-step4-prev"
          onClick={onPrevious}
          className="flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm border border-[#163422] text-[#163422] hover:bg-[#163422]/5 active:scale-[0.98] transition-all text-center"
        >
          Sebelumnya
        </button>

        <button
          id="btn-step4-generate"
          onClick={onGenerateRecipe}
          disabled={isLoading}
          className="flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm bg-[#163422] text-white hover:bg-[#2d4b37] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-center"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyiapkan...
            </span>
          ) : (
            <>
              <span>Generate Resep</span>
              <Sparkles className="w-4 h-4 text-[#fdc65c]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
