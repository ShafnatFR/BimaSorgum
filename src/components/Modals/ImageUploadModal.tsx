import React, { useState } from 'react';
import { X, Camera, Upload, Sparkles, Check } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSampleImage: (title: string, promptText: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectSampleImage,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessUploadedPhoto = () => {
    if (selectedFile || filePreview) {
      onSelectSampleImage(
        selectedFile ? selectedFile.name : 'Foto Bahan Pilihan',
        `Foto bahan terunggah (${selectedFile?.name || 'foto.jpg'}). Tolong buatkan resep hidangan sorgum yang cocok dari bahan-bahan di foto ini!`
      );
      onClose();
    }
  };

  const sampleIngredients = [
    {
      title: 'Biji Sorgum & Telur',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCT4duAQJkPLy6ni45Ql9j6Yj4bJeTMr8cfofMMBk51mTbJ0oBFJjPHRkOENM6D9mBrCdFu6OAN_HMIFo3lXreQDGgDbNuGSsDE80jyGtzwAuSHr3dIMh1qjLV9lQ46jTex6HGpClLJD2NNnlf9MF9On2GNYwj15dF09uvLj7OoOl8tteAzGeuM_pFUl1m21qXjPzFRaRQnoJpq4uHUBCRrZNINFqgOQ7tvVBYfDdNCj1oHBAYYt2Ps9g',
      prompt: 'Saya punya biji sorgum dan telur ayam. Tolong buatkan resep sarapan atau bekal cepat dan hemat modal 10 ribu.',
    },
    {
      title: 'Tepung Sorgum & Madu',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFBzO7aCMwp4FQ4aIPhzH8Krp0uXF-F5SZ7uwoLX9aOQFf2kdYyrsiJsRV79M2zqHeY_QpCFBbBuI52mTIZlj3t7majm9L2iVIA5SO2rAZxyaJvR-Z2qBXr-IAbewlqwExRz7I2o4JrgqTdxnJ87ZuM6lCbzhuny93LciWVmYmpDVjy4OCIc_O_37rl50c3SDeFhlTJtomUEq9qlDopp-lKDEfi-8yrGO2tVuCiLe1znmFFfEsdk8Jug',
      prompt: 'Tolong buatkan resep camilan manis atau pancake dari tepung sorgum dan madu yang bebas terigu.',
    },
    {
      title: 'Tepung Sorgum & Ragi Roti',
      imgUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-dISnb7g-AFLgg2CG8JxX-YcNA8J8pvDQbdAyFbZLjFm_xmF2oaHrMQBw7PBx1ZqNBgtSV9pMdrtn81ID-BdZKIrJZqNMFi5p16l40EbgXQZXrTHJO5Pwyhl4MagTePzjcGqdMWq_XI1Qn9LnwYd6bPQ57VKtctCRvwvzgAdASdm9dv1mfxnLfxxvSnP3tJFymSZk5W8_QCytJ-vD387rkODkyIttC6bBfZ26wBbHmdQRreO0huXDyA',
      prompt: 'Buatkan saya resep roti tawar empuk artisanal dari tepung sorgum yang cocok untuk penderita diabetes.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C1B]/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#163422] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#fdc65c]" />
            <h2 className="font-bold text-base">Pindai / Pilih Bahan Makanan</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Custom Upload Input Section */}
          <div className="p-4 border-2 border-dashed border-[#163422]/30 rounded-2xl bg-[#f9f9f7] text-center space-y-2">
            {filePreview ? (
              <div className="space-y-2">
                <div className="w-24 h-24 rounded-xl overflow-hidden mx-auto border border-[#c2c8c0] shadow-sm">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-bold text-[#163422] truncate max-w-xs mx-auto">
                  {selectedFile?.name}
                </p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                    className="text-xs text-rose-600 font-bold px-3 py-1 bg-rose-50 rounded-lg hover:bg-rose-100"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleProcessUploadedPhoto}
                    className="text-xs text-white bg-[#163422] font-bold px-4 py-1 rounded-lg hover:bg-[#2d4b37] flex items-center gap-1 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#fdc65c]" />
                    <span>Analisis Foto Ini</span>
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-[#163422]/10 text-[#163422] flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-[#163422]">
                  Unggah Foto Bahan Makanan Anda
                </p>
                <p className="text-[11px] text-[#727972]">
                  Ketuk di sini untuk mengambil foto dari galeri/kamera
                </p>
              </label>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#e2e3e1]" />
            <span className="text-[11px] text-[#727972] font-bold uppercase tracking-wider">
              Atau Pilih Contoh Foto
            </span>
            <div className="flex-1 h-px bg-[#e2e3e1]" />
          </div>

          <div className="space-y-2.5">
            {sampleIngredients.map((sample, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onSelectSampleImage(sample.title, sample.prompt);
                  onClose();
                }}
                className="flex items-center gap-3 p-2.5 rounded-2xl border border-[#e2e3e1] hover:border-[#163422] hover:bg-[#f9f9f7] cursor-pointer transition-all group"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#f4f4f2] flex-shrink-0">
                  <img
                    src={sample.imgUrl}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#163422] group-hover:text-[#2d4b37]">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] text-[#727972] truncate">
                    {sample.prompt}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-[#f4f4f2] group-hover:bg-[#163422] group-hover:text-white flex items-center justify-center transition-colors text-xs flex-shrink-0">
                  ✨
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f4f4f2] border-t border-[#e2e3e1] flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#163422] text-white font-bold text-xs rounded-xl hover:bg-[#2d4b37] transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
