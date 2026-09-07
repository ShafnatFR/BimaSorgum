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
  author?: string;
  cooksCount?: string;
  recipe?: Recipe;
}

export interface ShowcaseRecipeItem {
  id: string;
  title: string;
  description: string;
  tag: string;
  rating: number;
  time: string;
  imageUrl: string;
  badge?: string;
  cooksCount?: string;
  difficulty?: string;
  calories?: string;
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
  {
    id: 'fav-4',
    title: 'Cookies Cokelat Biji Sorgum',
    categoryTag: 'Camilan Sehat',
    timeTag: '25 Min',
    imageUrl: FOOD_IMAGES.cookies,
    isFavorite: false,
    recipeId: 'cookies-sorghum',
  },
  {
    id: 'fav-5',
    title: 'Sup Jagung Krim Sorgum',
    categoryTag: 'Comfort Food',
    timeTag: '20 Min',
    imageUrl: FOOD_IMAGES.cornSoup,
    isFavorite: true,
    recipeId: 'corn-soup-sorghum',
  },
  {
    id: 'fav-6',
    title: 'Bolu Kukus Pelangi Sorgum',
    categoryTag: 'Kue Tradisional',
    timeTag: '30 Min',
    imageUrl: FOOD_IMAGES.boluKukus,
    isFavorite: false,
    recipeId: 'bolu-kukus-sorghum',
  },
  {
    id: 'fav-7',
    title: 'Salad Sorgum Mediterania',
    categoryTag: 'Tinggi Protein',
    timeTag: '15 Min',
    imageUrl: FOOD_IMAGES.salad,
    isFavorite: true,
    recipeId: 'salad-sorghum',
  },
  {
    id: 'fav-8',
    title: 'Roti Panggang Sorgum Madu',
    categoryTag: 'Sarapan Sehat',
    timeTag: '20 Min',
    imageUrl: FOOD_IMAGES.bread,
    isFavorite: false,
    recipeId: 'bread-sorghum',
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
  {
    id: 'tut-4',
    title: 'Popcorn Sorgum Crispy',
    subtitle: 'Camilan sehat meletup tanpa minyak berlebih.',
    duration: '3:15',
    videoDurationSec: 195,
    imageUrl: FOOD_IMAGES.cookies,
    description: 'Trik memanaskan wajan kering dengan api sedang untuk membuat butiran sorgum meletup mini renyah alami kaya antioksidan.',
    keySteps: [
      'Panaskan wajan tebal beralas rata dengan api sedang tanpa minyak.',
      'Masukkan 2-3 sendok makan biji sorgum kering, tutup wajan rapat.',
      'Goyangkan wajan secara berkala hingga biji meletup putih menyerupai popcorn mini.',
    ],
  },
  {
    id: 'tut-5',
    title: 'Bubur Manado Sorgum Gurih',
    subtitle: 'Tinutuan kaya serat dengan labu & kangkung.',
    duration: '6:30',
    videoDurationSec: 390,
    imageUrl: FOOD_IMAGES.buburManado,
    description: 'Memasak bubur sorgum lembut bercampur sayuran lokal segar kaya vitamin dan mineral untuk sarapan berenergi.',
    keySteps: [
      'Rebus biji sorgum bersama kaldu sayur hingga butiran pecah dan lembut.',
      'Tambahkan potongan labu kuning, jagung manis, dan ubi jalar.',
      'Masukkan daun kangkung dan kemangi di akhir perebusan agar wangi segar.',
    ],
  },
  {
    id: 'tut-6',
    title: 'Susu Nabati Biji Sorgum',
    subtitle: 'Minuman kental creamy kaya zat besi.',
    duration: '4:45',
    videoDurationSec: 285,
    imageUrl: FOOD_IMAGES.milkshake,
    description: 'Cara membuat alternatif susu nabati tinggi serat dan bebas laktosa dari rebusan biji sorgum matang yang diblender halus.',
    keySteps: [
      'Rebus 100g biji sorgum hingga matang empuk lalu tiriskan.',
      'Blender bersama 500ml air hangat, sejumput kayu manis, dan madu/gula aren.',
      'Saring menggunakan kain saring halus untuk memisahkan serat ampas.',
    ],
  },
  {
    id: 'tut-7',
    title: 'Risotto Sorgum Jamur Lumer',
    subtitle: 'Tekstur al dente gurih aroma thyme segar.',
    duration: '7:10',
    videoDurationSec: 430,
    imageUrl: FOOD_IMAGES.risotto,
    description: 'Teknik merebus perlahan biji sorgum dengan kaldu jamur panas bertahap untuk sensasi risotto Italia berkadar serat tinggi.',
    keySteps: [
      'Tumis bawang bombai dan aneka jamur hingga kecokelatan dan wangi.',
      'Tuangkan kaldu sayur panas secara bertahap ke dalam sorgum sambil terus diaduk.',
      'Tambahkan taburan keju atau nutritional yeast untuk rasa gurih umami lumer.',
    ],
  },
  {
    id: 'tut-8',
    title: 'Pancake Fluffy Tepung Sorgum',
    subtitle: 'Sarapan manis lembut aman untuk gula darah.',
    duration: '5:00',
    videoDurationSec: 300,
    imageUrl: FOOD_IMAGES.pancake,
    description: 'Membuat adonan pancake bersarang halus dengan tepung sorgum, pisang lumat, dan baking powder bebas aluminium.',
    keySteps: [
      'Campur tepung sorgum dengan baking powder dan sejumput garam.',
      'Aduk bersama pisang matang lumat, telur, dan susu almond hingga rata.',
      'Panggang di atas wajan anti lengket dengan api kecil hingga muncul gelembung halus.',
    ],
  },
];

export const HOME_COMMUNITY_RECIPES: CommunityRecipeItem[] = [
  {
    id: 'comm-1',
    title: 'Spiced Sorghum Salad',
    description: 'Campuran segar biji sorgum, mentimun renyah, mint, dan saus perasan lemon zesty kaya vitamin.',
    tag: 'High Protein',
    rating: 4.8,
    time: '25 Min',
    author: 'Chef Nadia',
    cooksCount: '840+ dimasak',
    imageUrl: FOOD_IMAGES.salad,
  },
  {
    id: 'comm-2',
    title: 'Sorghum Mushroom Risotto',
    description: 'Alternatif risotto super creamy menggunakan butiran sorgum bertekstur al dente lembut.',
    tag: 'Low GI',
    rating: 4.9,
    time: '45 Min',
    author: 'Dapur Sehat',
    cooksCount: '1.2k dimasak',
    imageUrl: FOOD_IMAGES.risotto,
  },
  {
    id: 'comm-3',
    title: 'Fluffy Sorghum Honey Pancakes',
    description: 'Pancake emas manis alami dengan saus kelapa murni dan taburan almond panggang.',
    tag: 'Gluten Free',
    rating: 4.9,
    time: '20 Min',
    author: 'Rina Cook',
    cooksCount: '950+ dimasak',
    imageUrl: FOOD_IMAGES.pancake,
  },
  {
    id: 'comm-4',
    title: 'Artisanal Sorghum Bread Loaf',
    description: 'Roti artisan harum berkulit renyah dari 100% tepung sorgum murni kaya serat pangan.',
    tag: 'Dietary Fiber',
    rating: 4.8,
    time: '50 Min',
    author: 'Bakehouse ID',
    cooksCount: '620+ dimasak',
    imageUrl: FOOD_IMAGES.bread,
  },
  {
    id: 'comm-5',
    title: 'Bubur Manado Sorgum Gurih',
    description: 'Tinutuan tradisional dengan labu kuning manis, jagung, bayam, dan aroma kemangi segar.',
    tag: 'Tradisional',
    rating: 4.9,
    time: '35 Min',
    author: 'Oma Manado',
    cooksCount: '1.5k dimasak',
    imageUrl: FOOD_IMAGES.buburManado,
  },
  {
    id: 'comm-6',
    title: 'Cookies Cokelat Tepung Sorgum',
    description: 'Kue kering renyah bebas terigu dengan taburan choco chips lumer dan gula kelapa.',
    tag: 'Camilan Sehat',
    rating: 5.0,
    time: '25 Min',
    author: 'HealthyTreats',
    cooksCount: '1.8k dimasak',
    imageUrl: FOOD_IMAGES.cookies,
  },
  {
    id: 'comm-7',
    title: 'Es Cendol Biji Sorgum Nangka',
    description: 'Minuman dingin segar dengan butiran mutiara sorgum, santan kelapa muda, dan gula aren legit.',
    tag: 'Minuman Segar',
    rating: 4.8,
    time: '15 Min',
    author: 'Segar Alami',
    cooksCount: '780+ dimasak',
    imageUrl: FOOD_IMAGES.esCendol,
  },
  {
    id: 'comm-8',
    title: 'Sorghum Buddha Power Bowl',
    description: 'Mangkuk nutrisi lengkap dengan alpukat, edamame, wortel serut, dan saus wijen sangrai.',
    tag: 'Superfood',
    rating: 4.9,
    time: '20 Min',
    author: 'FitKitchen',
    cooksCount: '1.1k dimasak',
    imageUrl: FOOD_IMAGES.buddhaBowl,
  },
];

export const HOME_HOT_RECIPES: ShowcaseRecipeItem[] = [
  {
    id: 'hot-1',
    title: 'Nasi Goreng Sorgum Sambal Matah',
    description: 'Favorit nomor 1 minggu ini! Gurih pedas beraroma serai dan daun jeruk dengan telur mata sapi.',
    tag: 'Pedas Gurih',
    rating: 4.9,
    time: '20 Min',
    badge: 'Trending #1',
    cooksCount: '2.4k dimasak',
    difficulty: 'Mudah',
    calories: '320 kkal',
    imageUrl: FOOD_IMAGES.nasiGoreng,
  },
  {
    id: 'hot-2',
    title: 'Sup Jagung Krim Sorgum Hangat',
    description: 'Sup hangat kental alami dengan pipilan jagung manis dan kaldu ayam rempah menenangkan.',
    tag: 'Comfort Food',
    rating: 4.9,
    time: '25 Min',
    badge: 'Viral TikTok',
    cooksCount: '1.9k dimasak',
    difficulty: 'Mudah',
    calories: '240 kkal',
    imageUrl: FOOD_IMAGES.cornSoup,
  },
  {
    id: 'hot-3',
    title: 'Brownies Fudgy Tepung Sorgum',
    description: 'Tekstur lumer cokelat pekat tanpa terigu, aman untuk penderita intoleransi gluten.',
    tag: 'Dessert Sehat',
    rating: 5.0,
    time: '35 Min',
    badge: 'Top Rated',
    cooksCount: '3.1k dimasak',
    difficulty: 'Sedang',
    calories: '190 kkal',
    imageUrl: FOOD_IMAGES.cookies,
  },
  {
    id: 'hot-4',
    title: 'Risotto Jamur Truffle Sorgum',
    description: 'Sajian mewah restoran di rumah dengan aroma jamur champignon dan kaldu sayuran lezat.',
    tag: 'Fine Dining',
    rating: 4.9,
    time: '40 Min',
    badge: 'Pilihan Chef',
    cooksCount: '1.6k dimasak',
    difficulty: 'Sedang',
    calories: '310 kkal',
    imageUrl: FOOD_IMAGES.risotto,
  },
  {
    id: 'hot-5',
    title: 'Bolu Kukus Pelangi Sorgum',
    description: 'Kue basah tradisional mekar lembut dengan pewarna alami daun pandan dan buah naga.',
    tag: 'Kue Tradisional',
    rating: 4.8,
    time: '30 Min',
    badge: 'Hits Arisan',
    cooksCount: '1.4k dimasak',
    difficulty: 'Mudah',
    calories: '160 kkal',
    imageUrl: FOOD_IMAGES.boluKukus,
  },
  {
    id: 'hot-6',
    title: 'Milkshake Biji Sorgum Cokelat Oat',
    description: 'Minuman dingin kaya protein nabati dan serat, sangat pas dinikmati setelah berolahraga.',
    tag: 'Post-Workout',
    rating: 4.9,
    time: '10 Min',
    badge: 'Segar & Cepat',
    cooksCount: '890+ dimasak',
    difficulty: 'Sangat Mudah',
    calories: '220 kkal',
    imageUrl: FOOD_IMAGES.milkshake,
  },
  {
    id: 'hot-7',
    title: 'Pancake Pisang Sorgum Kayu Manis',
    description: 'Sarapan favorit keluarga dengan aroma rempah kayu manis dan lelehan madu hutan murni.',
    tag: 'Sarapan Manis',
    rating: 4.9,
    time: '15 Min',
    badge: 'Sarapan Sehat',
    cooksCount: '2.1k dimasak',
    difficulty: 'Mudah',
    calories: '280 kkal',
    imageUrl: FOOD_IMAGES.pancake,
  },
  {
    id: 'hot-8',
    title: 'Puding Sutra Sorgum Santan Aren',
    description: 'Puding lembut lumer di lidah berpadu sirup gula kelapa wangi pandan kaya serat prebiotik.',
    tag: 'Dessert Rendah GI',
    rating: 4.8,
    time: '20 Min',
    badge: 'Favorit Lansia',
    cooksCount: '970+ dimasak',
    difficulty: 'Mudah',
    calories: '150 kkal',
    imageUrl: FOOD_IMAGES.pudding,
  },
];

export const HOME_NEW_RECIPES: ShowcaseRecipeItem[] = [
  {
    id: 'new-1',
    title: 'Sorghum Poke Bowl Salmon Mayo',
    description: 'Kreasi terbaru perpaduan sorgum pulen dengan potongan salmon segar, nori, dan edamame.',
    tag: 'Kreasi Baru',
    rating: 5.0,
    time: '20 Min',
    badge: 'Rilis Hari Ini',
    cooksCount: '430 dimasak',
    difficulty: 'Mudah',
    calories: '390 kkal',
    imageUrl: FOOD_IMAGES.buddhaBowl,
  },
  {
    id: 'new-2',
    title: 'Waffle Crispy Sorgum Saus Berry',
    description: 'Waffle renyah di luar lembut di dalam dengan selai raspberry alami tanpa gula rafinasi.',
    tag: 'Gluten-Free Waffle',
    rating: 4.9,
    time: '25 Min',
    badge: 'Baru',
    cooksCount: '310 dimasak',
    difficulty: 'Sedang',
    calories: '260 kkal',
    imageUrl: FOOD_IMAGES.pancake,
  },
  {
    id: 'new-3',
    title: 'Roti Tawar Sorgum Biji Bunga Matahari',
    description: 'Roti panggang bertekstur empuk dengan taburan sunflower seeds kaya vitamin E alami.',
    tag: 'Bakery Baru',
    rating: 4.8,
    time: '60 Min',
    badge: 'Eksklusif',
    cooksCount: '290 dimasak',
    difficulty: 'Sedang',
    calories: '180 kkal/slice',
    imageUrl: FOOD_IMAGES.bread,
  },
  {
    id: 'new-4',
    title: 'Smoothie Hijau Sorgum Spirulina',
    description: 'Detoksifikasi alami dengan bubuk spirulina, nanas madu, bayam baby, dan sorgum rebus.',
    tag: 'Detox Booster',
    rating: 4.9,
    time: '10 Min',
    badge: 'Nutrisi Padat',
    cooksCount: '520 dimasak',
    difficulty: 'Sangat Mudah',
    calories: '195 kkal',
    imageUrl: FOOD_IMAGES.milkshake,
  },
  {
    id: 'new-5',
    title: 'Kroket Sayur Sorgum Isi Daging Gurih',
    description: 'Kroket kulit sorgum renyah keemasan dengan isian tumisan wortel, daun seledri, dan daging cincang.',
    tag: 'Camilan Gurih',
    rating: 4.9,
    time: '40 Min',
    badge: 'Resep Chef',
    cooksCount: '670 dimasak',
    difficulty: 'Sedang',
    calories: '210 kkal/buah',
    imageUrl: FOOD_IMAGES.buburManado,
  },
  {
    id: 'new-6',
    title: 'Salad Mediterania Sorgum Keju Feta',
    description: 'Potongan tomat ceri, zaitun hitam, keju feta gurih, dan butiran sorgum berbalut minyak zaitun murni.',
    tag: 'Salad Segar',
    rating: 4.8,
    time: '15 Min',
    badge: 'Segar & Cepat',
    cooksCount: '380 dimasak',
    difficulty: 'Mudah',
    calories: '270 kkal',
    imageUrl: FOOD_IMAGES.salad,
  },
  {
    id: 'new-7',
    title: 'Bubur Lolos Sorgum Kuah Santan Jahe',
    description: 'Kudapan manis lembut tradisional dari tepung sorgum disiram kuah jahe hangat pengusir dingin.',
    tag: 'Tradisional Baru',
    rating: 4.9,
    time: '30 Min',
    badge: 'Hangat Herbal',
    cooksCount: '460 dimasak',
    difficulty: 'Mudah',
    calories: '175 kkal',
    imageUrl: FOOD_IMAGES.pudding,
  },
  {
    id: 'new-8',
    title: 'Nasi Bakar Sorgum Teri Jamur Kemangi',
    description: 'Nasi sorgum gurih dibungkus daun pisang lalu dibakar hingga wangi semerbak menggugah selera.',
    tag: 'Aroma Bakar',
    rating: 5.0,
    time: '35 Min',
    badge: 'Rekomendasi Utama',
    cooksCount: '890 dimasak',
    difficulty: 'Sedang',
    calories: '340 kkal',
    imageUrl: FOOD_IMAGES.nasiGoreng,
  },
];

export const DAILY_TIPS = [
  'Soaking sorghum overnight can reduce cooking time by up to 50% and improve nutrient absorption.',
  'Sorghum contains 3x more calcium and 4x more iron compared to polished white rice.',
  'Biji sorgum yang telah disangrai dapat diseduh menjadi teh herbal aromatik bebas kafein yang kaya antioksidan.',
  'Tepung sorgum memiliki indeks glikemik rendah (Low GI), membantu pelepasan energi stabil tanpa lonjakan gula darah.',
];

export const FALLBACK_FOOD_IMAGE = GLOBAL_FALLBACK_FOOD_IMAGE;
