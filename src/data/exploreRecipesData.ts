import { Recipe } from '../types';
import { INITIAL_FEATURED_RECIPE, INITIAL_SAVED_RECIPES } from './mockData';
import { FOOD_IMAGES } from './imageAssets';

export interface RecipeCollection {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  recipeIds: string[];
}

export const EXPLORE_RECIPES_DATABASE: Recipe[] = [
  INITIAL_FEATURED_RECIPE,
  INITIAL_SAVED_RECIPES[0].recipe, // pancakes-sorghum
  INITIAL_SAVED_RECIPES[1].recipe, // rustic-loaf-sorghum
  INITIAL_SAVED_RECIPES[2].recipe, // healthy-bowl-sorghum
  {
    id: 'sorghum-mushroom-risotto',
    slug: 'risotto-jamur-liar-sorgum-creamy',
    title: 'Sorghum Mushroom Creamy Risotto',
    subtitle: 'Alternatif risotto bebas gluten dengan biji sorgum pulen kenyal, jamur champignon, dan kaldu gurih nabati.',
    targetAge: 'Remaja, Dewasa & Lansia',
    dishCategory: 'Makanan Berat',
    targetBudget: 18000,
    estimatedCost: 16000,
    prepTimeMinutes: 10,
    cookTimeMinutes: 25,
    servings: 2,
    ingredients: [
      { name: 'Biji sorgum rendam semalam', amount: '150g', estimatedPrice: 4500 },
      { name: 'Jamur kancing / champignon iris', amount: '100g', estimatedPrice: 4000 },
      { name: 'Bawang bombay & bawang putih', amount: '1/2 buah + 2 siung', estimatedPrice: 2000 },
      { name: 'Kaldu sayur hangat / ayam', amount: '350ml', estimatedPrice: 2500 },
      { name: 'Minyak zaitun / mentega nabati', amount: '1 sdm', estimatedPrice: 1500 },
      { name: 'Keju parmesan parut (opsional)', amount: '1 sdm', estimatedPrice: 1500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Serat larut beta-glukan sorgum berpadu dengan antioksidan jamur untuk kesehatan jantung dan imun.',
      fiberGrams: 9.8,
      proteinGrams: 11.2,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 360,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Tumis Aromatik & Jamur',
        instruction: 'Panaskan minyak zaitun di wajan, tumis bawang bombay dan bawang putih cincang hingga harum layu, lalu masukkan irisan jamur hingga kecokelatan.',
        timerMinutes: 4,
      },
      {
        stepNumber: 2,
        title: 'Masukkan Biji Sorgum',
        instruction: 'Masukkan biji sorgum yang telah ditiriskan. Aduk rata selama 2 menit agar terlumuri minyak dan aroma gurih.',
        timerMinutes: 2,
      },
      {
        stepNumber: 3,
        title: 'Tuang Kaldu Bertahap',
        instruction: 'Tuangkan kaldu sayur hangat secara bertahap sambil diaduk perlahan dengan api sedang hingga cairan meresap dan sorgum empuk al-dente.',
        timerMinutes: 16,
      },
      {
        stepNumber: 4,
        title: 'Finishing Creamy',
        instruction: 'Matikan api, masukkan sedikit parmesan atau santan encer. Aduk rata dan taburkan parsley cincang segar sebelum disajikan hangat.',
        timerMinutes: 3,
      },
    ],
    imageUrl: FOOD_IMAGES.risotto,
    tags: ['Low GI', 'Gourmet Sehat', 'Gluten Free', 'Tinggi Serat'],
    createdAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'bubur-manado-tinutuan-sorgum',
    slug: 'bubur-tinutuan-sorgum-manado',
    title: 'Tinutuan Bubur Sayur Sorgum Manado',
    subtitle: 'Kreasi bubur Manado tradisional kaya serat dari biji sorgum pulen berpadu labu kuning, kangkung, dan jagung manis.',
    targetAge: 'Semua Usia (Balita - Lansia)',
    dishCategory: 'Makanan Berat',
    targetBudget: 12000,
    estimatedCost: 11000,
    prepTimeMinutes: 10,
    cookTimeMinutes: 20,
    servings: 2,
    ingredients: [
      { name: 'Biji sorgum giling / utuh rebus', amount: '120g', estimatedPrice: 3500 },
      { name: 'Labu kuning kukus potong dadu', amount: '80g', estimatedPrice: 1500 },
      { name: 'Jagung manis pipil', amount: '50g', estimatedPrice: 1500 },
      { name: 'Daun bayam / kangkung & kemangi', amount: '1 ikat', estimatedPrice: 2000 },
      { name: 'Serai memar & daun bawang', amount: '1 batang', estimatedPrice: 1000 },
      { name: 'Ikan asin / tempe renyah (pelengkap)', amount: 'Secukupnya', estimatedPrice: 1500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Super kaya vitamin A beta-karoten, kalium, dan serat pangan prebiotik tanpa risiko lonjakan glukosa darah.',
      fiberGrams: 11.5,
      proteinGrams: 8.9,
      glycemicIndex: 'Sangat Rendah',
      caloriesEstimate: 290,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Rebus Sorgum & Labu',
        instruction: 'Masak biji sorgum bersama air kaldu sayur, serai, dan labu kuning hingga labu melunak dan sorgum merekah membentuk bubur kental.',
        timerMinutes: 12,
      },
      {
        stepNumber: 2,
        title: 'Tambahkan Jagung & Sayur',
        instruction: 'Masukkan jagung manis pipil dan bumbu garam secukupnya. Masak selama 3 menit.',
        timerMinutes: 3,
      },
      {
        stepNumber: 3,
        title: 'Masukkan Sayuran Hijau & Kemangi',
        instruction: 'Tambahkan daun bayam/kangkung dan kemangi wangi sesaat sebelum api dimatikan agar tetap hijau segar bernutrisi.',
        timerMinutes: 3,
      },
      {
        stepNumber: 4,
        title: 'Sajikan dengan Sambal Dabu-Dabu',
        instruction: 'Tuang ke mangkuk hangat, sajikan dengan tempe goreng renyah atau sambal dabu-dabu segar.',
        timerMinutes: 2,
      },
    ],
    imageUrl: FOOD_IMAGES.buburManado,
    tags: ['Tradisional', 'Kaya Vitamin A', 'Low GI', 'Ramah Lansia & Balita'],
    createdAt: '2026-08-25T14:15:00Z',
  },
  {
    id: 'sorghum-cookies-chocochip',
    slug: 'cookies-keping-cokelat-sorgum',
    title: 'Crunchy Sorghum Chocochip Cookies',
    subtitle: 'Kue kering renyah bebas terigu dari tepung sorgum dengan dark chocolate chips dan aroma gula kelapa harum.',
    targetAge: 'Anak Sekolah & Remaja',
    dishCategory: 'Camilan Sehat',
    targetBudget: 15000,
    estimatedCost: 13500,
    prepTimeMinutes: 15,
    cookTimeMinutes: 15,
    servings: 12,
    ingredients: [
      { name: 'Tepung sorgum sangrai halus', amount: '120g', estimatedPrice: 4000 },
      { name: 'Minyak kelapa / butter leleh', amount: '50g', estimatedPrice: 3500 },
      { name: 'Gula kelapa / aren bubuk', amount: '40g', estimatedPrice: 2000 },
      { name: '1 butir kuning telur ayam', amount: '1 butir', estimatedPrice: 2000 },
      { name: 'Dark chocolate chips 70%', amount: '30g', estimatedPrice: 2000 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Camilan manis alami bebas gluten dengan zat besi dan magnesium tinggi untuk konsentrasi belajar anak.',
      fiberGrams: 5.6,
      proteinGrams: 4.8,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 160,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Kocok Butter & Gula Kelapa',
        instruction: 'Campurkan mentega/minyak kelapa dengan gula aren hingga larut dan lembut creamy.',
        timerMinutes: 4,
      },
      {
        stepNumber: 2,
        title: 'Campur Tepung Sorgum',
        instruction: 'Masukkan kuning telur, lalu tuang tepung sorgum bertahap. Aduk dengan spatula hingga adonan kalis tidak lengket.',
        timerMinutes: 4,
      },
      {
        stepNumber: 3,
        title: 'Bentuk Bulatan & Chocochip',
        instruction: 'Bentuk bulatan pipih di loyang beroles minyak, beri taburan chocochip di atasnya.',
        timerMinutes: 5,
      },
      {
        stepNumber: 4,
        title: 'Panggang Renyah',
        instruction: 'Panggang pada oven suhu 160°C selama 15 menit hingga renyah keemasan.',
        timerMinutes: 15,
      },
    ],
    imageUrl: FOOD_IMAGES.cookies,
    tags: ['Camilan Sehat', 'Bebas Gluten', 'Bekal Anak', 'Baking Mudah'],
    createdAt: '2026-08-25T16:00:00Z',
  },
  {
    id: 'es-cendol-dawet-sorgum',
    slug: 'es-cendol-sorgum-nangka-gula-aren',
    title: 'Es Dawet Cendol Tepung Sorgum Sehat',
    subtitle: 'Minuman segar tradisional dengan cendol kenyal dari tepung sorgum, santan kelapa murni, dan sirup nira aren organik.',
    targetAge: 'Semua Usia',
    dishCategory: 'Minuman Nutrisi',
    targetBudget: 10000,
    estimatedCost: 8500,
    prepTimeMinutes: 15,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Tepung sorgum & tapioka (rasio 2:1)', amount: '60g', estimatedPrice: 2500 },
      { name: 'Air perasan daun suji & pandan', amount: '200ml', estimatedPrice: 1500 },
      { name: 'Santan kelapa segar matang', amount: '150ml', estimatedPrice: 2000 },
      { name: 'Gula aren cair asli', amount: '4 sdm', estimatedPrice: 1500 },
      { name: 'Es batu kristal', amount: 'Secukupnya', estimatedPrice: 1000 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Menyegarkan tanpa lonjakan insulin, kaya senyawa klorofil pandan dan serat pencernaan sorgum.',
      fiberGrams: 6.0,
      proteinGrams: 3.5,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 190,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Masak Adonan Cendol',
        instruction: 'Campur tepung sorgum, tapioka, dan air pandan di panci. Masak dengan api kecil sambil diaduk terus hingga mengental meletup-letup mengilap.',
        timerMinutes: 6,
      },
      {
        stepNumber: 2,
        title: 'Cetak Butiran Cendol',
        instruction: 'Tuang adonan panas ke saringan cendol di atas baskom berisi air es. Tekan perlahan hingga butiran cendol kenyal jatuh mengeras.',
        timerMinutes: 5,
      },
      {
        stepNumber: 3,
        title: 'Susun di Gelas Segar',
        instruction: 'Tuang gula aren cair di dasar gelas, tambahkan cendol sorgum, es batu, dan siram santan gurih di atasnya.',
        timerMinutes: 2,
      },
    ],
    imageUrl: FOOD_IMAGES.esCendol,
    tags: ['Minuman Segar', 'Tradisional', 'Bebas Gluten', 'Pencuci Mulut'],
    createdAt: '2026-08-25T17:30:00Z',
  },
  {
    id: 'bolu-kukus-sorgum-gula-aren',
    slug: 'bolu-kukus-pandan-sorgum-mekar',
    title: 'Bolu Kukus Mekar Sorgum & Pandan Aren',
    subtitle: 'Bolu kukus super empuk dan mekar sempurna dibuat dari 100% tepung sorgum bebas gluten beraroma pandan alami.',
    targetAge: 'Semua Usia',
    dishCategory: 'Dessert Rendah GI',
    targetBudget: 12000,
    estimatedCost: 10000,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 6,
    ingredients: [
      { name: 'Tepung sorgum premium ayak', amount: '150g', estimatedPrice: 4500 },
      { name: 'Telur ayam negeri', amount: '2 butir', estimatedPrice: 3500 },
      { name: 'Gula aren organik bubuk', amount: '60g', estimatedPrice: 2000 },
      { name: 'Santan kental & air pandan', amount: '60ml', estimatedPrice: 1500 },
      { name: 'Baking powder', amount: '1/2 sdt', estimatedPrice: 500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Kudapan manis lembut ramah pencernaan dengan profil asam amino esensial lengkap dan rendah lemak jenuh.',
      fiberGrams: 7.2,
      proteinGrams: 6.5,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 210,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Kocok Telur & Gula Aren',
        instruction: 'Mixer telur ayam dan gula aren bubuk dengan kecepatan tinggi hingga mengembang putih berjejak kental.',
        timerMinutes: 6,
      },
      {
        stepNumber: 2,
        title: 'Masukkan Tepung & Santan',
        instruction: 'Turunkan kecepatan, masukkan tepung sorgum dan santan pandan secara bergantian hingga tercampur rata lembut.',
        timerMinutes: 3,
      },
      {
        stepNumber: 3,
        title: 'Kukus Api Besar',
        instruction: 'Tuang ke cetakan bolu kukus beralas kertas roti. Kukus di panci kukusan yang sudah panas mendidih selama 12-15 menit tanpa membuka tutup.',
        timerMinutes: 15,
      },
    ],
    imageUrl: FOOD_IMAGES.boluKukus,
    tags: ['Bolu Kukus', 'Bebas Gluten', 'Kudapan Tradisional', 'Rendah Gula'],
    createdAt: '2026-08-25T18:00:00Z',
  },
  {
    id: 'sup-krim-sorgum-jagung',
    slug: 'sup-krim-jagung-sorgum-hangat',
    title: 'Creamy Sorghum & Sweet Corn Chowder',
    subtitle: 'Sup hangat kental menenangkan dengan butiran biji sorgum kenyal, jagung manis pipil, dan wortel dadu kaya serat.',
    targetAge: 'Balita, Anak Sekolah & Lansia',
    dishCategory: 'Makanan Berat',
    targetBudget: 12000,
    estimatedCost: 10500,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 2,
    ingredients: [
      { name: 'Biji sorgum rebus empuk', amount: '100g', estimatedPrice: 3000 },
      { name: 'Jagung manis pipil segar', amount: '1 buah', estimatedPrice: 2500 },
      { name: 'Wortel potong dadu kecil', amount: '1/2 buah', estimatedPrice: 1000 },
      { name: 'Susu cair UHT / santan encer', amount: '150ml', estimatedPrice: 2000 },
      { name: 'Bawang bombay & mentega', amount: '1 sdm', estimatedPrice: 1500 },
      { name: 'Pala bubuk, garam & merica', amount: 'Secukupnya', estimatedPrice: 500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Menghangatkan tubuh, kaya kalsium dan prebiotik alami untuk imunitas keluarga di musim hujan.',
      fiberGrams: 8.8,
      proteinGrams: 7.0,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 260,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Tumis Bawang Bombay',
        instruction: 'Tumis bawang bombay cincang dengan sedikit mentega hingga harum manis transparan.',
        timerMinutes: 3,
      },
      {
        stepNumber: 2,
        title: 'Blender Sebagian Jagung',
        instruction: 'Blender 1/2 porsi jagung dengan sedikit susu cair untuk memberi kekentalan alami pada sup tanpa tepung maizena.',
        timerMinutes: 2,
      },
      {
        stepNumber: 3,
        title: 'Rebus Bahan Bersama',
        instruction: 'Campurkan pure jagung, sisa jagung pipil, wortel dadu, dan biji sorgum rebus ke panci. Masak hingga sayuran matang.',
        timerMinutes: 8,
      },
      {
        stepNumber: 4,
        title: 'Bumbui & Sajikan',
        instruction: 'Bumbui dengan pala bubuk, garam, dan merica. Aduk rata dan sajikan hangat di mangkuk sup.',
        timerMinutes: 2,
      },
    ],
    imageUrl: FOOD_IMAGES.cornSoup,
    tags: ['Sup Hangat', 'Comfort Food', 'Ramah Balita', 'Kaya Serat'],
    createdAt: '2026-08-25T19:00:00Z',
  },
];

