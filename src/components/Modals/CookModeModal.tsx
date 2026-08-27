import React, { useState, useEffect } from 'react';
import { Recipe, RecipeStep } from '../../types';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CookModeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({ recipe, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const isLastStep = currentStepIndex === recipe.steps.length - 1;

  // Initialize timer whenever step changes
  useEffect(() => {
    if (currentStep?.timerMinutes) {
      setTimerSeconds(currentStep.timerMinutes * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  }, [currentStepIndex, currentStep]);

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      // Play a gentle beep audio tone if audio context is available
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 587.33; // D5
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 600);
      } catch (err) {
        // audio context silent catch
      }
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    if (isLastStep) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const speakCurrentStep = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const text = `Langkah ${currentStep.stepNumber}. ${currentStep.title}. ${currentStep.instruction}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C1B]/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#163422] text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-[#adcfb4] font-bold block">
              Mode Panduan Memasak
            </span>
            <h2 className="text-base sm:text-lg font-bold truncate max-w-xs">
              {recipe.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-[#f4f4f2] px-5 py-2.5 flex items-center justify-between border-b border-[#e2e3e1]">
          <span className="text-xs font-bold text-[#163422]">
            Langkah {currentStepIndex + 1} dari {recipe.steps.length}
          </span>
          <div className="flex gap-1">
            {recipe.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#163422]'
                    : idx < currentStepIndex
                    ? 'w-2 bg-[#7c5800]'
                    : 'w-2 bg-[#c2c8c0]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#163422] text-white font-bold text-xl flex items-center justify-center shadow-md">
              {currentStep.stepNumber}
            </div>
            <button
              onClick={speakCurrentStep}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f4f4f2] hover:bg-[#e2e3e1] text-[#163422] text-xs font-semibold transition-colors"
            >
              <Volume2 className="w-4 h-4 text-[#163422]" />
              <span>Dengarkan</span>
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#163422] mb-2">
              {currentStep.title}
            </h3>
            <p className="text-base sm:text-lg text-[#424843] leading-relaxed">
              {currentStep.instruction}
            </p>
          </div>

          {currentStep.tip && (
            <div className="p-3.5 bg-[#fdc65c]/15 border border-[#fdc65c]/40 rounded-2xl flex items-start gap-2.5">
              <Sparkles className="w-5 h-5 text-[#7c5800] flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-[#5e4200]">
                <strong>Tips Koki:</strong> {currentStep.tip}
              </p>
            </div>
          )}

          {/* Interactive Timer if available */}
          {currentStep.timerMinutes && (
            <div className="bg-[#f9f9f7] rounded-2xl p-4 border border-[#e2e3e1] flex flex-col items-center justify-center space-y-3">
              <span className="text-xs font-semibold text-[#727972] uppercase tracking-wider">
                Timer Memasak
              </span>
              <div className="text-4xl font-mono font-bold text-[#163422] tracking-wider">
                {formatTimer(timerSeconds)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    isTimerRunning
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-[#163422] text-white hover:bg-[#2d4b37]'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      Jeda
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Mulai Timer
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds((currentStep.timerMinutes || 0) * 60);
                  }}
                  className="p-2 rounded-full bg-white border border-[#c2c8c0] text-[#727972] hover:bg-[#f4f4f2]"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-[#f9f9f7] border-t border-[#e2e3e1] flex items-center justify-between gap-3">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentStepIndex === 0
                ? 'text-[#c2c8c0] cursor-not-allowed'
                : 'text-[#163422] hover:bg-[#e2e3e1]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <button
            onClick={handleNextStep}
            className="flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-bold bg-[#163422] text-white hover:bg-[#2d4b37] flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
          >
            {isLastStep ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#fdc65c]" />
                <span>Selesai Memasak!</span>
              </>
            ) : (
              <>
                <span>Langkah Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
