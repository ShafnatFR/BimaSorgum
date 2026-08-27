import React, { useState } from 'react';
import { 
  TargetConsumerId, 
  DishCategoryId, 
  WizardFormData, 
  ChatMessage, 
  Recipe, 
  SavedRecipe 
} from './types';
import { 
  INITIAL_FEATURED_RECIPE, 
  INITIAL_SAVED_RECIPES, 
  RECENT_CHAT_TOPICS 
} from './data/mockData';
import { VideoTutorialItem } from './data/homeData';
import { generateRecipeFromWizard, generateCustomRecipeQuery } from './services/recipeGenerator';

import { HomePage } from './components/Home/HomePage';
import { ExploreRecipesPage } from './components/Explore/ExploreRecipesPage';
import { ProfilePage } from './components/Profile/ProfilePage';
import { BottomNavBar, AppTab } from './components/Navigation/BottomNavBar';

import { WizardProgressBar } from './components/Wizard/WizardProgressBar';
import { WizardStep1 } from './components/Wizard/WizardStep1';
import { WizardStep2 } from './components/Wizard/WizardStep2';
import { WizardStep3 } from './components/Wizard/WizardStep3';
import { WizardStep4 } from './components/Wizard/WizardStep4';

import { Sidebar } from './components/Sidebar/Sidebar';
import { RecipeCardView } from './components/Chat/RecipeCardView';
import { ChatInputBar } from './components/Chat/ChatInputBar';

import { CookModeModal } from './components/Modals/CookModeModal';
import { RecipeDetailPage } from './components/RecipeDetail/RecipeDetailPage';
import { ImageUploadModal } from './components/Modals/ImageUploadModal';
import { VideoTutorialModal } from './components/Modals/VideoTutorialModal';
import { SearchModal } from './components/Modals/SearchModal';

