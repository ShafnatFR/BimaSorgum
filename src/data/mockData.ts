import { 
  
  DishCategoryOption, 
  IngredientItem, 
  Recipe, 
  SavedRecipe 
} from '../types';
import { FOOD_IMAGES } from './imageAssets';

export const TARGET_CONSUMERS: any[] = [];

export const DISH_CATEGORIES: DishCategoryOption[] = [
  {
    id: 'makanan_berat',
    title: 'Makanan Berat',
    description: 'Hidangan utama yang mengenyangkan untuk makan siang atau malam.',
    iconName: 'restaurant',
  },
  {
    id: 'camilan_sehat',
    title: 'Camilan Sehat',
    description: 'Kudapan ringan bergizi untuk menemani waktu santai Anda.',
    iconName: 'cookie',
  },
  {
    id: 'minuman_nutrisi',
    title: 'Minuman Nutrisi',
    description: 'Minuman menyegarkan yang kaya akan serat dan vitamin.',
    iconName: 'local_cafe',
  },
  {
    id: 'dessert_rendah_gi',
    title: 'Dessert Rendah GI',
    description: 'Pencuci mulut manis yang ramah gula darah dan menyehatkan.',
    iconName: 'cake',
  },
];

export const DEFAULT_INGREDIENTS: IngredientItem[] = [
  {
    id: 'biji_sorgum',
    name: 'Biji Sorgum',
    category: 'utama',
    iconName: 'grain',
    unit: '1 porsi (100g)',
  },
  {
    id: 'tepung_sorgum',
    name: 'Tepung Sorgum',
    category: 'utama',
    iconName: 'blur_on',
    unit: '100g',
  },
  {
    id: 'sayuran_hijau',
    name: 'Sayuran Hijau',
    category: 'sayur',
    iconName: 'eco',
    unit: '1 ikat kecil',
  },
  {
    id: 'protein_ayam_telur',
    name: 'Protein Ayam/Telur',
    category: 'protein',
    iconName: 'egg',
    unit: '1 butir / 50g ayam',
  },
  {
    id: 'bawang_merah',
    name: 'Bawang Merah',
    category: 'bumbu',
    iconName: 'spa',
    unit: '3 siung',
  },
  {
    id: 'bawang_putih',
    name: 'Bawang Putih',
    category: 'bumbu',
    iconName: 'spa',
    unit: '2 siung',
  },
  {
    id: 'santan',
    name: 'Santan',
    category: 'pelengkap',
    iconName: 'water_drop',
    unit: '50ml',
  },
  {
    id: 'wortel',
    name: 'Wortel Segar',
    category: 'sayur',
    iconName: 'nutrition',
    unit: '1 buah kecil',
  },
  {
    id: 'kecap_manis',
    name: 'Kecap Manis & Garam',
    category: 'bumbu',
    iconName: 'soup_kitchen',
    unit: 'Secukupnya',
  },
  {
    id: 'minyak_kelapa',
    name: 'Minyak Kelapa / Goreng',
    category: 'pelengkap',
    iconName: 'oil_barrel',
    unit: '1 sdm',
  },
  {
    id: 'madu_alami',
    name: 'Madu Alami',
    category: 'pelengkap',
    iconName: 'hive',
    unit: '1 sdm',
  },
  {
    id: 'buah_pisang',
    name: 'Pisang / Buah Segar',
    category: 'pelengkap',
    iconName: 'temp_preferences_custom',
    unit: '1 buah',
  },
];

