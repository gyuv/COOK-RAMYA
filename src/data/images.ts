// ============================================================
// RAMYA-COOK — Real dish photography (centralized, opt-in)
// ------------------------------------------------------------
// Photos are hotlinked from Wikimedia Commons via Special:FilePath, which is
// CC-licensed (mostly CC BY-SA / public domain) and permits hotlinking with
// attribution. This is deliberately NOT Pinterest/Google image scraping:
// those are copyrighted and block hotlinking (broken images).
//
// The <DishImage> component renders these lazily with a blur-in and an
// onError fallback to the procedural FoodArt, so:
//   • any id NOT in this map  → shows styled art (never blank)
//   • any photo that 404s     → falls back to art (never a broken image)
//
// To use your own licensed photography, replace a `src` here (or drop files
// into /public/dishes and point `src` at "/dishes/<file>.jpg"). Nothing else
// in the app changes — image URLs live only in this file (section 14).
// ============================================================

export interface DishPhoto {
  src: string;
  credit: string; // shown as a small attribution line on hero images
}

// Commons file → stable hotlinkable URL (scaled for performance).
const commons = (file: string, width = 800): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

const CC = 'Photo: Wikimedia Commons (CC BY-SA)';

// Curated flagship set. Unlisted dishes intentionally use the procedural art.
export const IMAGES: Record<string, DishPhoto> = {
  'masala-dosa': { src: commons('Masala_Dosa.jpg'), credit: CC },
  'plain-dosa': { src: commons('Dosa_or_Dosai.jpg'), credit: CC },
  idli: { src: commons('Idli_-_Kerala_cuisine.jpg'), credit: CC },
  'ven-pongal': { src: commons('Ven_Pongal_(Khara_Pongal).jpg'), credit: CC },
  'medu-vada': { src: commons('Medu_Vada.jpg'), credit: CC },
  'sambar-classic': { src: commons('Sambar_(dish).jpg'), credit: CC },
  rasam: { src: commons('Rasam_(dish).jpg'), credit: CC },
  'coconut-chutney': { src: commons('Coconut_chutney.jpg'), credit: CC },
  'chicken-chettinad': { src: commons('Chicken_Chettinad.jpg'), credit: CC },
  'hyderabadi-biryani': { src: commons('Hyderabadi_Chicken_Biryani.jpg'), credit: CC },
  'curd-rice': { src: commons('Curd_Rice.JPG'), credit: CC },
  'lemon-rice': { src: commons('Lemon_rice.jpg'), credit: CC },
  upma: { src: commons('Upma.JPG'), credit: CC },
  appam: { src: commons('Appam_and_stew.jpg'), credit: CC },
  puttu: { src: commons('Puttu_and_kadala_curry.jpg'), credit: CC },
  'kadala-curry': { src: commons('Kadala_Curry.jpg'), credit: CC },
  parotta: { src: commons('Kerala_Parotta.jpg'), credit: CC },
  avial: { src: commons('Aviyal.JPG'), credit: CC },
  'mysore-pak': { src: commons('Mysore_Pak.JPG'), credit: CC },
  murukku: { src: commons('Murukku.JPG'), credit: CC },
  payasam: { src: commons('Semiya_Payasam.jpg'), credit: CC },
  'gulab-jamun': { src: commons('Gulab_jamun_(Gulaab_jamun).jpg'), credit: CC },
  'pav-bhaji': { src: commons('Pav_Bhaji_from_Mumbai.jpg'), credit: CC },
  chole: { src: commons('Chole_Bhature_from_Khalsa_Restaurant.jpg'), credit: CC },
  'dal-makhani': { src: commons('Dal_makhani.jpg'), credit: CC },
  poha: { src: commons('Poha_-_Indori_Poha.jpg'), credit: CC },
  dhokla: { src: commons('Dhokla_(Khaman).jpg'), credit: CC },
  'bisi-bele-bath': { src: commons('Bisi_Bele_Bath.JPG'), credit: CC },
  pesarattu: { src: commons('Pesarattu.jpg'), credit: CC },
  'filter-coffee': { src: commons('Indian_filter_coffee.jpg'), credit: CC },
  'maggi-classic': { src: commons('Maggi_Noodles.jpg'), credit: CC },
};

export const photoFor = (id: string): DishPhoto | undefined => IMAGES[id];