export const RECIPE_COLLECTIONS: RecipeCollection[] = [
  {
    id: 'mbg-school',
    title: 'Koleksi Menu MBG (Makan Bergizi Gratis)',
    subtitle: 'Paket menu hemat biaya, tinggi serat, dan bebas gluten untuk bekal sekolah anak SD & SMP.',
    badge: 'Program Nasional MBG',
    color: 'from-[#163422] to-[#2d4b37]',
    recipeIds: ['nasi-goreng-sorgum-sd', 'sup-krim-sorgum-jagung', 'sorghum-cookies-chocochip'],
  },
  {
    id: 'low-gi-diabetes',
    title: 'Menu Diabetes & Rendah Gula (Low GI)',
    subtitle: 'Karbohidrat kompleks pengontrol gula darah stabil untuk santapan harian tanpa rasa khawatir.',
    badge: 'Ramah Gula Darah',
    color: 'from-[#7c5800] to-[#5e4200]',
    recipeIds: ['healthy-bowl-sorghum', 'sorghum-mushroom-risotto', 'bubur-manado-tinutuan-sorgum'],
  },
  {
    id: 'baking-gluten-free',
    title: 'Artisanal Bakery Bebas Gluten',
    subtitle: 'Kreasi roti, pancake, dan kudapan manis 100% dari tepung sorgum superfood nusantara.',
    badge: '100% Gluten-Free',
    color: 'from-[#304b2e] to-[#163422]',
    recipeIds: ['pancakes-sorghum', 'rustic-loaf-sorghum', 'bolu-kukus-sorgum-gula-aren'],
  },
];

