import React from 'react';
import { TargetConsumerId } from '../../types';
import { TARGET_CONSUMERS } from '../../data/mockData';

interface WizardStep1Props {
  selectedConsumers: TargetConsumerId[];
  onToggleConsumer: (id: TargetConsumerId) => void;
  onNext: () => void;
}

export const WizardStep1: React.FC<WizardStep1Props> = ({
  selectedConsumers,
  onToggleConsumer,
  onNext,
}) => {
  const isNextDisabled = selectedConsumers.length === 0;

  return (
    <div className="flex flex-col flex-1 justify-between max-w-2xl w-full mx-auto px-4 md:px-6 pb-28">
      <div>
        {/* Title and Subtitle */}
        <div className="w-full text-center mt-4 md:mt-8 mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#1a1c1b] tracking-tight leading-tight">
            Siapa target konsumen Anda?
          </h1>
          <p className="text-sm sm:text-base text-[#424843] mt-2.5 max-w-lg mx-auto leading-relaxed">
            Pilih satu atau lebih grup usia untuk membantu kami merekomendasikan produk SorghumCare yang paling sesuai.
          </p>
        </div>

        {/* Options Grid (2 Columns) */}
        <div
          className="w-full grid grid-cols-2 gap-2.5 sm:gap-4 items-stretch"
          role="group"
          aria-label="Pilih target konsumen"
        >
          {TARGET_CONSUMERS.map((item) => {
            const isSelected = selectedConsumers.includes(item.id);

            return (
              <label
                key={item.id}
                id={`target-consumer-${item.id}`}
                className="group relative cursor-pointer block select-none"
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={isSelected}
                  onChange={() => onToggleConsumer(item.id)}
                />
                <div
                  className={`w-full border rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left transition-all duration-200 h-full ${
                    isSelected
                      ? 'bg-[#2d4b37] text-white border-[#2d4b37] shadow-sm'
                      : 'bg-white border-[#c2c8c0]/80 text-[#1a1c1b] hover:border-[#163422]/60 hover:bg-[#f9f9f7]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3.5 w-full">
                    <div
                      className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#163422] text-white'
                          : 'bg-[#f4f4f2] text-[#163422]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px] sm:text-[28px]">
                        {item.iconName}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span
                        className={`font-bold text-xs sm:text-[15px] md:text-[16px] block leading-snug ${
                          isSelected ? 'text-white' : 'text-[#1a1c1b]'
                        }`}
                      >
                        {item.label}
                      </span>
                      {item.subLabel && (
                        <span
                          className={`text-[11px] sm:text-xs mt-0.5 block line-clamp-2 ${
                            isSelected ? 'text-white/80' : 'text-[#727972]'
                          }`}
                        >
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Bottom Fixed Action Area */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#f9f9f7] via-[#f9f9f7] to-transparent pt-8 z-30 flex justify-center">
        <div className="w-full max-w-2xl">
          <button
            id="btn-step1-next"
            onClick={onNext}
            disabled={isNextDisabled}
            className="w-full bg-[#163422] text-white hover:bg-[#304b2e] transition-colors py-4 rounded-full font-semibold text-sm sm:text-base shadow-md active:scale-[0.98] duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

