// ============================================================
// RAMYA-COOK — Real dish photography (centralized)
// ------------------------------------------------------------
// Every dish resolves to a REAL photo through a cascade (see DishImage):
//   1. A curated, exact photo in IMAGES below (highest priority).
//   2. A keyword-matched real food photo from LoremFlickr (CC images sourced
//      from Flickr by tag) — deterministic per dish, so it never changes on
//      reload and covers 100% of dishes with no API key.
//   3. The procedural FoodArt, only if the network image can't load at all
//      (offline) — so the UI degrades gracefully but is never a blank/dummy.
//
// This is deliberately NOT Pinterest/Google scraping. To pin exact, licensed,
// self-hosted photos, run `npm run resolve-images` (scripts/resolve-images.mjs)
// on a machine with internet — it fills images.generated.ts, which is merged in
// below and wins over the keyword fallback. All URLs live in this one file.
// ============================================================

export interface DishPhoto {
  src: string;
  credit: string;
}

const commons = (file: string, width = 800): string =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

const CC = 'Photo: Wikimedia Commons (CC BY-SA)';

// Curated exact photos (override the keyword fallback). If one 404s in the
// browser, DishImage automatically drops to the keyword photo below it.
const CURATED: Record<string, DishPhoto> = {
  'masala-dosa': { src: commons('Masala_Dosa.jpg'), credit: CC },
  idli: { src: commons('Idli_-_Kerala_cuisine.jpg'), credit: CC },
  'sambar-classic': { src: commons('Sambar_(dish).jpg'), credit: CC },
  'ven-pongal': { src: commons('Ven_Pongal_(Khara_Pongal).jpg'), credit: CC },
  'hyderabadi-biryani': { src: commons('Hyderabadi_Chicken_Biryani.jpg'), credit: CC },
  'chicken-chettinad': { src: commons('Chicken_Chettinad.jpg'), credit: CC },
  'gulab-jamun': { src: commons('Gulab_jamun_(Gulaab_jamun).jpg'), credit: CC },
  'pav-bhaji': { src: commons('Pav_Bhaji_from_Mumbai.jpg'), credit: CC },
};

// Generated overrides (filled by scripts/resolve-images.mjs). Ships empty;
// verified/self-hosted photos merged here win over the keyword fallback.
import { GENERATED_IMAGES } from './images.generated';

export const IMAGES: Record<string, DishPhoto> = { ...CURATED, ...(GENERATED_IMAGES as Record<string, DishPhoto>) };

export const photoFor = (id: string): DishPhoto | undefined => IMAGES[id];

// Deterministic keyword photo — a real CC food photo matched to the dish name.
// `lock` keeps the same image on every load (no flicker, no layout shift).
export function keywordPhoto(seedId: string, name: string): string {
  const tags = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !['style', 'the', 'a', 'with', 'and'].includes(w))
    .slice(0, 3)
    .join(',');
  let h = 7;
  for (let i = 0; i < seedId.length; i++) h = (Math.imul(h, 31) + seedId.charCodeAt(i)) | 0;
  const lock = Math.abs(h) % 100000;
  return `https://loremflickr.com/640/480/${encodeURIComponent(`${tags},indian,food`)}?lock=${lock}`;
}

export const KEYWORD_CREDIT = 'Photo: Flickr (CC) via LoremFlickr';
