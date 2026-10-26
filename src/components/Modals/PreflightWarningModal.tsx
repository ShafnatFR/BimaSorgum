import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, ArrowUpRight } from 'lucide-react';
import type { PreflightResult } from '../../services/preflight';

interface PreflightWarningModalProps {
  isOpen: boolean;
  result: PreflightResult;
  originalPrompt: string;
  /** called with the corrected prompt (flagged ingredients removed) */
  onProceed: (correctedPrompt: string) => void;
}

export const PreflightWarningModal: React.FC<PreflightWarningModalProps> = ({
  isOpen,
  result,
  originalPrompt,
  onClose,
  onProceed,
}) => {
  const [removed, setRemoved] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleRemove = (name: string) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const stillFlagged = result.issues.filter((i) => !removed.has(i.name));
  const canProceed = stillFlagged.length === 0;

  const handleProceed = () => {
    // Remove flagged ingredients from the prompt text.
    let corrected = originalPrompt;
    for (const name of Array.from(removed)) {
      corrected = corrected.replace(new RegExp(`\\b${name}\\b`, 'gi'), '').replace(/\s{2,}/g, ' ').trim();
    }
    onProceed(corrected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C1B]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#e2e3e1] flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#fdc65c]/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#b8860b]" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-[#163422]">Periksa dulu sebelum memasak</h2>
            <p className="text-xs text-[#727972] mt-0.5">
              Ada kombinasi bahan yang tidak logis. Hapus yang ditandai untuk lanjut.
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f4f4f2] text-[#727972]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#b8860b] uppercase tracking-wide">Bahan tidak logis</p>
            {result.issues.map((iss) => (
              <div
                key={`c-${iss.name}`}
                className={`flex items-center justify-between gap-2 p-3 rounded-xl border ${
                  removed.has(iss.name)
                    ? 'bg-[#f4f4f2] border-[#e2e3e1] opacity-60'
                    : 'bg-[#ffdad6]/40 border-[#ba1a1a]/30'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-semibold ${removed.has(iss.name) ? 'text-[#727972] line-through' : 'text-[#ba1a1a]'}`}>
                    {iss.name}
                  </span>
                  <p className="text-xs text-[#727972]">kombinasi tidak lazim: {iss.reason}</p>
                </div>
                <button
                  onClick={() => toggleRemove(iss.name)}
                  className="p-1.5 rounded-full hover:bg-white text-[#727972] flex-shrink-0"
                  title={removed.has(iss.name) ? 'Batalkan hapus' : 'Hapus bahan ini'}
                >
                  {removed.has(iss.name) ? <ArrowUpRight className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e2e3e1] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#424843] hover:bg-[#f4f4f2]"
          >
            Batal
          </button>
          <button
            onClick={handleProceed}
            disabled={!canProceed}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              canProceed
                ? 'bg-[#163422] text-white hover:bg-[#2d4b37]'
                : 'bg-[#e2e3e1] text-[#9aa09a] cursor-not-allowed'
            }`}
          >
            {canProceed ? 'Lanjutkan' : `Hapus ${stillFlagged.length} bahan lagi`}
          </button>
        </div>
      </div>
    </div>
  );
};
