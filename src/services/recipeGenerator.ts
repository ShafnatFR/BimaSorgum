import { WizardFormData, Recipe, RecipeIngredient, RecipeStep } from '../types';
import { INITIAL_FEATURED_RECIPE } from '../data/mockData';
import { FOOD_IMAGES, getRecipeImage } from '../data/imageAssets';

export function generateRecipeFromWizard(formData: WizardFormData): Recipe {
  const { targetConsumers, dishCategory, selectedIngredientIds, customIngredients, budgetPerPortion } = formData;

  const targetLabel = targetConsumers.includes('anak_sekolah')
    ? 'Anak Sekolah (6-12 thn)'
    : targetConsumers.includes('balita')
    ? 'Balita (1-5 thn)'
    : targetConsumers.includes('lansia')
    ? 'Lansia'
    : 'Remaja & Dewasa';

  // Format category name
  const categoryNames: Record<string, string> = {
    makanan_berat: 'Makanan Berat',
    camilan_sehat: 'Camilan Sehat',
    minuman_nutrisi: 'Minuman Nutrisi',
    dessert_rendah_gi: 'Dessert Rendah GI',
  };

  const categoryLabel = categoryNames[dishCategory] || 'Makanan Sehat';

  // Base ingredients builder
  const ingredients: RecipeIngredient[] = [];
  let currentCost = 0;

  if (dishCategory === 'makanan_berat') {
    if (targetConsumers.includes('anak_sekolah')) {
      return {
        ...INITIAL_FEATURED_RECIPE,
        id: `recipe-${Date.now()}`,
        imageUrl: FOOD_IMAGES.nasiGoreng,
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, 9500),
      };
    }

    if (targetConsumers.includes('balita')) {
      ingredients.push(
        { name: 'Biji sorgum giling halus (bubur)', amount: '50g', estimatedPrice: 2000 },
        { name: 'Kuning telur ayam kampung', amount: '1 butir', estimatedPrice: 2500 },
        { name: 'Wortel & bayam cincang halus', amount: '1 genggam', estimatedPrice: 1500 },
        { name: 'Kaldu ayam kampung alami', amount: '150ml', estimatedPrice: 2000 },
        { name: 'Minyak kelapa murni (EVCO)', amount: '1 sdt', estimatedPrice: 1000 }
      );
      currentCost = 9000;
      return {
        id: `recipe-${Date.now()}`,
        title: 'Bubur Tim Sorgum Sayur Pelangi (MPASI)',
        subtitle: 'Tekstur super lembut, kaya zat besi dan prebiotik alami untuk tumbuh kembang optimal balita:',
        targetAge: 'Balita (1-5 thn)',
        dishCategory: 'Makanan Berat',
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, currentCost),
        prepTimeMinutes: 10,
        cookTimeMinutes: 20,
        servings: 1,
        ingredients,
        nutritionHighlight: {
          title: 'Nutrisi Unggulan',
          description: 'Kaya asam folat, zat besi, dan bebas gluten, sangat lembut untuk lambung si kecil.',
          fiberGrams: 5.0,
          proteinGrams: 8.0,
          glycemicIndex: 'Rendah (Low GI)',
          caloriesEstimate: 220,
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Rebus Sorgum',
            instruction: 'Rebus tepung/biji sorgum giling dengan kaldu ayam sambil diaduk hingga mengental menjadi bubur lembut.',
            timerMinutes: 12,
          },
          {
            stepNumber: 2,
            title: 'Masukkan Sayur & Telur',
            instruction: 'Masukkan cincangan wortel halus dan bayam, lalu masukkan kuning telur. Aduk cepat hingga matang sempurna.',
            timerMinutes: 5,
          },
          {
            stepNumber: 3,
            title: 'Tambahkan Lemak Tambahan',
            instruction: 'Matikan api, campurkan 1 sdt minyak kelapa murni sebagai lemak tambahan bergizi. Sajikan hangat.',
            timerMinutes: 1,
          },
        ],
        imageUrl: FOOD_IMAGES.mpasiPorridge,
        tags: ['MPASI Sehat', 'Bebas Gluten', 'Mudah Dicerna', 'Zat Besi Alami'],
        createdAt: new Date().toISOString(),
      };
    }

    if (targetConsumers.includes('lansia')) {
      ingredients.push(
        { name: 'Nasi sorgum empuk kukus', amount: '1 mangkok kecil (100g)', estimatedPrice: 2500 },
        { name: 'Sup bayam jagung bening', amount: '1 mangkuk', estimatedPrice: 2500 },
        { name: 'Tahu / tempe kukus bumbu kuning', amount: '2 potong', estimatedPrice: 2000 },
        { name: 'Ikan suwir / telur rebus', amount: '40g', estimatedPrice: 2500 }
      );
      currentCost = 9500;
      return {
        id: `recipe-${Date.now()}`,
        title: 'Nasi Sorgum Gurih dengan Sayur Bening & Protein',
        subtitle: 'Menu ramah gula darah, mudah dikunyah dan kaya antioksidan polifenol:',
        targetAge: 'Lansia',
        dishCategory: 'Makanan Berat',
        targetBudget: budgetPerPortion,
        estimatedCost: Math.min(budgetPerPortion, currentCost),
        prepTimeMinutes: 15,
        cookTimeMinutes: 20,
        servings: 1,
        ingredients,
        nutritionHighlight: {
          title: 'Nutrisi Unggulan',
          description: 'Indeks Glikemik rendah mencegah lonjakan gula darah dan tinggi kalium untuk kesehatan jantung.',
          fiberGrams: 9.5,
          proteinGrams: 12.0,
          glycemicIndex: 'Sangat Rendah',
          caloriesEstimate: 290,
        },
        steps: [
          {
            stepNumber: 1,
            title: 'Kukus Nasi Sorgum',
            instruction: 'Kukus nasi sorgum hingga berbutir lembut dan mekar empuk.',
            timerMinutes: 10,
          },
          {
            stepNumber: 2,
            title: 'Masak Kuah Bening',
            instruction: 'Rebus temu kunci, bawang merah, bayam segar dan sedikit garam rendah natrium.',
            timerMinutes: 8,
          },
          {
            stepNumber: 3,
            title: 'Sajikan Lengkap',
            instruction: 'Tata dengan lauk tempe/ikan suwir hangat untuk asupan gizi seimbang.',
            timerMinutes: 2,
          },
        ],
        imageUrl: FOOD_IMAGES.buddhaBowl,
        tags: ['Ramah Diabetes', 'Rendah Natrium', 'Jantung Sehat'],
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (dishCategory === 'camilan_sehat') {
    return {
      id: `recipe-${Date.now()}`,
      title: 'Cookies Renyah Sorgum Cokelat Kenari',
      subtitle: 'Kudapan sehat tanpa terigu gandum, renyah manis alami pas untuk teman santai:',
      targetAge: targetLabel,
      dishCategory: 'Camilan Sehat',
      targetBudget: budgetPerPortion,
      estimatedCost: Math.min(budgetPerPortion, 8500),
      prepTimeMinutes: 15,
      cookTimeMinutes: 15,
      servings: 4,
      ingredients: [
        { name: 'Tepung sorgum murni', amount: '120g', estimatedPrice: 4000 },
        { name: 'Bubuk kakao murni (unsweetened)', amount: '2 sdm', estimatedPrice: 2000 },
        { name: 'Gula kelapa / madu', amount: '2 sdm', estimatedPrice: 1500 },
        { name: 'Minyak kelapa & vanili', amount: '2 sdm', estimatedPrice: 1000 },
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Tinggi antioksidan flavonoid cokelat & bebas gula rafinasi untuk energi bersih tanpa rasa bersalah.',
        fiberGrams: 7.2,
        proteinGrams: 5.4,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 160,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Campur Adonan Kering',
          instruction: 'Aduk tepung sorgum, bubuk kakao, dan sedikit garam halus.',
          timerMinutes: 3,
        },
        {
          stepNumber: 2,
          title: 'Bentuk Bulatan Keping',
          instruction: 'Satukan dengan minyak kelapa dan madu hingga kalis. Pipihkan di atas loyang beralas baking paper.',
          timerMinutes: 5,
        },
        {
          stepNumber: 3,
          title: 'Panggang Kering',
          instruction: 'Panggang pada suhu 160°C selama 12-15 menit. Dinginkan agar tekstur menjadi renyah maksimal.',
          timerMinutes: 15,
        },
      ],
      imageUrl: FOOD_IMAGES.cookies,
      tags: ['Bebas Terigu', 'Camilan Sehat', 'Rendah Gula'],
      createdAt: new Date().toISOString(),
    };
  }

  if (dishCategory === 'minuman_nutrisi') {
    return {
      id: `recipe-${Date.now()}`,
      title: 'Sorghum Milkshake Susu Nabati Kurma',
      subtitle: 'Minuman booster energi menyegarkan kaya kalsium dan serat larut prebiotik:',
      targetAge: targetLabel,
      dishCategory: 'Minuman Nutrisi',
      targetBudget: budgetPerPortion,
      estimatedCost: Math.min(budgetPerPortion, 7500),
      prepTimeMinutes: 5,
      cookTimeMinutes: 5,
      servings: 1,
      ingredients: [
        { name: 'Susu biji sorgum sangrai / tepung sorgum matang', amount: '2 sdm (30g)', estimatedPrice: 2500 },
        { name: 'Kurma matang (buang biji)', amount: '3 butir', estimatedPrice: 2000 },
        { name: 'Susu cair / air kelapa hangat', amount: '200ml', estimatedPrice: 2000 },
        { name: 'Kayu manis bubuk sejumput', amount: '1/4 sdt', estimatedPrice: 500 },
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Bebas laktosa (jika memakai air nabati), kaya magnesium dan kalsium nabati untuk daya tahan tubuh.',
        fiberGrams: 6.8,
        proteinGrams: 6.2,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 195,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Seduh / Blender',
          instruction: 'Masukkan sari sorgum, kurma lembut, dan cairan ke dalam blender.',
          timerMinutes: 2,
        },
        {
          stepNumber: 2,
          title: 'Haluskan Sempurna',
          instruction: 'Blender kecepatan tinggi selama 1 menit hingga berbuih halus dan creamy lembut.',
          timerMinutes: 1,
        },
        {
          stepNumber: 3,
          title: 'Sajikan Segar',
          instruction: 'Tuang ke gelas saji, taburi sedikit bubuk kayu manis wangi. Nikmati hangat atau dingin!',
          timerMinutes: 1,
        },
      ],
      imageUrl: FOOD_IMAGES.milkshake,
      tags: ['Minuman Sehat', 'Plant-Based', 'Booster Energi'],
      createdAt: new Date().toISOString(),
    };
  }

  // Dessert Rendah GI
  return {
    id: `recipe-${Date.now()}`,
    title: 'Puding Sutra Sorgum Pandan Suji (Low GI)',
    subtitle: 'Pencuci mulut manis alami yang lembut di lidah dan ramah kestabilan gula darah:',
    targetAge: targetLabel,
    dishCategory: 'Dessert Rendah GI',
    targetBudget: budgetPerPortion,
    estimatedCost: Math.min(budgetPerPortion, 8000),
    prepTimeMinutes: 10,
    cookTimeMinutes: 10,
    servings: 2,
    ingredients: [
      { name: 'Tepung sorgum putih halus', amount: '40g', estimatedPrice: 2000 },
      { name: 'Jus daun pandan & suji alami', amount: '100ml', estimatedPrice: 1500 },
      { name: 'Santan encer / susu kedelai', amount: '200ml', estimatedPrice: 2500 },
      { name: 'Gula singkong / pemanis stevia', amount: '1 sdm', estimatedPrice: 1500 },
      { name: 'Garam & daun pandan simpul', amount: '1 lembar', estimatedPrice: 500 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Serat larut sorgum memperlambat penyerapan karbohidrat sehingga aman dinikmati tanpa rasa cemas.',
      fiberGrams: 8.0,
      proteinGrams: 4.8,
      glycemicIndex: 'Sangat Rendah',
      caloriesEstimate: 140,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Larutkan Tepung',
        instruction: 'Aduk tepung sorgum bersama air perasan pandan dan santan hingga tidak ada gumpalan.',
        timerMinutes: 3,
      },
      {
        stepNumber: 2,
        title: 'Masak Meletup-letup',
        instruction: 'Masak dengan api kecil sambil terus diaduk searah jarum jam hingga adonan mengkilap dan meletup.',
        timerMinutes: 6,
      },
      {
        stepNumber: 3,
        title: 'Tuang Cetakan & Dinginkan',
        instruction: 'Tuang ke mangkuk cetakan kecil, dinginkan di kulkas selama 20 menit sebelum disajikan dingin.',
        timerMinutes: 20,
      },
    ],
    imageUrl: FOOD_IMAGES.pudding,
    tags: ['Dessert Sehat', 'Low GI', 'Pewarna Alami', 'Gluten Free'],
    createdAt: new Date().toISOString(),
  };
}