// Initial featured recipe matching the mockup exactly
export const INITIAL_FEATURED_RECIPE: Recipe = {
  id: 'nasi-goreng-sorgum-sd',
  slug: 'nasi-goreng-sorgum-ceria-sd-edition',
  title: 'Nasi Goreng Sorgum Ceria (SD Edition)',
  subtitle: 'Tentu! Ini resep bergizi, lezat, dan sangat terjangkau untuk bekal sekolah:',
  dishCategory: 'Makanan Berat',
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  servings: 1,
  ingredients: [
  ],
  nutritionHighlight: {
    title: 'Nutrisi Unggulan',
    description: 'Tinggi serat untuk energi tahan lama & bebas gluten (aman untuk pencernaan sensitif anak).',
    fiberGrams: 8.5,
    proteinGrams: 9.2,
    glycemicIndex: 'Rendah (Low GI)',
    caloriesEstimate: 340,
  },
  steps: [
    {
      stepNumber: 1,
      title: 'Persiapan Bahan',
      instruction: 'Pastikan nasi sorgum sudah dalam keadaan dingin agar teksturnya butiran tidak menggumpal saat ditumis.',
      timerMinutes: 2,
      tip: 'Masak sorgum dengan perbandingan 1:3 air semalam sebelumnya.',
    },
    {
      stepNumber: 2,
      title: 'Tumis Bumbu & Telur',
      instruction: 'Panaskan 1 sdm minyak. Tumis irisan bawang merah dan putih hingga harum. Masukkan telur kocok, lalu orak-arik hingga matang.',
      timerMinutes: 3,
    },
    {
      stepNumber: 3,
      title: 'Masukkan Sayur & Sorgum',
      instruction: 'Tambahkan potongan dadu wortel, aduk sebentar. Masukkan nasi sorgum dingin, kecap manis, garam, dan sedikit merica.',
      timerMinutes: 4,
    },
    {
      stepNumber: 4,
      title: 'Aduk Merata & Angkat',
      instruction: 'Aduk dengan api sedang-tinggi selama 3-4 menit hingga bumbu meresap sempurna dan aroma sedap keluar. Angkat dan sajikan hangat di kotak bekal!',
      timerMinutes: 3,
      tip: 'Tambahkan irisan mentimun segar sebagai garnish.',
    },
  ],
  imageUrl: FOOD_IMAGES.nasiGoreng,
  tags: ['Bekal Sekolah', 'Bebas Gluten', 'Budget Friendly', 'Tinggi Serat'],
  createdAt: '2026-08-26T10:42:00Z',
};