export interface MostLikedRecipeItem {
  rank: number;
  recipe: Recipe;
  likesCount: number;
  rating: number;
  reviewsCount: number;
  badgeLabel: string;
}

export const MOST_LIKED_RECIPES: MostLikedRecipeItem[] = [
  {
    rank: 1,
    recipe: INITIAL_FEATURED_RECIPE, // Nasi Goreng Sorgum Komplit (MBG)
    likesCount: 1840,
    rating: 4.9,
    reviewsCount: 320,
    badgeLabel: '#1 Terfavorit Komunitas',
  },
  {
    rank: 2,
    recipe: INITIAL_SAVED_RECIPES[0].recipe, // Fluffy Sorghum Berry Pancake
    likesCount: 1450,
    rating: 4.9,
    reviewsCount: 280,
    badgeLabel: '#2 Favorit Sarapan Sehat',
  },
  {
    rank: 3,
    recipe: EXPLORE_RECIPES_DATABASE[4], // Sorghum Mushroom Creamy Risotto
    likesCount: 1280,
    rating: 4.8,
    reviewsCount: 210,
    badgeLabel: '#3 Gourmet Sehat Rendah GI',
  },
  {
    rank: 4,
    recipe: EXPLORE_RECIPES_DATABASE[5], // Tinutuan Bubur Sayur Sorgum Manado
    likesCount: 1020,
    rating: 4.8,
    reviewsCount: 195,
    badgeLabel: '#4 Tradisional Kaya Serat',
  },
  {
    rank: 5,
    recipe: EXPLORE_RECIPES_DATABASE[6], // Crunchy Sorghum Chocochip Cookies
    likesCount: 940,
    rating: 4.9,
    reviewsCount: 178,
    badgeLabel: '#5 Bekal Anak Bebas Gluten',
  },
  {
    rank: 6,
    recipe: EXPLORE_RECIPES_DATABASE[7], // Es Dawet Cendol Sorgum
    likesCount: 830,
    rating: 4.7,
    reviewsCount: 142,
    badgeLabel: '#6 Minuman Segar Nusantara',
  },
  {
    rank: 7,
    recipe: EXPLORE_RECIPES_DATABASE[9], // Creamy Sorghum & Sweet Corn Chowder
    likesCount: 760,
    rating: 4.8,
    reviewsCount: 115,
    badgeLabel: '#7 Comfort Food Balita & Lansia',
  },
  {
    rank: 8,
    recipe: EXPLORE_RECIPES_DATABASE[8], // Bolu Kukus Mekar Sorgum
    likesCount: 710,
    rating: 4.8,
    reviewsCount: 98,
    badgeLabel: '#8 Kudapan Lembut Ramah Gula',
  },
];

