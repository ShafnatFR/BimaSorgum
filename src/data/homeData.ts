import { Recipe } from '../types';
import { FOOD_IMAGES, GLOBAL_FALLBACK_FOOD_IMAGE } from './imageAssets';

export interface HomeFavoriteItem {
  id: string;
  title: string;
  categoryTag: string;
  timeTag: string;
  imageUrl: string;
  isFavorite: boolean;
  recipeId: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  nameId: string;
  categoryKey: 'makanan_berat' | 'camilan_sehat' | 'minuman_nutrisi' | 'dessert_rendah_gi';
  imageUrl: string;
}

export interface VideoTutorialItem {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  imageUrl: string;
  videoDurationSec: number;
  description: string;
  keySteps: string[];
}

export interface CommunityRecipeItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  rating: number;
  time: string;
  imageUrl: string;
  recipe?: Recipe;
}

export const HOME_STUDENT_FAVORITES: HomeFavoriteItem[] = [
  {
    id: 'fav-1',
    title: 'Sorghum Power Bowl',
    categoryTag: 'High Fiber',
    timeTag: '15 Min',
    imageUrl: FOOD_IMAGES.buddhaBowl,
    isFavorite: true,
    recipeId: 'healthy-bowl-sorghum',
  },
  {
    id: 'fav-2',
    title: 'Morning Energy Porridge',
    categoryTag: 'Low GI',
    timeTag: 'Breakfast',
    imageUrl: FOOD_IMAGES.pancake,
    isFavorite: false,
    recipeId: 'pancakes-sorghum',
  },
  {
    id: 'fav-3',
    title: 'Nasi Goreng Sorgum Ceria (SD Edition)',
    categoryTag: 'Budget Friendly',
    timeTag: '15 Min',
    imageUrl: FOOD_IMAGES.nasiGoreng,
    isFavorite: true,
    recipeId: 'nasi-goreng-sorgum-sd',
  },
];

export const HOME_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-breakfast',
    name: 'Breakfast',
    nameId: 'Sarapan Pagi',
    categoryKey: 'makanan_berat',
    imageUrl: FOOD_IMAGES.boluKukus,
  },
  {
    id: 'cat-main',
    name: 'Main Course',
    nameId: 'Hidangan Utama',
    categoryKey: 'makanan_berat',
    imageUrl: FOOD_IMAGES.nasiGoreng,
  },
  {
    id: 'cat-snacks',
    name: 'Snacks',
    nameId: 'Camilan Sehat',
    categoryKey: 'camilan_sehat',
    imageUrl: FOOD_IMAGES.cookies,
  },
  {
    id: 'cat-desserts',
    name: 'Desserts',
    nameId: 'Dessert Rendah GI',
    categoryKey: 'dessert_rendah_gi',
    imageUrl: FOOD_IMAGES.pudding,
  },
];

export const HOME_VIDEO_TUTORIALS: VideoTutorialItem[] = [
  {
    id: 'tut-1',
    title: 'Cara Merendam Biji Sorgum',
    subtitle: 'Kunci tekstur empuk & penyerapan nutrisi.',
    duration: '3:45',
    videoDurationSec: 225,
    imageUrl: FOOD_IMAGES.sorghumGrain,
    description: 'Perendaman biji sorgum selama 6-8 jam atau semalaman melunakkan lapisan luar aleuron, mengurangi asam fitat, dan mempercepat proses perebusan hingga 50%.',
    keySteps: [
      'Cuci bersih biji sorgum dengan air mengalir 2-3 kali.',
      'Rendam dalam air bersuhu ruang dengan perbandingan 1:3 selama minimal 6 jam.',
      'Tiriskan air rendaman sebelum mulai dimasak dengan air bersih baru.',
    ],
  },
  {
    id: 'tut-2',
    title: 'Rasio Air & Masak Pulen',
    subtitle: 'Nasi sorgum pulen kenyal tidak pera.',
    duration: '5:12',
    videoDurationSec: 312,
    imageUrl: FOOD_IMAGES.nasiGoreng,
    description: 'Rasio air dan teknik pengukusan atau rice cooker yang tepat untuk menghasilkan tekstur nasi sorgum yang pulen, kenyal, dan tidak pera.',
    keySteps: [
      'Gunakan rasio 1 bagian biji sorgum terendam : 2,5 bagian air.',
      'Gunakan mode Brown Rice atau masak selama 25-30 menit di panci bertutup rapat.',
      'Diamkan selama 10 menit setelah matang tanpa membuka tutup agar uap air merata.',
    ],
  },
  {
    id: 'tut-3',
    title: 'Tepung Sorgum Bebas Gluten',
    subtitle: 'Panduan substitusi terigu pada kue & roti.',
    duration: '4:20',
    videoDurationSec: 260,
    imageUrl: FOOD_IMAGES.bread,
    description: 'Panduan lengkap substitusi tepung terigu dengan tepung sorgum bebas gluten pada kue, roti artisanal, pancake, dan cookies.',
    keySteps: [
      'Tepung sorgum memiliki profil rasa manis lembut menyerupai kacang gandum.',
      'Kombinasikan dengan pati tapioka/garut (rasio 70:30) untuk elastisitas optimal.',
      'Gunakan tambahan pengikat alami seperti telur atau biji chia saat membuat roti.',
    ],
  },
];

export const HOME_COMMUNITY_RECIPES: CommunityRecipeItem[] = [
  {
    id: 'comm-1',
    title: 'Spiced Sorghum Salad',
    description: 'A refreshing mix of cooked sorghum, cucumber, mint, and a zesty lemon dressing.',
    tag: 'High Protein',
    rating: 4.8,
    time: '25 Min',
    imageUrl: FOOD_IMAGES.salad,
  },
  {
    id: 'comm-2',
    title: 'Sorghum Mushroom Risotto',
    description: 'Rich and creamy alternative to traditional risotto using nutrient-dense sorghum.',
    tag: 'Low GI',
    rating: 4.9,
    time: '45 Min',
    imageUrl: FOOD_IMAGES.risotto,
  },
  {
    id: 'comm-3',
    title: 'Fluffy Sorghum Honey Pancakes',
    description: 'Golden, naturally sweet pancakes with pure coconut syrup and crushed almonds.',
    tag: 'Gluten Free',
    rating: 4.9,
    time: '20 Min',
    imageUrl: FOOD_IMAGES.pancake,
  },
  {
    id: 'comm-4',
    title: 'Artisanal Sorghum Bread Loaf',
    description: 'Fragrant, crusty bakery loaf baked with 100% whole grain sorghum flour.',
    tag: 'Dietary Fiber',
    rating: 4.8,
    time: '50 Min',
    imageUrl: FOOD_IMAGES.bread,
  },
];

export const DAILY_TIPS = [
  'Soaking sorghum overnight can reduce cooking time by up to 50% and improve nutrient absorption.',
  'Sorghum contains 3x more calcium and 4x more iron compared to polished white rice.',
  'Biji sorgum yang telah disangrai dapat diseduh menjadi teh herbal aromatik bebas kafein yang kaya antioksidan.',
  'Tepung sorgum memiliki indeks glikemik rendah (Low GI), membantu pelepasan energi stabil tanpa lonjakan gula darah.',
];

export const FALLBACK_FOOD_IMAGE = GLOBAL_FALLBACK_FOOD_IMAGE;