export function generateCustomRecipeQuery(userPrompt: string): Recipe {
  const lower = userPrompt.toLowerCase();
  
  // Custom smart matcher
  if (lower.includes('pancake') || lower.includes('panekuk')) {
    return {
      id: `recipe-pancake-${Date.now()}`,
      title: 'Pancake Tepung Sorgum Madu Kelapa',
      subtitle: 'Pancake tebal lembut bebas gluten yang kaya serat untuk menu sarapan praktis:',
      targetAge: 'Semua Umur',
      dishCategory: 'Camilan Sehat',
      targetBudget: 12000,
      estimatedCost: 10500,
      prepTimeMinutes: 10,
      cookTimeMinutes: 10,
      servings: 2,
      ingredients: [
        { name: 'Tepung sorgum premium', amount: '100g', estimatedPrice: 3500 },
        { name: '1 butir telur ayam', amount: '1 butir', estimatedPrice: 2000 },
        { name: 'Susu almond / santan cair', amount: '100ml', estimatedPrice: 2000 },
        { name: 'Madu murni / gula semut', amount: '1 sdm', estimatedPrice: 2000 },
        { name: 'Minyak kelapa untuk memanggang', amount: '1 sdt', estimatedPrice: 1000 },
      ],
      nutritionHighlight: {
        title: 'Nutrisi Unggulan',
        description: 'Bebas alergen gandum terigu, tinggi protein dan zat besi nabati.',
        fiberGrams: 7.5,
        proteinGrams: 8.0,
        glycemicIndex: 'Rendah (Low GI)',
        caloriesEstimate: 260,
      },
      steps: [
        {
          stepNumber: 1,
          title: 'Kocok Bahan Basah',
          instruction: 'Kocok telur dan madu hingga larut, lalu tuang santan/susu cair.',
          timerMinutes: 2,
        },
        {
          stepNumber: 2,
          title: 'Campur Tepung Sorgum',
          instruction: 'Masukkan tepung sorgum sedikit demi sedikit hingga adonan licin kental.',
          timerMinutes: 3,
        },
        {
          stepNumber: 3,
          title: 'Dadar di Teflon',
          instruction: 'Panggang di teflon hangat dengan api kecil hingga kedua sisi kecokelatan keemasan.',
          timerMinutes: 5,
        },
      ],
      imageUrl: FOOD_IMAGES.pancake,
      tags: ['Sarapan Sehat', 'Gluten-Free', 'High Fiber'],
      createdAt: new Date().toISOString(),
    };
  }

  // Default rich smart response matching the prompt or Nasi Goreng
  return {
    id: `recipe-custom-${Date.now()}`,
    title: 'Nasi Goreng Sorgum Ceria (SD Edition)',
    subtitle: 'Tentu! Ini resep bergizi, lezat, dan sangat terjangkau untuk bekal sekolah:',
    targetAge: 'Anak Sekolah (6-12 thn)',
    dishCategory: 'Makanan Berat',
    targetBudget: 10000,
    estimatedCost: 9500,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    servings: 1,
    ingredients: [
      { name: '1 piring nasi sorgum dingin', amount: '1 piring (150g)', estimatedPrice: 3000 },
      { name: '1 butir telur, kocok lepas', amount: '1 butir', estimatedPrice: 2000 },
      { name: 'Wortel kecil, potong dadu', amount: '1/2 buah', estimatedPrice: 1000 },
      { name: 'Bawang merah & putih', amount: '2 siung each', estimatedPrice: 1500 },
      { name: 'Kecap manis & garam', amount: 'Secukupnya', estimatedPrice: 1000 },
      { name: 'Sedikit minyak goreng', amount: '1 sdm', estimatedPrice: 1000 },
    ],
    nutritionHighlight: {
      title: 'Nutrisi Unggulan',
      description: 'Tinggi serat untuk energi tahan lama & bebas gluten (aman untuk pencernaan sensitif).',
      fiberGrams: 8.5,
      proteinGrams: 9.2,
      glycemicIndex: 'Rendah (Low GI)',
      caloriesEstimate: 340,
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Nasi Sorgum',
        instruction: 'Gunakan nasi sorgum yang sudah dingin dari kulkas agar butirannya kenyal dan tidak lembek.',
        timerMinutes: 2,
      },
      {
        stepNumber: 2,
        title: 'Tumis Bumbu & Orak-Arik Telur',
        instruction: 'Tumis bawang merah & bawang putih cincang hingga wangi, orak-arik telur hingga matang harum.',
        timerMinutes: 3,
      },
      {
        stepNumber: 3,
        title: 'Campur Wortel & Nasi Sorgum',
        instruction: 'Masukkan potongan dadu wortel, masukkan nasi sorgum, bumbui dengan kecap manis dan sejumput garam.',
        timerMinutes: 4,
      },
      {
        stepNumber: 4,
        title: 'Aduk Matang & Kemas',
        instruction: 'Aduk cepat di atas api sedang hingga bumbu meresap rata. Angkat dan sajikan untuk bekal sekolah anak.',
        timerMinutes: 3,
      },
    ],
    imageUrl: FOOD_IMAGES.nasiGoreng,
    tags: ['Bekal Sekolah', 'Bebas Gluten', 'Hemat Biaya', 'Energi Seharian'],
    createdAt: new Date().toISOString(),
  };
}
