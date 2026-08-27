import React, { useState } from 'react';
import { 
  HOME_STUDENT_FAVORITES, 
  HOME_CATEGORIES, 
  HOME_VIDEO_TUTORIALS, 
  HOME_COMMUNITY_RECIPES, 
  DAILY_TIPS, 
  FALLBACK_FOOD_IMAGE,
  HomeFavoriteItem,
  CategoryItem,
  VideoTutorialItem,
  CommunityRecipeItem
} from '../../data/homeData';
import { Recipe } from '../../types';
import { INITIAL_FEATURED_RECIPE, INITIAL_SAVED_RECIPES } from '../../data/mockData';
import { Sparkles, ArrowRight, Star, Heart, Play, RefreshCw, ChevronRight } from 'lucide-react';

interface HomePageProps {
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onSelectCategory: (categoryKey: string) => void;
  onViewRecipe: (recipe: Recipe) => void;
  onOpenVideoTutorial: (tutorial: VideoTutorialItem) => void;
  onStartGenerator: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenProfile,
  onOpenSearch,
  onSelectCategory,
  onViewRecipe,
  onOpenVideoTutorial,
  onStartGenerator,
}) => {
  const [favorites, setFavorites] = useState<HomeFavoriteItem[]>(HOME_STUDENT_FAVORITES);
  const [communityRecipes, setCommunityRecipes] = useState<CommunityRecipeItem[]>(HOME_COMMUNITY_RECIPES);
  const [tipIndex, setTipIndex] = useState(0);
  const [hasLoadedMore, setHasLoadedMore] = useState(false);
  const [activeNutriTab, setActiveNutriTab] = useState<'rice' | 'wheat' | 'corn'>('rice');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id ? { ...fav, isFavorite: !fav.isFavorite } : fav))
    );
  };

  const handleFavoriteClick = (item: HomeFavoriteItem) => {
    if (item.recipeId === 'nasi-goreng-sorgum-sd') {
      onViewRecipe(INITIAL_FEATURED_RECIPE);
    } else if (item.recipeId === 'pancakes-sorghum') {
      onViewRecipe(INITIAL_SAVED_RECIPES[0].recipe);
    } else if (item.recipeId === 'healthy-bowl-sorghum') {
      onViewRecipe(INITIAL_SAVED_RECIPES[2].recipe);
    } else {
      onViewRecipe(INITIAL_FEATURED_RECIPE);
    }
  };

  const handleCommunityClick = (comm: CommunityRecipeItem) => {
    if (comm.id === 'comm-1') {
      onViewRecipe(INITIAL_SAVED_RECIPES[2].recipe);
    } else if (comm.id === 'comm-3') {
      onViewRecipe(INITIAL_SAVED_RECIPES[0].recipe);
    } else if (comm.id === 'comm-4') {
      onViewRecipe(INITIAL_SAVED_RECIPES[1].recipe);
    } else {
      // Default to featured recipe with customized title
      onViewRecipe({
        ...INITIAL_FEATURED_RECIPE,
        title: comm.title,
        subtitle: comm.description,
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
      });
    }
  };

  const handleLoadMore = () => {
    setHasLoadedMore(true);
    const extraRecipes: CommunityRecipeItem[] = [
      {
        id: 'comm-5',
        title: 'Bubur Manado Sorgum Gurih',
        description: 'Tinutuan khas Manado menggunakan biji sorgum pulen kaya serat dan aneka sayur labu.',
        tag: 'Tradisional',
        rating: 4.9,
        time: '30 Min',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqtQJlJQNulv10PBJ5EZBqA4ix7CqYVr898rmK4iVh1fmk6kDunPVQ-O_BOraJlXmFaNAi8I6qZEFKBzbA8Jclw--PV6g2Yo_XrWhOWzq4xq5Oq1q2P3n9wMJwhFvGcu2Htwhug9fD1QiZF9_zRwLj58iiz1kSocu4hhx-tRaamoVOYcCHK5BQnTj-liHuMusnenv8MTmZd14FSfGZKPdin-FYH3coUA0r5JXR5g-m0OvF-zOZ0-Z6hw',
      },
      {
        id: 'comm-6',
        title: 'Cookies Cokelat Tepung Sorgum',
        description: 'Kue kering renyah bebas gluten dengan choco chips dan gula kelapa alami.',
        tag: 'Camilan Sehat',
        rating: 5.0,
        time: '20 Min',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFBzO7aCMwp4FQ4aIPhzH8Krp0uXF-F5SZ7uwoLX9aOQFf2kdYyrsiJsRV79M2zqHeY_QpCFBbBuI52mTIZlj3t7majm9L2iVIA5SO2rAZxyaJvR-Z2qBXr-IAbewlqwExRz7I2o4JrgqTdxnJ87ZuM6lCbzhuny93LciWVmYmpDVjy4OCIc_O_37rl50c3SDeFhlTJtomUEq9qlDopp-lKDEfi-8yrGO2tVuCiLe1znmFFfEsdk8Jug',
      },
    ];
    setCommunityRecipes((prev) => [...prev, ...extraRecipes]);
  };

  const nextTip = () => {
    setTipIndex((prev) => (prev + 1) % DAILY_TIPS.length);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#1A1C1B] font-['Manrope',sans-serif] pt-[72px] pb-[100px]">
      {/* 1. TopAppBar matching HTML exactly */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-[#F9F9F7]/95 backdrop-blur-md shadow-xs flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#e2e3e1]/60 max-w-7xl mx-auto">
        <div 
          onClick={onOpenProfile}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
          title="Buka Profil Pengguna"
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#163422]/20 shadow-xs bg-[#e2e3e1]">
            <img
              className="w-full h-full object-cover"
              alt="Shafna T. Ramadhan"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA66PVYu9Ktl2cw-HRQIcDWEHDWTtqKVG6Lnfm8QhCbLvMk1QVw7EWZkv6IWu1voC_MNhLf9Bxgdjbow2q4OBxEVQrVZmSx1j-Lr6VV5jiN6geDiC9F-3LtAu4aR96kJU_99CBEKwUwEFovYAcUoZr5dKbnTdF9jOFOIxGDTUAcWp77JcEgD0nWPlNSW5taJjRsT4Kq0jCeXnje_pvnJYmfIn1DWyO6ie97CgWEzHF485mwJL_iROuDGQ"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-xs font-bold text-[#163422] block leading-none">Shafna</span>
            <span className="text-[10px] text-[#727972]">Health Explorer</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#163422] tracking-tight">
            SorghumCare
          </h1>
          <span className="text-[10px] font-extrabold uppercase text-[#7c5800] bg-[#fdc65c]/30 px-2 py-0.5 rounded-full">
            AI Chef
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenSearch}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#163422] hover:bg-[#e2e3e1] transition-colors active:scale-95 duration-150"
            title="Cari Resep"
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-4 md:px-8 max-w-7xl mx-auto space-y-8 mt-4">
        {/* Quick AI Generator Banner */}
        <section className="bg-gradient-to-r from-[#163422] to-[#2d4b37] text-white rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5 z-10 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="bg-[#fdc65c] text-[#163422] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Fitur Unggulan
              </span>
              <span className="text-xs text-[#adcfb4] font-semibold">
                Panduan Pintar 4 Langkah
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
              Ingin Resep Sorgum Sesuai Anggaran &amp; Bahan Dapur Anda?
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Pilih target usia, jenis hidangan, bahan yang ada, dan atur budget per porsi mulai Rp 5.000.
            </p>
          </div>

          <button
            id="btn-home-start-smart-generate"
            onClick={onStartGenerator}
            className="z-10 py-3 px-5 bg-[#fdc65c] text-[#163422] hover:bg-[#f4be55] rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#163422]" />
            <span>Mulai Smart Generate</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Decorative background grain shape */}
          <div className="absolute right-0 -bottom-10 opacity-10 text-9xl select-none pointer-events-none">
            🌾
          </div>
        </section>

        {/* 2. Featured Recipes (Student Favorites) matching HTML */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-[#163422] tracking-tight">
              Student Favorites
            </h3>
            <span className="text-xs text-[#727972] font-semibold">
              Geser untuk melihat menu
            </span>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
            {favorites.map((item) => (
              <div
                key={item.id}
                onClick={() => handleFavoriteClick(item)}
                className="min-w-[270px] sm:min-w-[290px] bg-white rounded-2xl border border-[#c2c8c0]/60 overflow-hidden flex flex-col shrink-0 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="h-36 bg-[#e2e3e1] relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.id, e)}
                    className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md rounded-full p-1.5 shadow-sm text-[#163422] hover:bg-white transition-colors"
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{
                        fontVariationSettings: item.isFavorite ? "'FILL' 1" : "'FILL' 0",
                        color: item.isFavorite ? '#ba1a1a' : '#727972',
                      }}
                    >
                      favorite
                    </span>
                  </button>
                </div>

                <div className="p-3.5 flex-grow flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex gap-1.5 mb-1.5 flex-wrap">
                      <span className="bg-[#cbebc3] text-[#163422] px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {item.categoryTag}
                      </span>
                      <span className="bg-[#f4f4f2] text-[#424843] px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {item.timeTag}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1A1C1B] group-hover:text-[#163422] transition-colors leading-snug">
                      {item.title}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#f4f4f2]">
                    <span className="text-[#163422] text-xs font-bold flex items-center gap-1">
                      View Recipe
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                    <span className="text-[11px] font-bold text-[#7c5800]">
                      Bebas Gluten
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Browse by Category matching HTML */}
        <section className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-[#163422] tracking-tight">
            Browse by Category
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {HOME_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.categoryKey)}
                className="aspect-square rounded-2xl overflow-hidden relative shrink-0 group cursor-pointer shadow-xs hover:shadow-lg transition-all"
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10 group-hover:from-black/90 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                  <span className="text-base sm:text-lg text-white font-extrabold tracking-wide drop-shadow-sm">
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-white/80 font-medium mt-0.5">
                    {cat.nameId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Cooking Basics with Sorghum (Interactive Video Tutorials) matching HTML */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-[#163422] tracking-tight">
              Cooking Basics with Sorghum
            </h3>
            <span className="text-xs text-[#727972] font-semibold">
              Klik video untuk panduan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {HOME_VIDEO_TUTORIALS.map((tut) => (
              <div
                key={tut.id}
                onClick={() => onOpenVideoTutorial(tut)}
                className="bg-white rounded-2xl border border-[#c2c8c0]/60 overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all"
              >
                <div className="relative h-40 bg-[#e2e3e1] overflow-hidden">
                  <img
                    src={tut.imageUrl}
                    alt={tut.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-[#163422] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-current text-[#163422] ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 text-white text-[11px] px-2 py-0.5 rounded-md font-mono font-bold">
                    {tut.duration}
                  </div>
                </div>

                <div className="p-3.5">
                  <h4 className="font-bold text-sm text-[#1A1C1B] group-hover:text-[#163422] transition-colors">
                    {tut.title}
                  </h4>
                  <p className="text-xs text-[#424843] mt-0.5">
                    {tut.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Featured Community Recipes matching HTML */}
        <section className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-[#163422] tracking-tight">
            Featured Community Recipes
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {communityRecipes.map((comm) => (
              <div
                key={comm.id}
                onClick={() => handleCommunityClick(comm)}
                className="bg-white rounded-2xl border border-[#c2c8c0]/60 overflow-hidden flex flex-col sm:flex-row shadow-xs hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="h-44 sm:h-auto sm:w-44 bg-[#e2e3e1] relative overflow-hidden shrink-0">
                  <img
                    src={comm.imageUrl}
                    alt={comm.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_FOOD_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span className="bg-[#fdc65c] text-[#745200] px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                        {comm.tag}
                      </span>
                      <span className="bg-[#f4f4f2] text-[#424843] px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {comm.rating}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm sm:text-base text-[#1A1C1B] group-hover:text-[#163422] transition-colors leading-snug">
                      {comm.title}
                    </h4>
                    <p className="text-xs text-[#424843] mt-1 line-clamp-2 leading-relaxed">
                      {comm.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#727972] pt-2 border-t border-[#f4f4f2]">
                    <div className="flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>{comm.time}</span>
                    </div>
                    <span className="font-bold text-[#163422] flex items-center gap-0.5">
                      Lihat Resep →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Sorghum Impact Infographic matching HTML */}
        <section className="bg-[#ffdea7] text-[#271900] rounded-3xl p-5 sm:p-7 border border-[#fdc65c]/50 shadow-md">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7c5800] bg-white/60 px-3 py-0.5 rounded-full inline-block">
                Fakta Gizi Superfood
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#163422]">
                Sorghum Impact
              </h3>
              <p className="text-xs sm:text-sm text-[#5e4200] leading-relaxed">
                Dibandingkan 100g nasi putih matang, Biji Sorgum memberikan keunggulan nutrisi luar biasa:
              </p>
            </div>

            {/* Visual comparison bars matching HTML */}
            <div className="space-y-3 bg-white/70 backdrop-blur-xs p-4 rounded-2xl border border-white/50">
              {/* Dietary Fiber */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-[#163422]">
                  <span>Dietary Fiber (Serat Pangan)</span>
                  <span className="text-[#7c5800]">6.7g vs 0.4g (16x Lebih Tinggi)</span>
                </div>
                <div className="w-full bg-[#f4be55]/40 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-[#163422] h-full rounded-full transition-all duration-1000"
                    style={{ width: '88%' }}
                  />
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-[#163422]">
                  <span>Protein Nabati</span>
                  <span className="text-[#7c5800]">11.3g vs 2.7g (4x Lebih Tinggi)</span>
                </div>
                <div className="w-full bg-[#f4be55]/40 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-[#163422] h-full rounded-full transition-all duration-1000"
                    style={{ width: '78%' }}
                  />
                </div>
              </div>

              {/* Iron */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1 text-[#163422]">
                  <span>Zat Besi (Iron &amp; Prebiotik)</span>
                  <span className="text-[#7c5800]">4.4mg vs 0.2mg (22x Lebih Tinggi)</span>
                </div>
                <div className="w-full bg-[#f4be55]/40 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-[#163422] h-full rounded-full transition-all duration-1000"
                    style={{ width: '92%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Daily Tip matching HTML */}
        <section className="bg-[#2d4b37] text-white rounded-3xl p-5 flex items-start justify-between gap-3.5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-[#fdc65c]">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#fdc65c] uppercase tracking-wider mb-1">
                Daily Nutrition Tip
              </h4>
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                {DAILY_TIPS[tipIndex]}
              </p>
            </div>
          </div>

          <button
            onClick={nextTip}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0"
            title="Ganti Tips"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </section>

        {/* 8. Load More Inspiration button matching HTML */}
        <div className="flex justify-center pt-2 pb-6">
          <button
            onClick={hasLoadedMore ? onStartGenerator : handleLoadMore}
            className="px-6 py-3 bg-white border border-[#727972]/40 rounded-full font-bold text-xs sm:text-sm text-[#163422] hover:bg-[#e2e3e1] transition-all shadow-xs flex items-center gap-2 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#7c5800]" />
            {hasLoadedMore ? 'Buat Resep Baru dengan AI Wizard' : 'Load More Inspiration'}
          </button>
        </div>
      </main>
    </div>
  );
};
