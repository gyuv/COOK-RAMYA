import type { Ingredient } from '../data/types';

// Serving calculator (sections 14 / 18 / 62). Scales quantities and rounds to
// practical amounts — never "0.003 tsp salt". Some ingredients (salt, spices,
// water in certain dishes) are marked noScale and are adjusted only loosely,
// with a hint to season to taste.

// Round to a sensible cooking amount based on magnitude and unit.
export function prettyQty(value: number, unit: string): string {
  if (!isFinite(value) || value <= 0) return '';
  const u = unit.toLowerCase();

  // Whole-count items: round to nearest whole (min 1), allow .5 for small counts.
  const countLike = ['', 'medium', 'large', 'small', 'clove', 'cloves', 'sprig', 'pack',
    'sachet', 'piece', 'pieces', 'inch', 'lemon-sized', 'small ball', 'small piece', 'pinch', 'items', 'set'];
  if (countLike.includes(u)) {
    if (value < 1) return roundToFraction(value);
    if (value < 4) return String(Math.round(value * 2) / 2);
    return String(Math.round(value));
  }

  // Spoons & cups: use friendly fractions.
  if (['tsp', 'tbsp', 'cup'].includes(u)) return roundToFraction(value);

  // Weight/volume: round to tidy steps.
  if (['g', 'ml'].includes(u)) {
    if (value >= 100) return String(Math.round(value / 25) * 25);
    if (value >= 10) return String(Math.round(value / 5) * 5);
    return String(Math.round(value));
  }
  if (['kg', 'l'].includes(u)) return String(Math.round(value * 4) / 4);

  // Default: one decimal.
  return String(Math.round(value * 10) / 10);
}

// Nearest common kitchen fraction (1/8..whole).
function roundToFraction(value: number): string {
  const whole = Math.floor(value);
  const frac = value - whole;
  const eighths = Math.round(frac * 8);
  const map: Record<number, string> = { 0: '', 1: '⅛', 2: '¼', 3: '⅜', 4: '½', 5: '⅝', 6: '¾', 7: '⅞', 8: '' };
  const carry = eighths === 8 ? 1 : 0;
  const w = whole + carry;
  const f = eighths === 8 ? '' : map[eighths];
  if (w === 0 && f === '') return '⅛'; // tiny but non-zero
  if (w === 0) return f;
  return f ? `${w} ${f}` : String(w);
}

export interface ScaledIngredient extends Ingredient {
  displayQty: string;
  scaledFrom: number; // base servings used
  looselyScaled: boolean;
}

export function scaleIngredients(
  ingredients: Ingredient[],
  baseServings: number,
  targetServings: number
): ScaledIngredient[] {
  const factor = targetServings / baseServings;
  return ingredients.map((ing) => {
    if (ing.qty == null) {
      return { ...ing, displayQty: '', scaledFrom: baseServings, looselyScaled: Boolean(ing.noScale) };
    }
    if (ing.noScale) {
      // Season-to-taste items: nudge only, and only in big jumps.
      const nudged = factor >= 2 ? ing.qty * 1.5 : factor <= 0.5 ? ing.qty * 0.6 : ing.qty;
      return { ...ing, displayQty: prettyQty(nudged, ing.unit), scaledFrom: baseServings, looselyScaled: true };
    }
    return { ...ing, displayQty: prettyQty(ing.qty * factor, ing.unit), scaledFrom: baseServings, looselyScaled: false };
  });
}

export const SERVING_PRESETS = [1, 2, 4, 6, 10, 20];
