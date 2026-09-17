// ============================================================
// RAMYA-COOK — Real dish photography (verified only)
// ------------------------------------------------------------
// A dish shows a PHOTO only when we have a VERIFIED one:
//   • images.generated.ts — produced by `npm run resolve-images`, which fetches
//     from TheMealDB / Wikimedia Commons, HEAD-checks that the URL is a live
//     image, and (with --download) self-hosts it under /public/dishes.
// Anything without a verified photo shows the polished procedural FoodArt.
//
// We do NOT ship unverified/guessed URLs and do NOT use random keyword image
// services (which returned wrong/unrelated photos). No wrong image is ever
// shown — only a verified match or clean art.
// ============================================================

export interface DishPhoto {
  src: string;
  credit: string;
}

// Verified overrides you add by hand (leave empty unless you've confirmed the
// exact URL loads the correct dish). The resolver fills images.generated.ts.
const CURATED: Record<string, DishPhoto> = {};

import { GENERATED_IMAGES } from './images.generated';

export const IMAGES: Record<string, DishPhoto> = { ...CURATED, ...(GENERATED_IMAGES as Record<string, DishPhoto>) };

export const photoFor = (id: string): DishPhoto | undefined => IMAGES[id];
