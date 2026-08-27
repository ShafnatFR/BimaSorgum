export const FOOD_IMAGES = {
  nasiGoreng: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
  pancake: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
  buddhaBowl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  risotto: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=800&auto=format&fit=crop&q=80',
  buburManado: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=800&auto=format&fit=crop&q=80',
  cookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80',
  esCendol: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
  boluKukus: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&auto=format&fit=crop&q=80',
  cornSoup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
  mpasiPorridge: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&auto=format&fit=crop&q=80',
  milkshake: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
  pudding: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  sorghumGrain: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
};

export const INGREDIENT_IMAGES: Record<string, string> = {
  sorgum: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
  tepung: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
  telur: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&auto=format&fit=crop&q=80',
  wortel: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&auto=format&fit=crop&q=80',
  sayur: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=80',
  bawang: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=200&auto=format&fit=crop&q=80',
  kecap: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
  minyak: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80',
  susu: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
  santan: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
  madu: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&auto=format&fit=crop&q=80',
  gula: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&auto=format&fit=crop&q=80',
  jamur: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&auto=format&fit=crop&q=80',
  cokelat: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&auto=format&fit=crop&q=80',
  jagung: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=200&auto=format&fit=crop&q=80',
  labu: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=200&auto=format&fit=crop&q=80',
  ayam: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&auto=format&fit=crop&q=80',
  tempe: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80',
  pisang: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200&auto=format&fit=crop&q=80',
  kaldu: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&auto=format&fit=crop&q=80',
  kurma: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200&auto=format&fit=crop&q=80',
};

export const GLOBAL_FALLBACK_FOOD_IMAGE = FOOD_IMAGES.buddhaBowl;

/**
 * Returns a relevant dummy image for an ingredient based on name keywords
 */
export function getIngredientThumbnail(ingredientName: string, index: number = 0): string {
  const name = ingredientName.toLowerCase();
  if (name.includes('sorgum') || name.includes('sorghum') || name.includes('biji')) return INGREDIENT_IMAGES.sorgum;
  if (name.includes('tepung')) return INGREDIENT_IMAGES.tepung;
  if (name.includes('telur') || name.includes('egg')) return INGREDIENT_IMAGES.telur;
  if (name.includes('wortel') || name.includes('carrot')) return INGREDIENT_IMAGES.wortel;
  if (name.includes('sayur') || name.includes('bayam') || name.includes('kangkung') || name.includes('selada')) return INGREDIENT_IMAGES.sayur;
  if (name.includes('bawang') || name.includes('garlic') || name.includes('onion')) return INGREDIENT_IMAGES.bawang;
  if (name.includes('kecap') || name.includes('garam') || name.includes('bumbu') || name.includes('merica')) return INGREDIENT_IMAGES.kecap;
  if (name.includes('minyak') || name.includes('butter') || name.includes('mentega')) return INGREDIENT_IMAGES.minyak;
  if (name.includes('susu') || name.includes('milk')) return INGREDIENT_IMAGES.susu;
  if (name.includes('santan') || name.includes('coconut')) return INGREDIENT_IMAGES.santan;
  if (name.includes('madu') || name.includes('gula') || name.includes('aren')) return INGREDIENT_IMAGES.madu;
  if (name.includes('jamur') || name.includes('mushroom')) return INGREDIENT_IMAGES.jamur;
  if (name.includes('chocochip') || name.includes('cokelat') || name.includes('kakao')) return INGREDIENT_IMAGES.cokelat;
  if (name.includes('jagung') || name.includes('corn')) return INGREDIENT_IMAGES.jagung;
  if (name.includes('labu') || name.includes('pumpkin')) return INGREDIENT_IMAGES.labu;
  if (name.includes('ayam') || name.includes('daging') || name.includes('ikan')) return INGREDIENT_IMAGES.ayam;
  if (name.includes('tempe') || name.includes('tahu')) return INGREDIENT_IMAGES.tempe;
  if (name.includes('pisang') || name.includes('buah')) return INGREDIENT_IMAGES.pisang;
  if (name.includes('kurma')) return INGREDIENT_IMAGES.kurma;
  if (name.includes('kaldu')) return INGREDIENT_IMAGES.kaldu;

  const fallbackList = [
    INGREDIENT_IMAGES.sorgum,
    INGREDIENT_IMAGES.sayur,
    INGREDIENT_IMAGES.wortel,
    INGREDIENT_IMAGES.minyak,
    INGREDIENT_IMAGES.madu,
  ];
  return fallbackList[index % fallbackList.length];
}

/**
 * Returns a relevant dummy image for a dish title or category
 */
export function getRecipeImage(title: string, category?: string): string {
  const t = (title || '').toLowerCase();
  if (t.includes('nasi goreng') || t.includes('goreng')) return FOOD_IMAGES.nasiGoreng;
  if (t.includes('pancake') || t.includes('panekuk')) return FOOD_IMAGES.pancake;
  if (t.includes('bread') || t.includes('roti') || t.includes('loaf')) return FOOD_IMAGES.bread;
  if (t.includes('bowl') || t.includes('buddha') || t.includes('salad')) return FOOD_IMAGES.buddhaBowl;
  if (t.includes('risotto') || t.includes('mushroom') || t.includes('jamur')) return FOOD_IMAGES.risotto;
  if (t.includes('bubur') || t.includes('tinutuan') || t.includes('porridge') || t.includes('mpasi')) return FOOD_IMAGES.buburManado;
  if (t.includes('cookie') || t.includes('kue kering') || t.includes('biskuit')) return FOOD_IMAGES.cookies;
  if (t.includes('cendol') || t.includes('dawet') || t.includes('es ') || t.includes('minuman')) return FOOD_IMAGES.esCendol;
  if (t.includes('bolu') || t.includes('cake') || t.includes('kue')) return FOOD_IMAGES.boluKukus;
  if (t.includes('sup') || t.includes('soup') || t.includes('chowder')) return FOOD_IMAGES.cornSoup;
  if (t.includes('milkshake') || t.includes('smoothie') || t.includes('susu')) return FOOD_IMAGES.milkshake;
  if (t.includes('puding') || t.includes('pudding') || t.includes('dessert')) return FOOD_IMAGES.pudding;

  if (category === 'makanan_berat') return FOOD_IMAGES.nasiGoreng;
  if (category === 'camilan_sehat') return FOOD_IMAGES.cookies;
  if (category === 'minuman_nutrisi') return FOOD_IMAGES.esCendol;
  if (category === 'dessert_rendah_gi') return FOOD_IMAGES.pudding;

  return GLOBAL_FALLBACK_FOOD_IMAGE;
}
