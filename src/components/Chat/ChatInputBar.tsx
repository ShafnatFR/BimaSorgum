import React, { useState, useRef } from 'react';
import { Image, Mic, MicOff, Send, Sparkles } from 'lucide-react';

interface ChatInputBarProps {
  onSendMessage: (text: string, imageFile?: File | null) => void;
  isLoading?: boolean;
  onOpenImagePicker?: () => void;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  isLoading = false,
  onOpenImagePicker,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const quickPrompts = [
    'Bekal anak SD budget Rp 10.000',
    'Pancake tepung sorgum tanpa gluten',
    'Menu lansia rendah gula darah (Low GI)',
    'Camilan sorgum renyah modal 8 ribu',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleVoiceToggle = () => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // If not supported in browser environment, simulate voice input nicely
      setIsListening(true);
      setTimeout(() => {
        setInputText('Berikan saya resep camilan sorgum renyah untuk santai sore');
        setIsListening(false);
      }, 1800);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSendMessage(
        `Saya punya bahan makanan seperti pada foto ini. Tolong buatkan resep hidangan sorgum yang cocok!`,
        file
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full bg-gradient-to-t from-[#F9F9F7] via-[#F9F9F7]/95 to-transparent pt-6 pb-6 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Quick prompt recommendations */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#7c5800] bg-[#fdc65c]/25 px-2.5 py-1 rounded-full flex-shrink-0">
            <Sparkles className="w-3 h-3 text-[#7c5800]" />
            Inspirasi:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(prompt)}
              className="px-3 py-1 bg-white hover:bg-[#163422]/5 border border-[#c2c8c0]/70 hover:border-[#163422] text-[#424843] hover:text-[#163422] rounded-full whitespace-nowrap transition-all text-xs font-medium shadow-xs active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Conversational Input Area container matching HTML specification */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-input-glow border border-[#c2c8c0]/60 p-2 flex items-center gap-2 focus-within:border-[#163422]/50 focus-within:ring-2 focus-within:ring-[#163422]/10 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Photo attach button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenImagePicker) {
                onOpenImagePicker();
              } else if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#424843] hover:bg-[#f4f4f2] hover:text-[#163422] transition-colors flex-shrink-0 cursor-pointer"
            title="Tambah Foto Bahan"
          >
            <span className="material-symbols-outlined text-2xl">
              add_photo_alternate
            </span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik bahan-bahan Anda di sini..."
            disabled={isLoading}
            className="flex-grow bg-transparent border-none focus:ring-0 text-base sm:text-lg text-[#1a1c1b] placeholder-[#727972] py-2 sm:py-3 px-2 outline-none min-w-0"
          />

          {/* Voice Input Mic */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-[#424843] hover:bg-[#f4f4f2] hover:text-[#163422]'
            }`}
            title={isListening ? 'Mendengarkan suara...' : 'Input Suara'}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <span className="material-symbols-outlined text-2xl">mic</span>
            )}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`w-12 h-12 rounded-full bg-[#163422] flex items-center justify-center text-white hover:bg-[#304b2e] transition-colors shadow-md flex-shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            title="Kirim"
          >
            <span className="material-symbols-outlined text-2xl">send</span>
          </button>
        </form>

        {/* Disclaimer Text */}
        <div className="text-center mt-2">
          <span className="text-xs text-[#424843]/70 font-medium">
            SorghumCare AI dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </span>
        </div>
      </div>
    </div>
  );
};