// Initial Catalog of saved recipes from HTML links
export const INITIAL_SAVED_RECIPES: SavedRecipe[] = [
  {
    id: 'pancakes-sorghum',
    savedAt: 'Kemarin',
    isFavorite: true,
    recipe: {
      id: 'pancakes-sorghum',
      slug: 'pancakes-sorghum-gluten-free',
      title: 'Sorghum Pancakes Bebas Gluten',
      subtitle: 'Pancake lembut mengenyangkan dari tepung sorgum dengan madu kelapa murni.',
      dishCategory: 'Camilan Sehat',
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      servings: 2,
      ingredients: [
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Kaya kalsium, fosfor, dan bebas protein gluten untuk sarapan sehat keluarga.',
        fiberGrams: 6.2,
        proteinGrams: 7.8,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 280,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Campur Bahan Kering',
          instruction: 'Ayak tepung sorgum bersama baking powder dan garam di mangkuk.',
          timerMinutes: 2,
        },
        {
          stepNumber: 2,
          title: 'Aduk Adonan',
          instruction: 'Kocok telur dan susu/santan cair, lalu satukan dengan tepung hingga tekstur kental pas.',
          timerMinutes: 3,
        },
        {
          stepNumber: 3,
          title: 'Panggang di Wajan',
          instruction: 'Tuang 1 sendok sayur adonan ke teflon antilengket dengan api kecil. Balik saat muncul gelembung.',
          timerMinutes: 5,
        },
      ],
      imageUrl: FOOD_IMAGES.pancake,
      tags: ['Gluten Free', 'Sarapan', 'Manis Alami'],
      createdAt: '2026-08-25T08:00:00Z',
    },
  },
  {
    id: 'rustic-loaf-sorghum',
    savedAt: '2 hari lalu',
    isFavorite: false,
    recipe: {
      id: 'rustic-loaf-sorghum',
      slug: 'roti-tawar-biji-sorgum-artisanal',
      title: 'Rustic Sorghum Loaf Bread',
      subtitle: 'Roti tawar artisanal kaya serat bertekstur padat lembut tanpa terigu gandum.',
      dishCategory: 'Makanan Berat',
      prepTimeMinutes: 20,
      cookTimeMinutes: 40,
      servings: 6,
      ingredients: [
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Karbohidrat kompleks tahan lama dengan indeks glikemik stabil, baik untuk penderita diabetes.',
        fiberGrams: 12.0,
        proteinGrams: 11.5,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 210,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Aktifkan Ragi',
          instruction: 'Larutkan ragi dalam air hangat dengan sedikit gula kelapa selama 7 menit hingga berbusa.',
          timerMinutes: 7,
        },
        {
          stepNumber: 2,
          title: 'Uleni Lembut',
          instruction: 'Campur tepung dan bahan basah, uleni hingga kalis lembap lalu diamkan 45 menit.',
          timerMinutes: 45,
        },
        {
          stepNumber: 3,
          title: 'Panggang Oven',
          instruction: 'Panggang pada suhu 180°C selama 35-40 menit hingga permukaan kecokelatan beraroma gurih kacang.',
          timerMinutes: 40,
        },
      ],
      imageUrl: FOOD_IMAGES.bread,
      tags: ['Artisanal', 'Bebas Gluten', 'Low GI'],
      createdAt: '2026-08-24T14:30:00Z',
    },
  },
  {
    id: 'healthy-bowl-sorghum',
    savedAt: '3 hari lalu',
    isFavorite: true,
    recipe: {
      id: 'healthy-bowl-sorghum',
      slug: 'sorghum-power-bowl',
      title: 'Healthy Buddha Bowl Sayur & Sorgum',
      subtitle: 'Mangkok nutrisi lengkap dengan paduan biji sorgum pulen, selada, dan saus wijen.',
      dishCategory: 'Makanan Berat',
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 1,
      ingredients: [
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Tinggi antioksidan polifenol & serat pangan pangan prebiotik untuk mikrobioma usus sehat.',
        fiberGrams: 10.4,
        proteinGrams: 14.2,
        glycemicIndex: 'Sangat Rendah',
        caloriesEstimate: 310,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Rebus Biji Sorgum',
          instruction: 'Rebus biji sorgum yang telah direndam selama 20 menit hingga empuk dan kenyal mekar.',
          timerMinutes: 20,
        },
        {
          stepNumber: 2,
          title: 'Tata Mangkok Sehat',
          instruction: 'Susun biji sorgum di sisi mangkok, lengkapi dengan sayuran segar dan tempe panggang.',
          timerMinutes: 3,
        },
        {
          stepNumber: 3,
          title: 'Siram Saus & Nikmati',
          instruction: 'Kucurkan dressing wijen gurih dan nikmati sensasi kenyal crunchy sorgum.',
          timerMinutes: 1,
        },
      ],
      imageUrl: FOOD_IMAGES.buddhaBowl,
      tags: ['Plant-Based', 'Superfood', 'Antioksidan'],
      createdAt: '2026-08-23T11:20:00Z',
    },
  },
];

export const RECENT_CHAT_TOPICS = [
  { id: 'chat-1', title: 'Gluten-free pancakes', time: '10:42 AM', preview: 'Resep pancake sorgum lembut untuk sarapan balita' },
  { id: 'chat-2', title: 'Sorghum bread recipe', time: 'Kemarin', preview: 'Roti tawar sorgum tanpa ragi terigu' },
  { id: 'chat-3', title: 'Low GI dinner ideas', time: '2 hari lalu', preview: 'Menu makan malam ramah gula darah' },
  { id: 'chat-4', title: 'Nasi Goreng Sorgum SD', time: 'Hari ini', preview: 'Resep bekal anak SD budget 10 ribu' },
];
