import React from 'react';

export type AppTab = 'home' | 'generate' | 'explore' | 'profile';

interface BottomNavBarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F9F9F7] border-t border-[#c2c8c0]/60 shadow-lg flex justify-around items-center h-16 px-4 pb-safe md:max-w-md md:mx-auto md:bottom-3 md:rounded-full md:border md:shadow-2xl">
      {/* Home Tab */}
      <button
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center transition-all duration-200 px-4 py-1.5 rounded-full ${
          currentTab === 'home'
            ? 'bg-[#2d4b37] text-white shadow-xs'
            : 'text-[#424843] hover:bg-[#e2e3e1]'
        }`}
        aria-label="Beranda"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: currentTab === 'home' ? "'FILL' 1" : "'FILL' 0" }}
        >
          home
        </span>
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </button>

      {/* Explore Tab */}
      <button
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center justify-center transition-all duration-200 px-4 py-1.5 rounded-full ${
          currentTab === 'explore'
            ? 'bg-[#2d4b37] text-white shadow-xs'
            : 'text-[#424843] hover:bg-[#e2e3e1]'
        }`}
        aria-label="Eksplorasi Resep"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: currentTab === 'explore' ? "'FILL' 1" : "'FILL' 0" }}
        >
          travel_explore
        </span>
        <span className="text-[10px] font-bold tracking-tight">Explore</span>
      </button>

      {/* Generate Tab (Wizard & AI Chef) */}
      <button
        onClick={() => onSelectTab('generate')}
        className={`flex flex-col items-center justify-center transition-all duration-200 px-4 py-1.5 rounded-full ${
          currentTab === 'generate'
            ? 'bg-[#2d4b37] text-white shadow-xs'
            : 'text-[#424843] hover:bg-[#e2e3e1]'
        }`}
        aria-label="Generate Resep AI"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: currentTab === 'generate' ? "'FILL' 1" : "'FILL' 0" }}
        >
          magic_button
        </span>
        <span className="text-[10px] font-bold tracking-tight">Generate</span>
      </button>

      {/* Profile Tab */}
      <button
        onClick={() => onSelectTab('profile')}
        className={`flex flex-col items-center justify-center transition-all duration-200 px-4 py-1.5 rounded-full ${
          currentTab === 'profile'
            ? 'bg-[#2d4b37] text-white shadow-xs'
            : 'text-[#424843] hover:bg-[#e2e3e1]'
        }`}
        aria-label="Profil Pengguna"
      >
        <span
          className="material-symbols-outlined text-2xl"
          style={{ fontVariationSettings: currentTab === 'profile' ? "'FILL' 1" : "'FILL' 0" }}
        >
          person
        </span>
        <span className="text-[10px] font-bold tracking-tight">Profile</span>
      </button>
    </nav>
  );
};
