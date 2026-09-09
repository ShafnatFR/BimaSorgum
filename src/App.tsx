import React, { useState, useEffect } from 'react';
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
import { generateRecipeFromWizard, generateCustomRecipeQuery, generateRecipeFromWizardAsync, generateCustomRecipeQueryAsync } from './services/recipeGenerator';
import { 
  getCurrentPath, 
  parseRoute, 
  navigateToSlug, 
  RouteSlugs 
} from './utils/slugRouter';
import { 
  findRecipeBySlug, 
  findTutorialBySlug, 
  getRecipeSlug, 
  CATEGORY_SLUG_MAP, 
  SLUG_TO_CATEGORY_MAP 
} from './utils/slugify';

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
import MarkdownText from './components/Chat/MarkdownText';

import { CookModeModal } from './components/Modals/CookModeModal';
import { RecipeDetailPage } from './components/RecipeDetail/RecipeDetailPage';
import { ImageUploadModal } from './components/Modals/ImageUploadModal';
import { VideoTutorialModal } from './components/Modals/VideoTutorialModal';
import { SearchModal } from './components/Modals/SearchModal';
import { useData } from './lib/dataContext';
import { upsertRecipe, fetchRecipeBySlug, fetchSavedRecipeIds, createChatSession, saveChatMessages, fetchChatSessions, fetchChatSessionMessages, renameChatSession, touchChatSession, mapRecipe, deleteChatSession, fetchSessionRecipeIds, deleteOwnedRecipe } from './lib/supabase';
import type { DbChatMessageRow } from './lib/supabase';
import { bimaChat } from './services/bimaClient';

