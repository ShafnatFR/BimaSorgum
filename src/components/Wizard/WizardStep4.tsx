import React, { useState } from 'react';
import { Sparkles, Utensils, Clock, Pencil } from 'lucide-react';
import { WizardFormData } from '../../types';

interface WizardStep4Props {
  formData: WizardFormData;
  onUpdateBudget: (budget: number) => void;
  onUpdatePrepTime: (time: string) => void;
  onPrevious: () => void;
  onGenerateRecipe: () => void;
  isLoading?: boolean;
}

const PRESET_BUDGETS = [5000, 10000, 15000, 20000, 25000];
const PRESET_TIMES = ['Maks 15 Menit', 'Maks 30 Menit', 'Maks 45 Menit', 'Fleksibel'];
const CUSTOM_PREP = '__custom__';

export const WizardStep4: React.FC<WizardStep4Props> = ({
  formData,
  onUpdateBudget,
  onUpdatePrepTime,
  onPrevious,
  onGenerateRecipe,
  isLoading = false,
}) => {
  // Detect whether current value came from a custom input
  const isCustomBudget = !PRESET_BUDGETS.includes(formData.budgetPerPortion);
  const isCustomPrep = !PRESET_TIMES.includes(formData.prepTimeLimit);
  const [prepChoice, setPrepChoice] = useState<string>(isCustomPrep ? CUSTOM_PREP : formData.prepTimeLimit);
  const [budgetDraft, setBudgetDraft] = useState<string>(isCustomBudget ? String(formData.budgetPerPortion) : '');

  const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const selectBudget = (val: number) => {
    setBudgetDraft('');
    onUpdateBudget(val);
  };

  const handleBudgetDraft = (raw: string) => {
    const digits = raw.replace(/[^\d]/g, '').slice(0, 7);
    setBudgetDraft(digits);
    const n = Number(digits);
    if (digits && Number.isFinite(n) && n > 0) onUpdateBudget(n);
  };

  const selectPrep = (val: string) => {
    setPrepChoice(val);
    if (val !== CUSTOM_PREP) onUpdatePrepTime(val);
    else onUpdatePrepTime('');
  };

  const handlePrepDraft = (raw: string) => {
    const n = raw.replace(/[^\d]/g, '').slice(0, 3);
    const parsed = parseInt(n, 10);
    if (n && Number.isFinite(parsed) && parsed > 0) {
      onUpdatePrepTime(`Maks ${parsed} Menit`);
    }
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
            Pilih target biaya atau ketik nominal sendiri sesuai kebutuhan.
          </p>
        </div>

        {/* Budget Display Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#c2c8c0]/60 shadow-earthy-glow mb-6">
          <div className="text-center mb-4">
            <span className="text-xs font-semibold text-[#727972] uppercase tracking-wider block mb-1">
              Target Modal
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#163422] tracking-tight">
              {formatCurrency(formData.budgetPerPortion)}
            </div>
          </div>

          {/* Custom Slider */}
          <div className="px-2 mb-5">
            <div className="relative flex items-center">
              <input
                id="budget-slider"
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={Math.min(Math.max(formData.budgetPerPortion, 5000), 25000)}
                onChange={(e) => selectBudget(Number(e.target.value))}
                className="w-full h-2.5 bg-[#afcfa9]/40 rounded-lg appearance-none cursor-pointer focus:outline-none"
              />
            </div>
            <div className="flex justify-between items-center text-xs font-medium text-[#727972] mt-2">
              <span>Rp 5.000</span>
              <span>Rp 15.000</span>
              <span>Rp 25.000</span>
            </div>
          </div>

          {/* Preset budget chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_BUDGETS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => selectBudget(b)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  formData.budgetPerPortion === b && !isCustomBudget
                    ? 'bg-[#163422] text-white'
                    : 'bg-[#f4f4f2] text-[#424843] hover:bg-[#e2e3e1]'
                }`}
              >
                {formatCurrency(b)}
              </button>
            ))}
          </div>

          {/* Custom budget input */}
          <div className="flex items-center gap-2 bg-[#f9f9f7] border border-[#c2c8c0]/70 rounded-2xl p-3">
            <Pencil className="w-4 h-4 text-[#163422] flex-shrink-0" />
            <span className="text-xs font-bold text-[#727972] flex-shrink-0">Isi sendiri:</span>
            <div className="flex items-center flex-1 bg-white rounded-xl border border-[#c2c8c0]/60 px-3 py-1.5 focus-within:border-[#163422]">
              <span className="text-sm font-bold text-[#424843] mr-1">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="cth: 12500"
                value={isCustomBudget ? String(formData.budgetPerPortion) : budgetDraft}
                onChange={(e) => handleBudgetDraft(e.target.value)}
                className="w-full bg-transparent outline-none text-sm font-semibold text-[#1A1C1B] placeholder-[#b0b5af]"
              />
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
                  {formData.prepTimeLimit || '— (isi sendiri)'}
                </span>
              </div>
            </div>

            {/* Quick time selection */}
            <select
              value={prepChoice}
              onChange={(e) => selectPrep(e.target.value)}
              className="text-xs font-semibold bg-white border border-[#c2c8c0] text-[#163422] rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              {PRESET_TIMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
              <option value={CUSTOM_PREP}>Isi sendiri (menit)...</option>
            </select>
          </div>

          {/* Custom prep time input appears when chosen */}
          {prepChoice === CUSTOM_PREP && (
            <div className="flex items-center gap-2 bg-white border border-[#c2c8c0]/60 rounded-2xl p-3">
              <Clock className="w-4 h-4 text-[#163422] flex-shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="cth: 20"
                value={isCustomPrep ? formData.prepTimeLimit.replace(/\D/g, '') : ''}
                onChange={(e) => handlePrepDraft(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm font-semibold text-[#1A1C1B] placeholder-[#b0b5af]"
              />
              <span className="text-xs font-bold text-[#727972] flex-shrink-0">menit</span>
            </div>
          )}
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
          disabled={isLoading || (prepChoice === CUSTOM_PREP && !isCustomPrep)}
          className="flex-1 py-3.5 px-4 rounded-2xl font-semibold text-sm bg-[#163422] text-white hover:bg-[#2d4b37] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 text-center disabled:opacity-50"
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