import { Menu, History, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation: 'home' is the primary home page requested by user
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [generatorMode, setGeneratorMode] = useState<'wizard' | 'chat'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Wizard Form State
  const [wizardData, setWizardData] = useState<WizardFormData>({
    targetConsumers: ['anak_sekolah'],
    dishCategory: 'makanan_berat',
    selectedIngredientIds: ['biji_sorgum'],
    customIngredients: ['Bawang Merah', 'Santan'],
    budgetPerPortion: 10000,
    prepTimeLimit: 'Maks 30 Menit',
  });

  // Chat and Recipes State
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(INITIAL_SAVED_RECIPES);
  const [activeChatId, setActiveChatId] = useState<string>('chat-4');
  
  // Initial messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-user-1',
      sender: 'user',
      text: 'Berikan saya resep nasi goreng sorgum untuk anak SD dengan budget 10 ribu.',
      timestamp: '10:42 AM',
    },
    {
      id: 'msg-ai-1',
      sender: 'ai',
      recipe: INITIAL_FEATURED_RECIPE,
      timestamp: 'Baru saja',
      isTypingStep: false,
    },
  ]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [typingStatusText, setTypingStatusText] = useState<string>('Sedang menulis langkah memasak...');

  // Modals state
  const [cookModeRecipe, setCookModeRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [selectedVideoTutorial, setSelectedVideoTutorial] = useState<VideoTutorialItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);

  // Bottom Nav Tab Switcher
  const handleSelectTab = (tab: AppTab) => {
    setSelectedRecipeDetail(null);
    setCurrentTab(tab);
    if (tab === 'generate') {
      setGeneratorMode('chat');
    }
  };

  // Wizard Handlers
  const handleToggleConsumer = (id: TargetConsumerId) => {
    setWizardData((prev) => {
      const exists = prev.targetConsumers.includes(id);
      const next = exists
        ? prev.targetConsumers.filter((c) => c !== id)
        : [...prev.targetConsumers, id];
      return { ...prev, targetConsumers: next };
    });
  };

  const handleToggleIngredient = (id: string) => {
    setWizardData((prev) => {
      const exists = prev.selectedIngredientIds.includes(id);
      const next = exists
        ? prev.selectedIngredientIds.filter((i) => i !== id)
        : [...prev.selectedIngredientIds, id];
      return { ...prev, selectedIngredientIds: next };
    });
  };

  const handleAddCustomIngredient = (name: string) => {
    setWizardData((prev) => ({
      ...prev,
      customIngredients: [...prev.customIngredients, name],
    }));
  };

  const handleRemoveCustomIngredient = (name: string) => {
    setWizardData((prev) => ({
      ...prev,
      customIngredients: prev.customIngredients.filter((c) => c !== name),
    }));
  };

  const handleGenerateFromWizard = () => {
    setIsGenerating(true);
    setTypingStatusText('Sedang menganalisis kandungan nutrisi sorgum...');
    
    const userPromptText = `Rekomendasi resep ${wizardData.dishCategory.replace('_', ' ')} untuk ${
      wizardData.targetConsumers.join(', ')
    } dengan budget Rp ${wizardData.budgetPerPortion.toLocaleString('id-ID')}`;

    const newRecipe = generateRecipeFromWizard(wizardData);

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: userPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const aiMsg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      recipe: newRecipe,
      timestamp: 'Baru saja',
      isTypingStep: true,
      typingText: 'Sedang menulis langkah memasak...',
    };

    setChatMessages([userMsg, aiMsg]);
    setGeneratorMode('chat');
    setCurrentTab('generate');

    setTimeout(() => {
      setTypingStatusText('Menghitung estimasi rincian biaya bahan...');
    }, 900);

    setTimeout(() => {
      setIsGenerating(false);
      setChatMessages((prev) =>
        prev.map((m) => (m.id === aiMsg.id ? { ...m, isTypingStep: false } : m))
      );
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#163422', '#f4be55', '#7c5800', '#afcfa9'],
      });
    }, 1800);
  };

  // Chat Handlers
  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newRecipe = generateCustomRecipeQuery(text);

    const aiMsg: ChatMessage = {
      id: `msg-ai-${Date.now()}`,
      sender: 'ai',
      recipe: newRecipe,
      timestamp: 'Baru saja',
      isTypingStep: true,
      typingText: 'Sedang menyusun resep lezat sorgum...',
    };

    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setGeneratorMode('chat');
    setCurrentTab('generate');
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setChatMessages((prev) =>
        prev.map((m) => (m.id === aiMsg.id ? { ...m, isTypingStep: false } : m))
      );
    }, 1400);
  };

  const handleToggleSaveRecipe = (recipe: Recipe) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((s) => s.recipe.id === recipe.id || s.recipe.title === recipe.title);
      if (exists) {
        return prev.filter((s) => s.recipe.id !== recipe.id && s.recipe.title !== recipe.title);
      } else {
        const newSaved: SavedRecipe = {
          id: `saved-${Date.now()}`,
          recipe,
          savedAt: 'Baru saja',
          isFavorite: true,
        };
        return [newSaved, ...prev];
      }
    });
  };

  const isRecipeSaved = (recipeId?: string, title?: string) => {
    return savedRecipes.some(
      (s) => (recipeId && s.recipe.id === recipeId) || (title && s.recipe.title === title)
    );
  };

  const handleSelectRecentChat = (chatId: string) => {
    setActiveChatId(chatId);
    setGeneratorMode('chat');
    setCurrentTab('generate');
    if (chatId === 'chat-1') {
      const pRecipe = INITIAL_SAVED_RECIPES[0].recipe;
      setChatMessages([
        {
          id: `msg-pancake-user`,
          sender: 'user',
          text: 'Bagikan resep gluten-free pancake sorgum yang lembut untuk balita.',
          timestamp: '10:42 AM',
        },
        {
          id: `msg-pancake-ai`,
          sender: 'ai',
          recipe: pRecipe,
          timestamp: 'Kemarin',
        },
      ]);
    } else if (chatId === 'chat-2') {
      const bRecipe = INITIAL_SAVED_RECIPES[1].recipe;
      setChatMessages([
        {
          id: `msg-bread-user`,
          sender: 'user',
          text: 'Resep roti tawar sorgum tanpa tepung gandum untuk penderita diabetes.',
          timestamp: 'Kemarin',
        },
        {
          id: `msg-bread-ai`,
          sender: 'ai',
          recipe: bRecipe,
          timestamp: 'Kemarin',
        },
      ]);
    } else {
      setChatMessages([
        {
          id: 'msg-user-1',
          sender: 'user',
          text: 'Berikan saya resep nasi goreng sorgum untuk anak SD dengan budget 10 ribu.',
          timestamp: '10:42 AM',
        },
        {
          id: 'msg-ai-1',
          sender: 'ai',
          recipe: INITIAL_FEATURED_RECIPE,
          timestamp: 'Baru saja',
        },
      ]);
    }
  };

  const startGeneratorWithCategory = (categoryKey: string) => {
    setWizardData((prev) => ({
      ...prev,
      dishCategory: categoryKey as DishCategoryId,
    }));
    setWizardStep(1);
    setGeneratorMode('wizard');
    setCurrentTab('generate');
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#1A1C1B] font-['Manrope',sans-serif] flex flex-col justify-between overflow-x-hidden">
      {/* 1. MAIN CONTENT (FULL PAGE RECIPE DETAIL OR TABS) */}
      {selectedRecipeDetail ? (
        <RecipeDetailPage
          recipe={selectedRecipeDetail}
          isSaved={isRecipeSaved(selectedRecipeDetail.id, selectedRecipeDetail.title)}
          onBack={() => setSelectedRecipeDetail(null)}
          onToggleSave={handleToggleSaveRecipe}
          onOpenCookMode={(rec) => setCookModeRecipe(rec)}
          onOpenProfile={() => {
            setSelectedRecipeDetail(null);
            setCurrentTab('profile');
          }}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateTab={handleSelectTab}
        />
      ) : (
        <>
          {currentTab === 'home' && (
            <HomePage
              onOpenProfile={() => {
                setSelectedRecipeDetail(null);
                setCurrentTab('profile');
              }}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectCategory={startGeneratorWithCategory}
              onViewRecipe={(recipe) => setSelectedRecipeDetail(recipe)}
              onOpenVideoTutorial={(tut) => setSelectedVideoTutorial(tut)}
              onStartGenerator={() => {
                setWizardStep(1);
                setGeneratorMode('wizard');
                setCurrentTab('generate');
              }}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreRecipesPage
              onViewRecipe={(recipe) => setSelectedRecipeDetail(recipe)}
              onToggleSaveRecipe={handleToggleSaveRecipe}
              isRecipeSaved={isRecipeSaved}
              onStartGenerator={() => {
                setWizardStep(1);
                setGeneratorMode('wizard');
                setCurrentTab('generate');
              }}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              onOpenSearch={() => setIsSearchOpen(true)}
              onViewRecipe={(recipe) => setSelectedRecipeDetail(recipe)}
            />
          )}

          {currentTab === 'generate' && (
            <div className="flex-1 flex flex-row min-h-screen w-full relative">
              {/* Sidebar drawer in Chat mode */}
              {generatorMode === 'chat' && (
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  onNewRecipeChat={() => {
                    setChatMessages([]);
                    setWizardStep(1);
                    setGeneratorMode('wizard');
                  }}
                  recentChats={RECENT_CHAT_TOPICS}
                  activeChatId={activeChatId}
                  onSelectChat={handleSelectRecentChat}
                  savedRecipes={savedRecipes}
                  onSelectSavedRecipe={(saved) => setSelectedRecipeDetail(saved.recipe)}
                  onOpenProfile={() => {
                    setSelectedRecipeDetail(null);
                    setCurrentTab('profile');
                    setIsSidebarOpen(false);
                  }}
                  onStartWizard={() => {
                    setWizardStep(1);
                    setGeneratorMode('wizard');
                  }}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {/* Generator Workspace: Wizard or Chat */}
              <div className="flex-1 flex flex-col min-h-screen w-full relative pb-6">
                {generatorMode === 'wizard' ? (
                  /* Wizard Flow (4-Step) */
                  <main className="flex-1 flex flex-col justify-between py-3 sm:py-6">
                    <div className="w-full flex items-center justify-between px-4 max-w-md mx-auto">
                      <WizardProgressBar
                        currentStep={wizardStep}
                        totalSteps={4}
                        showStepText={wizardStep >= 3}
                        onBack={() => {
                          if (wizardStep > 1) {
                            setWizardStep((prev) => prev - 1);
                          } else {
                            setCurrentTab('home');
                          }
                        }}
                      />
                    </div>

                    {wizardStep === 1 && (
                      <WizardStep1
                        selectedConsumers={wizardData.targetConsumers}
                        onToggleConsumer={handleToggleConsumer}
                        onNext={() => setWizardStep(2)}
                      />
                    )}

                    {wizardStep === 2 && (
                      <WizardStep2
                        selectedCategory={wizardData.dishCategory}
                        onSelectCategory={(cat) => setWizardData((prev) => ({ ...prev, dishCategory: cat }))}
                        onPrevious={() => setWizardStep(1)}
                        onNext={() => setWizardStep(3)}
                      />
                    )}

                    {wizardStep === 3 && (
                      <WizardStep3
                        selectedIngredientIds={wizardData.selectedIngredientIds}
                        customIngredients={wizardData.customIngredients}
                        onToggleIngredient={handleToggleIngredient}
                        onAddCustomIngredient={handleAddCustomIngredient}
                        onRemoveCustomIngredient={handleRemoveCustomIngredient}
                        onPrevious={() => setWizardStep(2)}
                        onNext={() => setWizardStep(4)}
                      />
                    )}

                    {wizardStep === 4 && (
                      <WizardStep4
                        formData={wizardData}
                        onUpdateBudget={(budget) => setWizardData((prev) => ({ ...prev, budgetPerPortion: budget }))}
                        onUpdatePrepTime={(time) => setWizardData((prev) => ({ ...prev, prepTimeLimit: time }))}
                        onPrevious={() => setWizardStep(3)}
                        onGenerateRecipe={handleGenerateFromWizard}
                        isLoading={isGenerating}
                      />
                    )}
                  </main>
                ) : (
                  /* Chat Workspace */
                  <div className="flex-1 flex flex-col h-full w-full relative">
                    {/* TopAppBar matching clean specification */}
                    <header className="bg-[#F9F9F7]/80 backdrop-blur-md sticky top-0 w-full z-30 flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          id="btn-hamburger-menu"
                          onClick={() => setIsSidebarOpen(true)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[#1A1C1B] hover:bg-[#e2e3e1] transition-colors cursor-pointer"
                          aria-label="Buka Menu"
                        >
                          <Menu className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsHistoryDrawerOpen(!isHistoryDrawerOpen)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-[#424843] hover:bg-[#e2e3e1] active:scale-95 transition-all duration-150 cursor-pointer"
                          title="Riwayat Resep"
                        >
                          <History className="w-5 h-5" />
                        </button>
                      </div>
                    </header>

                    <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-36 pt-6 md:pt-10 flex flex-col items-center">
                      <div className="w-full max-w-3xl flex-1 flex flex-col justify-center">
                        {chatMessages.length === 0 ? (
                          <div className="w-full max-w-3xl flex-1 flex flex-col justify-center min-h-[55vh]">
                            {/* Hero Section */}
                            <div className="text-center space-y-3 mb-10">
                              <h1 className="text-[2.3rem] sm:text-4xl md:text-5xl font-bold gemini-gradient-text tracking-tight pb-1 leading-tight">
                                Apa yang ingin Anda masak hari ini?
                              </h1>
                              <p className="text-sm sm:text-base md:text-lg text-[#424843]">
                                SorghumCare AI siap membantu Anda menemukan resep sehat dan lezat.
                              </p>
                            </div>

                            {/* Suggestions Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto w-full mb-8">
                              <button
                                onClick={() => handleSendMessage('Gluten-free sorghum pancakes dengan madu')}
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#f4f4f2] border border-[#c2c8c0]/60 hover:border-[#163422]/50 text-left transition-all shadow-xs group cursor-pointer"
                              >
                                <span className="w-9 h-9 rounded-xl bg-[#cbebc3]/40 text-[#163422] flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                                  🥞
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs sm:text-sm text-[#163422] block truncate">
                                    Gluten-free pancakes
                                  </span>
                                  <span className="text-[11px] text-[#727972] block truncate">
                                    Pancake lembut tanpa terigu
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={() => handleSendMessage('Resep roti tawar biji sorgum untuk sarapan sehat')}
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#f4f4f2] border border-[#c2c8c0]/60 hover:border-[#163422]/50 text-left transition-all shadow-xs group cursor-pointer"
                              >
                                <span className="w-9 h-9 rounded-xl bg-[#ffdea7]/40 text-[#7c5800] flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                                  🍞
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs sm:text-sm text-[#163422] block truncate">
                                    Sorghum bread recipe
                                  </span>
                                  <span className="text-[11px] text-[#727972] block truncate">
                                    Roti rustic kaya serat
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={() => handleSendMessage('Ide makan malam rendah indeks glikemik (Low GI) dengan beras sorgum')}
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white hover:bg-[#f4f4f2] border border-[#c2c8c0]/60 hover:border-[#163422]/50 text-left transition-all shadow-xs group cursor-pointer"
                              >
                                <span className="w-9 h-9 rounded-xl bg-[#cbebc3]/40 text-[#163422] flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                                  🥗
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs sm:text-sm text-[#163422] block truncate">
                                    Low GI dinner ideas
                                  </span>
                                  <span className="text-[11px] text-[#727972] block truncate">
                                    Aman untuk gula darah
                                  </span>
                                </div>
                              </button>

                              <button
                                id="btn-hero-smart-generate"
                                onClick={() => {
                                  setWizardStep(1);
                                  setGeneratorMode('wizard');
                                }}
                                className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#163422] hover:bg-[#2d4b37] text-white text-left transition-all shadow-md group cursor-pointer active:scale-[0.98]"
                              >
                                <span className="w-9 h-9 rounded-xl bg-white/20 text-[#fdc65c] flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
                                  ✨
                                </span>
                                <div className="min-w-0">
                                  <span className="font-bold text-xs sm:text-sm text-white block truncate flex items-center gap-1.5">
                                    <span>Smart Generate</span>
                                    <span className="text-[10px] bg-[#fdc65c] text-[#163422] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                                      4 Langkah
                                    </span>
                                  </span>
                                  <span className="text-[11px] text-white/80 block truncate">
                                    Kustomisasi target konsumen &amp; budget
                                  </span>
                                </div>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-6 w-full py-2">
                            {chatMessages.map((msg) => {
                              if (msg.sender === 'user') {
                                return (
                                  <div key={msg.id} className="flex flex-col items-end">
                                    <div className="bg-[#163422] text-white p-4 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[75%] shadow-sm">
                                      <p className="text-sm sm:text-base font-normal leading-relaxed">
                                        {msg.text}
                                      </p>
                                    </div>
                                    <span className="text-[10px] text-[#727972] mt-1 px-2">
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                );
                              }

                              if (msg.recipe) {
                                return (
                                  <div key={msg.id} className="flex flex-col items-start w-full">
                                    <RecipeCardView
                                      recipe={msg.recipe}
                                      isTyping={msg.isTypingStep}
                                      typingText={msg.typingText || typingStatusText}
                                      isSaved={isRecipeSaved(msg.recipe.id, msg.recipe.title)}
                                      onToggleSave={handleToggleSaveRecipe}
                                      onOpenCookMode={(rec) => setCookModeRecipe(rec)}
                                    />
                                    <span className="text-[10px] text-[#727972] mt-2 px-1">
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                );
                              }

                              return null;
                            })}
                          </div>
                        )}
                      </div>
                    </main>

                    {/* Input Bar docked cleanly at bottom without navbar */}
                    <div className="fixed md:absolute bottom-0 left-0 right-0 z-20">
                      <ChatInputBar
                        onSendMessage={handleSendMessage}
                        isLoading={isGenerating}
                        onOpenImagePicker={() => setIsImagePickerOpen(true)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 2. BOTTOM NAVIGATION BAR (Hidden on Generate tab) */}
      {currentTab !== 'generate' && (
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
        />
      )}

      {/* 3. MODALS & POPUPS */}
      {/* Video Tutorial Modal */}
      {selectedVideoTutorial && (
        <VideoTutorialModal
          tutorial={selectedVideoTutorial}
          onClose={() => setSelectedVideoTutorial(null)}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectRecipe={(rec) => setSelectedRecipeDetail(rec)}
        onSearchQuery={(query) => {
          handleSendMessage(query);
        }}
      />

      {/* Cook Mode Modal */}
      {cookModeRecipe && (
        <CookModeModal
          recipe={cookModeRecipe}
          onClose={() => setCookModeRecipe(null)}
        />
      )}

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onSelectSampleImage={(title, prompt) => {
          handleSendMessage(prompt);
        }}
      />

      {/* History Drawer Modal */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1C1B]/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e3e1]">
                <h3 className="font-bold text-base text-[#163422] flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Riwayat Percakapan
                </h3>
                <button
                  onClick={() => setIsHistoryDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#f4f4f2] flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-2">
                {RECENT_CHAT_TOPICS.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      handleSelectRecentChat(chat.id);
                      setIsHistoryDrawerOpen(false);
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[#f9f9f7] border border-[#e2e3e1] transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs text-[#163422]">{chat.title}</span>
                      <span className="text-[10px] text-[#727972]">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-[#424843] truncate">{chat.preview}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([]);
                setWizardStep(1);
                setGeneratorMode('wizard');
                setIsHistoryDrawerOpen(false);
              }}
              className="w-full py-3 bg-[#163422] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Mulai Percakapan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
