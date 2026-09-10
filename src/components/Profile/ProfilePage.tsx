import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  PersonStanding, 
  Bell, 
  Globe, 
  LogOut, 
  Check, 
  X, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { Recipe, SavedRecipe } from '../../types';
import { CardImageWithSkeleton } from '../Common/CardSkeleton';
import { GLOBAL_FALLBACK_FOOD_IMAGE } from '../../data/imageAssets';

interface ProfilePageProps {
  onOpenSearch: () => void;
  onViewRecipe: (recipe: Recipe) => void;
  onNavigateToEducation?: () => void;
  savedRecipes?: SavedRecipe[]; // from Supabase (App data layer)
  userName?: string;
  userRole?: string;
  onSaveProfile?: (name: string, role: string) => void;
  onLogout?: () => void;
  onRemoveSaved?: (recipe: Recipe) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onOpenSearch,
  onViewRecipe,
  savedRecipes = [],
  userName: userNameProp = 'Adinda Sari',
  userRole: userRoleProp = 'MBG Participant | Healthy Living Enthusiast',
  onSaveProfile,
  onLogout,
  onRemoveSaved,
}) => {
  // State for interactive features
  const [userName, setUserName] = useState(userNameProp);
  const [userRole, setUserRole] = useState(userRoleProp);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editNameInput, setEditNameInput] = useState(userName);
  const [editRoleInput, setEditRoleInput] = useState(userRole);
  
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [appLanguage, setAppLanguage] = useState<'English' | 'Bahasa Indonesia'>('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  // "See All" gallery mode: false = recent preview (first 4), true = full grid gallery
  const [showAllSaved, setShowAllSaved] = useState(false);

  useEffect(() => {
    setUserName(userNameProp);
    setUserRole(userRoleProp);
    setEditNameInput(userNameProp);
    setEditRoleInput(userRoleProp);
  }, [userNameProp, userRoleProp]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleSavePersonalInfo = () => {
    setUserName(editNameInput);
    setUserRole(editRoleInput);
    setIsEditingInfo(false);
    if (onSaveProfile) onSaveProfile(editNameInput, editRoleInput);
    triggerToast('Profil berhasil diperbarui!');
  };

  const handleRecipeClick = (recipe: Recipe) => {
    onViewRecipe(recipe);
  };

  return (
    <div className="bg-[#f9f9f7] text-[#1a1c1b] font-['Manrope',sans-serif] antialiased min-h-screen pb-28 pt-16">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#163422] text-white px-5 py-2.5 rounded-full shadow-lg text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#fdc65c]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-[#f9f9f7]/95 backdrop-blur-md shadow-xs flex items-center justify-between px-5 py-3 border-b border-[#e2e3e1]/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-[#c2c8c0]/40">
            <img
              alt="User profile avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBY7kYlZEGSj7F6RcSi-U_yc8Y8W_YRH299ATPsshdJvmcJ5gODC2YPmJ7CLVYX80ueXWVEBZXB1ZGmeqtxjJQzd9xkub_INjmu4KQQaVWZp4iCdd-U0bvpYMoNuxq6Q0SZnyIPEjQ9ER2NbqE0nLn8jubwL0mMcvd1vns99IodH3CyiOQiZaUag4Hcz3L23a0526eCiTMVQW-zpcCDpSHXGTR7ZRYw1kgwlSgkH-L_czh7j3GQO_B9WA"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-xl font-bold text-[#163422] tracking-tight">SorghumCare</span>
        </div>
      </header>

      <main className="px-5 md:px-10 max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center mt-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border border-[#2d4b37]/20 shadow-[0_4px_16px_rgba(45,75,55,0.12)]">
              <img
                alt="Adinda Sari"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUrillJkto-_hexgR7w82lV_mJQuJcgcVQXmnvHmvRIoDFKdWoTmlt_pesxYrl186UygJjNLFBzQesEeXGIjElgXqbqoQcsQTVzsSVu5ywcgB_eHOfCybpfguf69oOSIIUiCtTG9RmeyH8zBCCE-0gmC_fDP-_kd0nKKh9VewKThcewDJDQ89z2D6qLUHGjyMmxXLOme-Lo4dWZvISd1iFQ6pWdFL27g0S7vSql-W5xn59zHNVeGtWnw"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => {
                setEditNameInput(userName);
                setEditRoleInput(userRole);
                setIsEditingInfo(true);
              }}
              className="absolute bottom-3 right-0 bg-[#163422] text-white p-1.5 rounded-full shadow-md hover:bg-[#2d4b37] transition-all"
              title="Edit Profil"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#163422] tracking-tight">{userName}</h1>
          <p className="text-sm text-[#424843] mt-1 max-w-xs mx-auto">{userRole}</p>
          
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="bg-[#cbebc3] text-[#324d30] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              MBG Phase 2
            </span>
            <span className="bg-[#fdc65c] text-[#745200] px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              Gold Member
            </span>
            <button
              onClick={() => {
                setEditNameInput(userName);
                setEditRoleInput(userRole);
                setIsEditingInfo(true);
              }}
              className="bg-[#163422] text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-[#2d4b37] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Profil</span>
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-2 bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(45,75,55,0.06)] border border-[#2d4b37]/10">
          <div className="flex flex-col items-center p-2 text-center">
            <span className="text-2xl font-bold text-[#163422]">{savedRecipes.length}</span>
            <span className="text-xs text-[#424843] mt-1 font-medium">Saved Recipes</span>
          </div>
          <div className="flex flex-col items-center p-2 text-center border-l border-r border-[#c2c8c0]/30">
            <span className="text-2xl font-bold text-[#7c5800] flex items-center gap-1">
              <span className="material-symbols-outlined text-[22px] text-[#fdc65c]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
              1.2k
            </span>
            <span className="text-xs text-[#424843] mt-1 font-medium">Sorghum Impact</span>
          </div>
          <div className="flex flex-col items-center p-2 text-center">
            <span className="text-2xl font-bold text-[#163422]">14</span>
            <span className="text-xs text-[#424843] mt-1 font-medium">Day Streak</span>
          </div>
        </section>

        {/* Saved Recipes */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-[#1a1c1b] tracking-tight">
                {showAllSaved ? 'Galeri Resep Tersimpan' : 'Recent Saved Recipes'}
              </h2>
              {showAllSaved && (
                <p className="text-[11px] text-[#727972] mt-0.5">
                  Semua resep favoritmu dalam satu tampilan grid.
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {savedRecipes.length > 4 && (
                <button
                  onClick={() => setShowAllSaved((v) => !v)}
                  className="text-xs font-bold text-[#163422] bg-[#163422]/10 hover:bg-[#163422]/20 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  {showAllSaved ? 'Ringkas' : `See All (${savedRecipes.length})`}
                </button>
              )}
              {!showAllSaved && savedRecipes.length > 0 && (
                <span className="text-xs font-bold text-[#163422]">{savedRecipes.length} tersimpan</span>
              )}
            </div>
          </div>
          {savedRecipes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-[#c2c8c0] p-8 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#c2c8c0]">bookmark</span>
              <p className="text-xs text-[#727972]">
                Belum ada resep tersimpan. Ketuk "Simpan Resep" pada kartu resep untuk menyimpan favorit Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {(showAllSaved ? savedRecipes : savedRecipes.slice(0, 4)).map((saved) => (
                <div
                  key={saved.id}
                  onClick={() => handleRecipeClick(saved.recipe)}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(45,75,55,0.06)] border border-[#2d4b37]/10 group cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="h-32 w-full relative overflow-hidden bg-[#e8eae6]">
                    <CardImageWithSkeleton
                      alt={saved.recipe.title}
                      imageClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      containerClassName="w-full h-full relative"
                      src={saved.recipe.imageUrl || GLOBAL_FALLBACK_FOOD_IMAGE}
                      fallbackSrc={GLOBAL_FALLBACK_FOOD_IMAGE}
                    />
                    {onRemoveSaved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSaved(saved.recipe);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-[#ba1a1a] hover:bg-white"
                        title="Hapus dari tersimpan"
                        aria-label="Hapus dari tersimpan"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-xs sm:text-sm font-bold text-[#1a1c1b] truncate group-hover:text-[#163422]">
                      {saved.recipe.title}
                    </h3>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {(saved.recipe.tags || []).slice(0, 2).map((tag, i) => (
                        <span key={i} className="bg-[#cbebc3] text-[#324d30] px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Account Settings */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#1a1c1b] tracking-tight">Account</h2>
          <div className="bg-white rounded-2xl border border-[#2d4b37]/10 shadow-[0_4px_12px_rgba(45,75,55,0.06)] divide-y divide-[#c2c8c0]/20 overflow-hidden">
            {/* Notifications */}
            <button
              onClick={() => {
                setIsNotificationsEnabled(!isNotificationsEnabled);
                triggerToast(
                  !isNotificationsEnabled
                    ? 'Notifikasi resep harian diaktifkan'
                    : 'Notifikasi dinonaktifkan'
                );
              }}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f4f4f2] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#424843] group-hover:text-[#163422] transition-colors">
                  notifications
                </span>
                <div>
                  <span className="text-sm font-medium text-[#1a1c1b] block">Notifications</span>
                  <span className="text-[11px] text-[#727972]">
                    {isNotificationsEnabled ? 'Tips harian & reminder aktif' : 'Dinonaktifkan'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-10 h-6 rounded-full transition-colors p-1 flex items-center ${
                    isNotificationsEnabled ? 'bg-[#163422] justify-end' : 'bg-[#c2c8c0] justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                </div>
              </div>
            </button>

            {/* App Language */}
            <button
              onClick={() => setShowLanguageModal(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#f4f4f2] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#424843] group-hover:text-[#163422] transition-colors">
                  language
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-[#1a1c1b]">App Language</span>
                  <span className="text-xs text-[#727972]">{appLanguage}</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#424843]">chevron_right</span>
            </button>

            {/* Log Out */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#ffdad6]/20 transition-colors text-left group"
            >
              <div className="flex items-center gap-3 text-[#ba1a1a]">
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-semibold">Log Out</span>
              </div>
            </button>
          </div>
        </section>

        {/* Spacing for bottom nav */}
        <div className="h-8"></div>
      </main>

      {/* Edit Personal Info Modal */}
      {isEditingInfo && (
        <div className="fixed inset-0 z-50 bg-[#1a1c1b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#163422]">Edit Informasi Profil</h3>
              <button
                onClick={() => setIsEditingInfo(false)}
                className="w-8 h-8 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[#424843] hover:bg-[#e2e3e1]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#424843] mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c2c8c0] rounded-xl text-sm focus:outline-none focus:border-[#163422]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#424843] mb-1">Status / Bio Singkat</label>
                <input
                  type="text"
                  value={editRoleInput}
                  onChange={(e) => setEditRoleInput(e.target.value)}
                  className="w-full px-3 py-2 border border-[#c2c8c0] rounded-xl text-sm focus:outline-none focus:border-[#163422]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsEditingInfo(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#c2c8c0] text-xs font-bold text-[#424843] hover:bg-[#f4f4f2]"
              >
                Batal
              </button>
              <button
                onClick={handleSavePersonalInfo}
                className="flex-1 py-2.5 rounded-xl bg-[#163422] text-white text-xs font-bold hover:bg-[#2d4b37] shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Language Switch Modal */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 bg-[#1a1c1b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-[#163422]">Pilih Bahasa Aplikasi</h3>
              <button
                onClick={() => setShowLanguageModal(false)}
                className="w-7 h-7 rounded-full bg-[#f4f4f2] flex items-center justify-center text-[#424843]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {(['English', 'Bahasa Indonesia'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setAppLanguage(lang);
                    setShowLanguageModal(false);
                    triggerToast(`Bahasa diubah ke ${lang}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                    appLanguage === lang
                      ? 'bg-[#163422]/5 border-[#163422] text-[#163422]'
                      : 'border-[#e2e3e1] text-[#424843] hover:bg-[#f4f4f2]'
                  }`}
                >
                  <span>{lang}</span>
                  {appLanguage === lang && <Check className="w-4 h-4 text-[#163422]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-[#1a1c1b]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1a1c1b]">Keluar Akun?</h3>
            <p className="text-xs text-[#727972]">
              Sesi Anda akan diakhiri. Data resep dan preferensi tersimpan di perangkat ini.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#c2c8c0] text-xs font-bold text-[#424843]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  triggerToast('Berhasil keluar dari akun');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] text-white text-xs font-bold hover:bg-rose-700"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