import { Menu, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Supabase data layer (catalog from DB + saved recipes per anonymous user)
  const { 
    ready, 
    recipes: dbRecipes, 
    savedRecipes: dbSavedRecipes, 
    savedIds, 
    toggleSave, 
    isSavedForRecipe, 
    generateAndSave, 
    publishRecipe: publishRecipeCtx,
    removeGeneratedRecipe: removeGeneratedRecipeCtx,
    refetchSaved, 
    getRecipeBySlug: dbGetRecipeBySlug,
    getRecipeById: dbGetRecipeById,
    recipesByCategory: dbRecipesByCategory,
  } = useData();

  // Navigation: 'home' is the primary home page requested by user
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [generatorMode, setGeneratorMode] = useState<'wizard' | 'chat'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const [exploreCategoryKey, setExploreCategoryKey] = useState<string>('all');

  // Dynamic & saved recipes
  const [dynamicRecipes, setDynamicRecipes] = useState<Recipe[]>([]);
  // Saved recipes now come from Supabase (per anonymous user)
  const savedRecipes: SavedRecipe[] = dbSavedRecipes;
  const [activeChatId, setActiveChatId] = useState<string>('chat-4');
  // Chat sessions loaded from Supabase (anonymous user's history)
  const [chatSessions, setChatSessions] = useState<{ id: string; title: string; created_at?: string }[]>([]);
  // DB id of the currently-open chat session (null = fresh unsaved conversation)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  // Sync mirror so async persist doesn't double-create sessions on rapid sends.
  const currentSessionIdRef = React.useRef<string | null>(null);
  const setSessionIdBoth = (id: string | null) => {
      currentSessionIdRef.current = id;
      setCurrentSessionId(id);
    };

    // Convert persisted chat_messages rows into the same shape used by the UI.
    const rowsToChatMessages = (rows: DbChatMessageRow[]): ChatMessage[] =>
      rows.map((row) => {
        const timestamp = row.created_at
          ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '';
        if (row.sender === 'user') return { id: `msg-${row.id}`, sender: 'user', text: row.content || '', timestamp };
        if (row.recipe && (row as any)._recipeWithChildren) {
          return { id: `msg-${row.id}`, sender: 'ai', recipe: (row as any)._recipeWithChildren, timestamp };
        }
        if (row.recipe && (row.recipe as unknown as Recipe)?.title) {
          return { id: `msg-${row.id}`, sender: 'ai', recipe: mapRecipe(row.recipe as any), timestamp };
        }
        return { id: `msg-${row.id}`, sender: 'ai', text: row.content || '', timestamp };
      });

  // Load chat sessions from DB once user is ready
  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetchChatSessions().then(async (sessions) => {
      if (!alive) return;
      if (!sessions.length) return;
      const mapped = sessions.map((s) => ({ id: s.id, title: s.title, created_at: s.created_at }));
      setChatSessions(mapped);
      setSessionIdBoth(sessions[0].id);
      setActiveChatId(sessions[0].id);
      // Auto-open the most recent session so the chat shows its real history.
      const rows = await fetchChatSessionMessages(sessions[0].id);
      if (!alive || !rows.length) return;
      setChatMessages(rowsToChatMessages(rows));
    });
    return () => { alive = false; };
  }, [ready]);

  // Wizard Form State
  const [wizardData, setWizardData] = useState<WizardFormData>({
    targetConsumers: ['anak_sekolah'],
    dishCategory: 'makanan_berat',
    selectedIngredientIds: ['biji_sorgum'],
    customIngredients: ['Bawang Merah', 'Santan'],
    budgetPerPortion: 10000,
    prepTimeLimit: 'Maks 30 Menit',
  });
  
  // Initial messages — start clean; the hero/empty-state shows when empty.
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [typingStatusText, setTypingStatusText] = useState<string>('Sedang menulis langkah memasak...');

  // Modals state
  const [cookModeRecipe, setCookModeRecipe] = useState<Recipe | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [selectedVideoTutorial, setSelectedVideoTutorial] = useState<VideoTutorialItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);

  // Sync state from URL slug on mount and popstate/hashchange
  useEffect(() => {
    const handleUrlChange = () => {
      const rawPath = getCurrentPath();
      const parsed = parseRoute(rawPath);

      if (parsed.routeType === 'recipe' && parsed.slug) {
        const found =
          findRecipeBySlug(parsed.slug, dynamicRecipes) || dbGetRecipeBySlug(parsed.slug);
        if (found) {
          setSelectedRecipeDetail(found);
          setCookModeRecipe(null);
          setSelectedVideoTutorial(null);
          setIsSearchOpen(false);
          return;
        } else {
          // Fallback: fetch by slug from Supabase (deep-link before catalog loaded)
          fetchRecipeBySlug(parsed.slug).then((r) => {
            if (r) {
              setSelectedRecipeDetail(r);
              setCookModeRecipe(null);
              setSelectedVideoTutorial(null);
              setIsSearchOpen(false);
            }
          });
          return;
        }
      }

      if (parsed.routeType === 'cook' && parsed.slug) {
        const found =
          findRecipeBySlug(parsed.slug, dynamicRecipes) || dbGetRecipeBySlug(parsed.slug);
        if (found) {
          setCookModeRecipe(found);
          setSelectedVideoTutorial(null);
          setIsSearchOpen(false);
          return;
        } else {
          fetchRecipeBySlug(parsed.slug).then((r) => {
            if (r) {
              setCookModeRecipe(r);
              setSelectedVideoTutorial(null);
              setIsSearchOpen(false);
            }
          });
          return;
        }
      }

      if (parsed.routeType === 'tutorial' && parsed.slug) {
        const found = findTutorialBySlug(parsed.slug);
        if (found) {
          setSelectedVideoTutorial(found);
          setIsSearchOpen(false);
          return;
        }
      }

      if (parsed.routeType === 'search') {
        setIsSearchOpen(true);
        return;
      }

      // Close modal overlays if route is a standard page
      setSelectedRecipeDetail(null);
      setCookModeRecipe(null);
      setSelectedVideoTutorial(null);
      setIsSearchOpen(false);

      if (parsed.routeType === 'wizard') {
        setCurrentTab('generate');
        setGeneratorMode('wizard');
        setWizardStep(parsed.wizardStep || 1);
      } else if (parsed.routeType === 'generate') {
        setCurrentTab('generate');
        setGeneratorMode('chat');
      } else if (parsed.routeType === 'explore') {
        setCurrentTab('explore');
        if (parsed.categoryFilter) {
          setExploreCategoryKey(parsed.categoryFilter);
        }
      } else if (parsed.routeType === 'profile') {
        setCurrentTab('profile');
      } else {
        setCurrentTab('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [dynamicRecipes, dbRecipes, dbGetRecipeBySlug, ready]);

  // Tab Selection with Slug Update
  const handleSelectTab = (tab: AppTab) => {
    setSelectedRecipeDetail(null);
    setCookModeRecipe(null);
    setSelectedVideoTutorial(null);
    setIsSearchOpen(false);
    setCurrentTab(tab);

    if (tab === 'generate') {
      setGeneratorMode('chat');
      navigateToSlug(RouteSlugs.generate());
    } else if (tab === 'explore') {
      navigateToSlug(RouteSlugs.explore());
    } else if (tab === 'profile') {
      navigateToSlug(RouteSlugs.profile());
    } else {
      navigateToSlug(RouteSlugs.home());
    }
  };

  // Recipe View Navigation
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipeDetail(recipe);
    setCookModeRecipe(null);
    setSelectedVideoTutorial(null);
    setIsSearchOpen(false);
    navigateToSlug(RouteSlugs.recipe(recipe));
  };

  // Cook Mode Navigation
  const handleOpenCookMode = (recipe: Recipe) => {
    setCookModeRecipe(recipe);
    navigateToSlug(RouteSlugs.cook(recipe));
  };

  const handleCloseCookMode = () => {
    setCookModeRecipe(null);
    if (selectedRecipeDetail) {
      navigateToSlug(RouteSlugs.recipe(selectedRecipeDetail));
    } else {
      navigateToSlug(RouteSlugs[currentTab] ? RouteSlugs[currentTab]() : '/home');
    }
  };

  // Tutorial Video Navigation
  const handleOpenTutorial = (tut: VideoTutorialItem) => {
    setSelectedVideoTutorial(tut);
    navigateToSlug(RouteSlugs.tutorial(tut));
  };

  const handleCloseTutorial = () => {
    setSelectedVideoTutorial(null);
    navigateToSlug(RouteSlugs[currentTab] ? RouteSlugs[currentTab]() : '/home');
  };

  // Search Navigation
  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    navigateToSlug(RouteSlugs.search());
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    if (selectedRecipeDetail) {
      navigateToSlug(RouteSlugs.recipe(selectedRecipeDetail));
    } else {
      navigateToSlug(RouteSlugs[currentTab] ? RouteSlugs[currentTab]() : '/home');
    }
  };

  // Wizard Step Navigation
  const handleSetWizardStep = (step: number) => {
    setWizardStep(step);
    setGeneratorMode('wizard');
    setCurrentTab('generate');
    navigateToSlug(RouteSlugs.wizard(step));
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

  const handleGenerateFromWizard = async () => {
    setIsGenerating(true);
    setTypingStatusText('Sedang menganalisis kandungan nutrisi sorgum...');
    
    const userPromptText = `Rekomendasi resep ${wizardData.dishCategory.replace('_', ' ')} untuk ${
      wizardData.targetConsumers.join(', ')
    } dengan budget Rp ${wizardData.budgetPerPortion.toLocaleString('id-ID')}${
      wizardData.prepTimeLimit ? ` dan waktu persiapan ${wizardData.prepTimeLimit.toLowerCase()}` : ''
    }`;

    const newRecipe = await generateRecipeFromWizardAsync(wizardData);
    setDynamicRecipes((prev) => [newRecipe, ...prev]);
    // Persist generated recipe to Supabase (user recipe, RLS owner-scoped)
    generateAndSave(newRecipe).then((stored) => {
      if (stored && stored.slug) {
        setDynamicRecipes((prev) =>
          prev.map((r) => (r.id === newRecipe.id ? { ...r, id: stored.id, slug: stored.slug } : r))
        );
      }
    });

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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTypingStep: true,
      typingText: 'Sedang menulis langkah memasak...',
    };

    setChatMessages([userMsg, aiMsg]);
    setGeneratorMode('chat');
    setCurrentTab('generate');
    navigateToSlug(RouteSlugs.generate());
    // Persist the wizard conversation as a new chat session (title = recipe name).
    persistChatExchange(userPromptText, newRecipe.title, newRecipe);

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
  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 1) Optimistic user message — render immediately, no waiting on the LLM.
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const aiPlaceholderId = `msg-ai-${Date.now()}`;
    const aiPlaceholder: ChatMessage = {
      id: aiPlaceholderId,
      sender: 'ai',
      text: 'Sedang menyusun respons...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isTypingStep: true,
      typingText: 'SorghumCare AI sedang berpikir...',
    };
    setChatMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setGeneratorMode('chat');
    setCurrentTab('generate');
    navigateToSlug(RouteSlugs.generate());
    setIsGenerating(true);

    // 2) Build conversation history (for multi-turn context on general chat).
    const history = chatMessages
      .filter((m) => m.text || m.recipe)
      .map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text || m.recipe?.title || '',
      }))
      .filter((h) => h.content.trim());

    // 3) Decide intent. Only an EXPLICIT recipe order ("buatkan resep X") should
    //    trigger the structured recipe card. Vague questions like "bingung mau
    //    apa / ada saran / rekomendasi" stay conversational (list + follow-up).
    const explicitRecipeOrder =
      /\b(buatkan?|berikan?|carikan?|tuliskan?|buatin|kasih(?:kan)?|resep(?:kan)?)\b.*\b(resep|masak(?:an)?|menu|hidangan|makanan)\b/i.test(trimmed) &&
      !/bingung|saran|rekomendasi|apa saja|ada apa|pilih|pilihan|ide|gagasan|inspirasi|rekomend|\?$|gimana|bagaimana|apa yang/i.test(trimmed);

    const isConversational = !explicitRecipeOrder;

    try {
      if (explicitRecipeOrder) {
        // Recipe flow: generate a structured recipe (with DB persistence).
        const newRecipe = await generateCustomRecipeQueryAsync(trimmed);
        setDynamicRecipes((prev) => [newRecipe, ...prev]);
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiPlaceholderId
              ? { ...m, recipe: newRecipe, text: undefined, isTypingStep: false }
              : m
          )
        );
        persistChatExchange(trimmed, newRecipe.title, newRecipe);
      } else {
        // General chat flow: free-form AI answer, no recipe card.
        const answer = await bimaChat(trimmed, history, { useRag: true });
        const replyText = answer.response?.trim() || 'Maaf, saya belum bisa memproses permintaan itu.';
        setChatMessages((prev) =>
          prev.map((m) =>
            m.id === aiPlaceholderId
              ? { ...m, text: replyText, isTypingStep: false }
              : m
          )
        );
        // Persist the FULL reply so history playback is never truncated.
        persistChatExchange(trimmed, replyText, null);
      }
    } catch (e) {
      console.error('chat error:', e);
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === aiPlaceholderId
            ? { ...m, text: 'Maaf, terjadi kendala saat menghubungi AI. Coba lagi sebentar ya.', isTypingStep: false }
            : m
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Derive a concise, conversational session title from a user prompt.
  const deriveSessionTitle = (userText: string, recipe: Recipe | null): string => {
    // If we generated a recipe, use its dish name — reads like a topic, like GPT.
    if (recipe?.title) {
      return recipe.title.length > 60 ? recipe.title.slice(0, 57).trimEnd() + '…' : recipe.title;
    }
    // General chat: strip leading boilerplate ("tolong", "berikan saya", ...) and
    // keep the core ask. Fall back to truncated raw text if nothing else remains.
    const cleaned = userText
      .replace(/^(tolong|bantu|bisa|mohon|kak|bang|mas|bu|pak)?\s*(saya|aku)?\s*(mau|ingin|butuh)?\s*(berikan|carikan|buatkan|buatin|kasih|resepkan|tolong)\s+(saya|aku)?\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    const base = cleaned || userText;
    return base.length > 60 ? base.slice(0, 57).trimEnd() + '…' : base;
  };

  // Persist a chat exchange to Supabase (session + messages + optional recipe).
  const persistChatExchange = async (userText: string, aiText: string, recipe: Recipe | null) => {
    try {
      let sessionId = currentSessionIdRef.current;
      if (!sessionId) {
        // Fresh conversation: create a session, title = smart summary.
        const title = deriveSessionTitle(userText, recipe);
        const session = await createChatSession(title);
        if (!session) return;
        sessionId = session.id;
        setSessionIdBoth(session.id);
        setChatSessions((prev) => [{ id: session.id, title: session.title, created_at: session.created_at }, ...prev]);
        setActiveChatId(session.id);
      }
      let recipeId: string | null = null;
      if (recipe) {
        const stored = await generateAndSave(recipe);
        recipeId = stored?.id ?? null;
        // Session title = dish name (reads like a GPT/Gemini topic summary).
        const betterTitle = recipe.title.length > 60 ? recipe.title.slice(0, 57).trimEnd() + '…' : recipe.title;
        if (sessionId && betterTitle) {
          await renameChatSession(sessionId, betterTitle);
          setChatSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: betterTitle } : s)));
        }
      }
      await saveChatMessages(sessionId, [
        { sender: 'user', content: userText },
        { sender: 'ai', content: aiText, recipe_id: recipeId },
      ]);
      // Keep session ordering by most-recent-activity in Recent lists.
      await touchChatSession(sessionId);
    } catch (e) {
      console.error('persistChat error:', e);
    }
  };

  const handleToggleSaveRecipe = (recipe: Recipe) => {
    // Persist toggle to Supabase (insert/delete saved_recipes), then refetch
    toggleSave(recipe).then(() => {
      refetchSaved();
    });
    // Optimistic update is handled by context state change after refetch.
  };

  // Recipes currently being uploaded (publish-to-Explore) by their db/source id.
  const [publishingIds, setPublishingIds] = useState<Set<string>>(new Set());

  const handlePublishRecipe = async (recipe: Recipe) => {
    // Ensure the recipe row exists in DB (it may still carry a client-side id).
    const stored = recipe.id.startsWith('recipe-')
      ? await generateAndSave(recipe, { publish: true })
      : recipe;
    if (!stored?.id) return;
    setPublishingIds((prev) => new Set(prev).add(stored.id));
    try {
      const ok = await publishRecipeCtx(stored.id);
      if (ok) {
        // Update any in-memory copy so the button flips to "Di Explore".
        setChatMessages((prev) =>
          prev.map((m) =>
            m.recipe && (m.recipe.id === recipe.id || m.recipe.slug === recipe.slug)
              ? { ...m, recipe: { ...m.recipe, isPublished: true } }
              : m
          )
        );
        setDynamicRecipes((prev) =>
          prev.map((r) =>
            r.id === stored.id || r.slug === stored.slug ? { ...r, isPublished: true } : r
          )
        );
        // Refresh catalog so the recipe appears in Explore immediately.
        refetchSaved();
        generateAndSave({ ...stored, isPublished: true }, { publish: true });
      }
    } finally {
      setPublishingIds((prev) => {
        const next = new Set(prev);
        next.delete(stored.id);
        return next;
      });
    }
  };

  const handleDeleteRecentSession = async (sessionId: string) => {
    try {
      // Collect recipe ids inside this session first (before messages are gone).
      const recipeIds = await fetchSessionRecipeIds(sessionId);
      const ok = await deleteChatSession(sessionId);
      if (!ok) return;
      // Remove owned generated recipes referenced by the session.
      for (const rid of recipeIds) {
        await deleteOwnedRecipe(rid);
      }
      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionIdRef.current === sessionId) {
        setSessionIdBoth(null);
        setChatMessages([]);
        setActiveChatId(`chat-${Date.now()}`);
      }
      refetchSaved();
    } catch (e) {
      console.error('delete recent session error:', e);
    }
  };

  const isRecipeSaved = (recipeId?: string, title?: string) => {
    if (recipeId && savedIds.has(recipeId)) return true;
    return savedRecipes.some(
      (s) => (recipeId && s.recipe.id === recipeId) || (title && s.recipe.title === title)
    );
  };

  // Is this recipe currently public (in Explore catalog)?
  const isRecipePublished = (recipe: Recipe): boolean => {
    if (recipe.isPublished) return true;
    return dbRecipes.some(
      (r) => r.slug === recipe.slug || r.id === recipe.id
    );
  };

  const handleSelectRecentChat = async (chatId: string) => {
      setActiveChatId(chatId);
      setGeneratorMode('chat');
      setCurrentTab('generate');

      // Only DB session ids (uuid) can be loaded back.
      if (chatId === 'chat-1' || chatId === 'chat-2' || chatId === 'chat-3' || chatId === 'chat-4') {
        // Legacy mock topics (no persisted session): keep the preset kit.
        handleSelectMockRecent(chatId);
        return;
      }

      setSessionIdBoth(chatId);
      const rows = await fetchChatSessionMessages(chatId);
      if (!rows.length) {
        setChatMessages([]);
        return;
      }
      setChatMessages(rowsToChatMessages(rows));
    };

    // Legacy mock chat presets (shown when no DB session exists yet).
    const handleSelectMockRecent = (chatId: string) => {
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
    handleSetWizardStep(1);
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-[#1A1C1B] font-['Manrope',sans-serif] flex flex-col justify-between overflow-x-hidden">
      {/* 1. MAIN CONTENT (FULL PAGE RECIPE DETAIL OR TABS) */}
      {selectedRecipeDetail ? (
        <RecipeDetailPage
          recipe={selectedRecipeDetail}
          isSaved={isRecipeSaved(selectedRecipeDetail.id, selectedRecipeDetail.title)}
          onBack={() => {
            setSelectedRecipeDetail(null);
            navigateToSlug(RouteSlugs[currentTab] ? RouteSlugs[currentTab]() : '/home');
          }}
          onToggleSave={handleToggleSaveRecipe}
          onOpenCookMode={handleOpenCookMode}
          onOpenProfile={() => {
            setSelectedRecipeDetail(null);
            handleSelectTab('profile');
          }}
          onOpenSearch={handleOpenSearch}
          onNavigateTab={handleSelectTab}
        />
      ) : (
        <>
          {currentTab === 'home' && (
            <HomePage
              onOpenProfile={() => {
                setSelectedRecipeDetail(null);
                handleSelectTab('profile');
              }}
              onOpenSearch={handleOpenSearch}
              onSelectCategory={startGeneratorWithCategory}
              onViewRecipe={handleViewRecipe}
              onOpenVideoTutorial={handleOpenTutorial}
              onStartGenerator={() => {
                handleSetWizardStep(1);
              }}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreRecipesPage
              initialCategory={exploreCategoryKey}
              onSelectCategorySlug={(catKey) => {
                setExploreCategoryKey(catKey);
                navigateToSlug(RouteSlugs.explore(catKey));
              }}
              onViewRecipe={handleViewRecipe}
              onToggleSaveRecipe={handleToggleSaveRecipe}
              isRecipeSaved={isRecipeSaved}
              onStartGenerator={() => {
                handleSetWizardStep(1);
              }}
              recipesOverride={dbRecipes}
            />
          )}

          {currentTab === 'profile' && (
            <ProfilePage
              onOpenSearch={handleOpenSearch}
              onViewRecipe={handleViewRecipe}
              savedRecipes={savedRecipes}
              onRemoveSaved={(recipe) => {
                toggleSave(recipe).then(() => refetchSaved());
              }}
              onSaveProfile={(name, role) => {
                // Persist display name to profile (role kept locally)
                import('./lib/supabase').then((m) => m.updateProfileName(name));
              }}
            />
          )}

          {currentTab === 'generate' && (
                      <div className="flex-1 flex flex-row min-h-screen w-full relative">
                        {/* Sidebar (left) — hidden completely when toggled off */}
                        {generatorMode === 'chat' && isSidebarOpen && (
                          <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                  onNewRecipeChat={() => {
                                      // Reset to a fresh chat session in-place (stay in chat mode).
                                      setChatMessages([]);
                                      setSessionIdBoth(null);
                                      setActiveChatId(`chat-${Date.now()}`);
                                      setGeneratorMode('chat');
                                      setCurrentTab('generate');
                                      setIsGenerating(false);
                                      setIsSidebarOpen(false);
                                      navigateToSlug(RouteSlugs.generate());
                                    }}
                  recentChats={
                    chatSessions.length
                      ? chatSessions.map((s) => ({
                          id: s.id,
                          title: s.title,
                          time: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : undefined,
                        }))
                      : RECENT_CHAT_TOPICS
                  }
                  activeChatId={activeChatId}
                  onSelectChat={handleSelectRecentChat}
                  onDeleteChat={handleDeleteRecentSession}
                  savedRecipes={savedRecipes}
                                    onSelectSavedRecipe={(saved) => handleViewRecipe(saved.recipe)}
                                    onSeeAllRecipes={() => {
                                      setSelectedRecipeDetail(null);
                                      handleSelectTab('profile');
                                      setIsSidebarOpen(false);
                                    }}
                  onOpenProfile={() => {
                    setSelectedRecipeDetail(null);
                    handleSelectTab('profile');
                    setIsSidebarOpen(false);
                  }}
                  onStartWizard={() => {
                    handleSetWizardStep(1);
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
                            handleSetWizardStep(wizardStep - 1);
                          } else {
                            handleSelectTab('home');
                          }
                        }}
                      />
                    </div>

                    {wizardStep === 1 && (
                      <WizardStep1
                        selectedConsumers={wizardData.targetConsumers}
                        onToggleConsumer={handleToggleConsumer}
                        onNext={() => handleSetWizardStep(2)}
                      />
                    )}

                    {wizardStep === 2 && (
                      <WizardStep2
                        selectedCategory={wizardData.dishCategory}
                        onSelectCategory={(cat) => setWizardData((prev) => ({ ...prev, dishCategory: cat }))}
                        onPrevious={() => handleSetWizardStep(1)}
                        onNext={() => handleSetWizardStep(3)}
                      />
                    )}

                    {wizardStep === 3 && (
                      <WizardStep3
                        selectedIngredientIds={wizardData.selectedIngredientIds}
                        customIngredients={wizardData.customIngredients}
                        onToggleIngredient={handleToggleIngredient}
                        onAddCustomIngredient={handleAddCustomIngredient}
                        onRemoveCustomIngredient={handleRemoveCustomIngredient}
                        onPrevious={() => handleSetWizardStep(2)}
                        onNext={() => handleSetWizardStep(4)}
                      />
                    )}

                    {wizardStep === 4 && (
                      <WizardStep4
                        formData={wizardData}
                        onUpdateBudget={(budget) => setWizardData((prev) => ({ ...prev, budgetPerPortion: budget }))}
                        onUpdatePrepTime={(time) => setWizardData((prev) => ({ ...prev, prepTimeLimit: time }))}
                        onPrevious={() => handleSetWizardStep(3)}
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
                          onClick={() => setIsSidebarOpen((v) => !v)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            isSidebarOpen ? 'bg-[#163422] text-white' : 'text-[#1A1C1B] hover:bg-[#e2e3e1]'
                          }`}
                          aria-label={isSidebarOpen ? 'Sembunyikan Menu' : 'Tampilkan Menu'}
                          title={isSidebarOpen ? 'Sembunyikan sidebar' : 'Tampilkan sidebar'}
                        >
                          <Menu className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2" />
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
                                  handleSetWizardStep(1);
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
                                      onOpenCookMode={handleOpenCookMode}
                                      isPublished={!!msg.recipe.isPublished || isRecipePublished(msg.recipe)}
                                      onPublish={handlePublishRecipe}
                                      isPublishing={publishingIds.has(msg.recipe.id) || publishingIds.has(msg.recipe.slug || '')}
                                    />
                                    <span className="text-[10px] text-[#727972] mt-2 px-1">
                                      {msg.timestamp}
                                    </span>
                                  </div>
                                );
                              }

                              // AI text message (general chat, no recipe card)
                              if (msg.sender === 'ai' && msg.text) {
                                return (
                                  <div key={msg.id} className="flex flex-col items-start w-full">
                                    <div className="bg-white text-[#1A1C1B] p-4 rounded-2xl rounded-tl-none max-w-[85%] sm:max-w-[75%] shadow-sm border border-[#e2e3e1]">
                                      {msg.isTypingStep ? (
                                        <div className="flex items-center gap-2 text-[#727972]">
                                          <span className="flex gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#163422] animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#163422] animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#163422] animate-bounce" style={{ animationDelay: '300ms' }} />
                                          </span>
                                          <span className="text-xs">{msg.typingText || 'Mengetik...'}</span>
                                        </div>
                                      ) : (
                                        <MarkdownText text={msg.text} />
                                      )}
                                    </div>
                                    <span className="text-[10px] text-[#727972] mt-1 px-2">
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
          onClose={handleCloseTutorial}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectRecipe={handleViewRecipe}
        recipes={dbRecipes}
        onSearchQuery={(query) => {
          handleSendMessage(query);
        }}
      />

      {/* Cook Mode Modal */}
      {cookModeRecipe && (
        <CookModeModal
          recipe={cookModeRecipe}
          onClose={handleCloseCookMode}
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
    </div>
  );
}
