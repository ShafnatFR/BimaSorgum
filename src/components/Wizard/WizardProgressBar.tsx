import React from 'react';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onBack: () => void;
  showStepText?: boolean;
}

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({
  currentStep,
  totalSteps = 4,
  onBack,
  showStepText = false,
}) => {
  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-4 bg-[#f9f9f7] z-20 max-w-2xl mx-auto">
      <button
        id="wizard-back-btn"
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f4f4f2] text-[#424843] hover:text-[#163422] transition-colors cursor-pointer active:scale-95"
        aria-label="Kembali"
        title="Kembali"
      >
        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>

      {/* Progress Bars matching [160px] width specification */}
      <div className="flex flex-col items-center justify-center">
        {showStepText && (
          <span className="text-[11px] font-bold text-[#727972] mb-1.5 uppercase tracking-wider">
            Langkah {currentStep} dari {totalSteps}
          </span>
        )}
        <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-[160px]">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isCompletedOrActive = stepNum <= currentStep;

            return (
              <div
                key={idx}
                className={`h-[6px] flex-1 rounded-full transition-all duration-300 ${
                  isCompletedOrActive ? 'bg-[#163422]' : 'bg-[#e8e8e6]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Spacer for flex centering */}
      <div className="w-10 h-10" />
    </header>
  );
};

