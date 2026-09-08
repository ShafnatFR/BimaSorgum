import React, { useState } from 'react';
import { Recipe, SavedRecipe } from '../../types';
import { GLOBAL_FALLBACK_FOOD_IMAGE } from '../../data/imageAssets';
import { 
  Bookmark, 
  BookmarkCheck, 
  ChefHat, 
  Clock, 
  Sparkles, 
  Copy, 
  Share2, 
  Check, 
  Flame, 
  Wheat, 
  DollarSign, 
  Play,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CardImageWithSkeleton } from '../Common/CardSkeleton';

interface RecipeCardViewProps {
  recipe: Recipe;
  isTyping?: boolean;
  typingText?: string;
  isSaved: boolean;
  onToggleSave: (recipe: Recipe) => void;
  onOpenCookMode: (recipe: Recipe) => void;
}

export const RecipeCardView: React.FC<RecipeCardViewProps> = ({
  recipe,
  isTyping = false,
  typingText = 'Sedang menulis langkah memasak...',
  isSaved,
  onToggleSave,
  onOpenCookMode,
}) => {
  const [portionMultiplier, setPortionMultiplier] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showFullSteps, setShowFullSteps] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const formatRupiah = (amount: number) => {
    return `Rp ${(amount * portionMultiplier).toLocaleString('id-ID')}`;
  };

  const totalCalculatedCost = recipe.ingredients.reduce(
    (sum, ing) => sum + ing.estimatedPrice * portionMultiplier,
    0
  );

  const handleSaveClick = () => {
    onToggleSave(recipe);
    if (!isSaved) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#163422', '#7c5800', '#f4be55', '#afcfa9'],
      });
    }
  };

  const handleCopyRecipe = () => {
    const text = `${recipe.title}\n\n${recipe.subtitle}\n\nBahan-bahan:\n${recipe.ingredients
      .map((i) => `- ${i.name} (${formatRupiah(i.estimatedPrice)})`)
      .join('\n')}\n\nNutrisi: ${recipe.nutritionHighlight.description}\n\nLangkah Memasak:\n${recipe.steps
      .map((s) => `${s.stepNumber}. ${s.title}: ${s.instruction}`)
      .join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakRecipe = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      `${recipe.title}. ${recipe.subtitle}. Nutrisi unggulan: ${recipe.nutritionHighlight.description}. Langkah pertama: ${recipe.steps[0]?.instruction || ''}`
    );
    utterance.lang = 'id-ID';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="text-[#1A1C1B] max-w-[95%] md:max-w-[90%] space-y-4 font-['Manrope',sans-serif]">
      {/* Recipe Preview Banner */}
      <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden shadow-xs border border-[#e2e3e1] bg-[#e8eae6]">
        <CardImageWithSkeleton
          src={recipe.imageUrl || GLOBAL_FALLBACK_FOOD_IMAGE}
          alt={recipe.title}
          fallbackSrc={GLOBAL_FALLBACK_FOOD_IMAGE}
          containerClassName="w-full h-full relative"
          imageClassName="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-[#163422]/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1 z-20">
          <Sparkles className="w-3 h-3 text-[#fdc65c]" />
          <span>{recipe.dishCategory || 'Menu Sehat'}</span>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div>
        <h2 className="text-2xl sm:text-[26px] font-bold text-[#163422] tracking-tight leading-snug">
          {recipe.title}
        </h2>
        <p className="text-sm sm:text-base text-[#424843] mt-1.5 leading-relaxed">
          {recipe.subtitle}
        </p>
      </div>

      {/* BAHAN-BAHAN Breakdown (Estimasi Rp ...) */}
      <div className="space-y-2 bg-white rounded-2xl p-4 border border-[#e2e3e1] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#424843] uppercase tracking-wider">
            BAHAN-BAHAN (ESTIMASI {formatRupiah(recipe.estimatedCost)}):
          </h3>
          
          {/* Stepper Porsi */}
          <div className="flex items-center gap-1.5 bg-[#f4f4f2] px-2 py-0.5 rounded-full border border-[#e2e3e1]">
            <span className="text-[11px] font-bold text-[#727972]">Porsi:</span>
            <button
              onClick={() => setPortionMultiplier((p) => Math.max(1, p - 1))}
              className="w-5 h-5 rounded-full bg-white text-[#163422] font-bold text-xs shadow-xs flex items-center justify-center hover:bg-[#e2e3e1]"
            >
              -
            </button>
            <span className="text-xs font-bold text-[#163422] px-1">{portionMultiplier}x</span>
            <button
              onClick={() => setPortionMultiplier((p) => Math.min(5, p + 1))}
              className="w-5 h-5 rounded-full bg-[#163422] text-white font-bold text-xs shadow-xs flex items-center justify-center hover:bg-[#2d4b37]"
            >
              +
            </button>
          </div>
        </div>

        <ul className="space-y-1.5 pt-1">
          {recipe.ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-start justify-between text-sm sm:text-base text-[#1A1C1B] gap-2">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#163422] mt-2 flex-shrink-0" />
                <span>{ing.name}</span>
              </div>
              <span className="font-semibold text-xs text-[#163422] whitespace-nowrap bg-[#f9f9f7] px-2 py-0.5 rounded-md">
                {formatRupiah(ing.estimatedPrice)}
              </span>
            </li>
          ))}
        </ul>

        <div className="pt-2 border-t border-[#f4f4f2] flex justify-between items-center text-xs text-[#424843]">
          <span>Total Estimasi Belanja:</span>
          <span className="font-bold text-sm text-[#163422]">
            {formatRupiah(recipe.estimatedCost)}
          </span>
        </div>
      </div>

      {/* Nutrisi Unggulan Card matching mockup */}
      <div className="p-3.5 bg-[#afcfa9]/20 rounded-2xl border border-[#afcfa9]/40 space-y-1">
        <h3 className="font-bold text-xs sm:text-sm text-[#163422] flex items-center gap-1.5">
          <span className="material-symbols-outlined text-base text-[#163422]">
            nutrition
          </span>
          {recipe.nutritionHighlight.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#424843] leading-relaxed">
          {recipe.nutritionHighlight.description}
        </p>

        {/* Nutritional metric pills */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          {recipe.nutritionHighlight.fiberGrams && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#163422] text-xs font-semibold shadow-xs">
              <Wheat className="w-3 h-3 text-[#7c5800]" />
              Serat: {recipe.nutritionHighlight.fiberGrams}g
            </span>
          )}
          {recipe.nutritionHighlight.glycemicIndex && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#163422] text-xs font-semibold shadow-xs">
              <Sparkles className="w-3 h-3 text-[#163422]" />
              GI: {recipe.nutritionHighlight.glycemicIndex}
            </span>
          )}
          {recipe.prepTimeMinutes && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#163422] text-xs font-semibold shadow-xs">
              <Clock className="w-3 h-3 text-[#424843]" />
              Masak: {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mnt
            </span>
          )}
        </div>
      </div>

      {/* Langkah-langkah Memasak (Cook Steps) */}
      <div className="bg-white rounded-2xl p-4 border border-[#e2e3e1] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#163422] uppercase tracking-wider flex items-center gap-1.5">
            <ChefHat className="w-4 h-4 text-[#163422]" />
            Langkah-Langkah Memasak
          </h3>
          <button
            onClick={() => setShowFullSteps(!showFullSteps)}
            className="text-xs font-semibold text-[#7c5800] hover:underline"
          >
            {showFullSteps ? 'Ringkas' : 'Lihat Semua'}
          </button>
        </div>

        {showFullSteps && (
          <div className="space-y-3 pt-1">
            {recipe.steps.map((step) => (
              <div key={step.stepNumber} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#163422] text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step.stepNumber}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs sm:text-sm text-[#1A1C1B]">
                      {step.title}
                    </span>
                    {step.timerMinutes && (
                      <span className="text-[11px] font-mono text-[#727972] bg-[#f4f4f2] px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{step.timerMinutes} mnt
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#424843] leading-relaxed">
                    {step.instruction}
                  </p>
                  {step.tip && (
                    <p className="text-[11px] text-[#7c5800] bg-[#fdc65c]/15 px-2.5 py-1 rounded-lg italic">
                      💡 Tips: {step.tip}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Typing indicator matching Image 5 & 13 if in progress */}
      {isTyping && (
        <div className="flex items-center gap-1.5 text-[#163422] py-1">
          <span className="w-1.5 h-1.5 bg-[#163422] rounded-full animate-bounce"></span>
          <span className="w-1.5 h-1.5 bg-[#163422] rounded-full animate-bounce [animation-delay:0.2s]"></span>
          <span className="w-1.5 h-1.5 bg-[#163422] rounded-full animate-bounce [animation-delay:0.4s]"></span>
          <span className="text-xs ml-2 italic text-[#424843]">
            {typingText}
          </span>
        </div>
      )}

      {/* Interactive Action Toolbar */}
      <div className="pt-2 flex flex-wrap items-center gap-2">
        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            isSaved
              ? 'bg-[#163422] text-white hover:bg-[#2d4b37]'
              : 'bg-white border border-[#c2c8c0] text-[#163422] hover:bg-[#f4f4f2]'
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-[#fdc65c]" />
              <span>Tersimpan di My Recipes</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>Simpan Resep</span>
            </>
          )}
        </button>

        {/* Guided Cooking Mode button */}
        <button
          onClick={() => onOpenCookMode(recipe)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#163422] text-white hover:bg-[#2d4b37] transition-all shadow-xs"
        >
          <Play className="w-3.5 h-3.5 fill-current text-[#fdc65c]" />
          <span>Panduan Masak Interaktif</span>
        </button>

        {/* Text to Speech Read Aloud */}
        <button
          onClick={handleSpeakRecipe}
          className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
            isSpeaking
              ? 'bg-[#fdc65c]/30 border-[#7c5800] text-[#7c5800]'
              : 'bg-white border-[#c2c8c0] text-[#424843] hover:bg-[#f4f4f2]'
          }`}
          title={isSpeaking ? 'Hentikan Suara' : 'Dengarkan Audio Resep'}
        >
          <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-[#7c5800]' : ''}`} />
        </button>

        {/* Copy Recipe */}
        <button
          onClick={handleCopyRecipe}
          className="p-2 rounded-xl bg-white border border-[#c2c8c0] text-[#424843] hover:bg-[#f4f4f2] transition-all"
          title="Salin Resep"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
