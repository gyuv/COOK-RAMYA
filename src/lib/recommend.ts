import { RECIPES, recipeById, recipesByIds, byCuisine, familyFor } from '../data/recipes';
import type { Recipe } from '../data/types';

// Deterministic recommendation engine (sections 64 / 86). No randomness — the
// same inputs always give the same, explainable suggestions.

function uniqueBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((x) => (seen.has(key(x)) ? false : (seen.add(key(x)), true)));
}

// "You might also like" — chutneys/sides/companions, then family & cuisine.
export function relatedTo(recipe: Recipe, n = 6): Recipe[] {
  const pool = [
    ...recipesByIds(recipe.pairWith),
    ...recipesByIds(recipe.relatedRecipeIds),
    ...familyFor(recipe.dishType).filter((r) => r.id !== recipe.id),
    ...byCuisine(recipe.cuisine).filter((r) => r.id !== recipe.id).sort((a, b) => b.popularity - a.popularity),
  ];
  return uniqueBy(pool, (r) => r.id).filter((r) => r.id !== recipe.id).slice(0, n);
}

// "Complete your meal" — the recipe's declared meal, else built from pairings.
export function completeMeal(recipe: Recipe): { title: string; recipes: Recipe[] } | null {
  if (recipe.completeMeal) {
    const recipes = recipesByIds(recipe.completeMeal.recipeIds);
    if (recipes.length) return { title: recipe.completeMeal.title, recipes };
  }
  const sides = recipesByIds(recipe.pairWith).slice(0, 3);
  if (sides.length) return { title: `Serve ${recipe.name} with`, recipes: [recipe, ...sides] };
  return null;
}

// "Because you cooked X" — pairings + family of the most recent cooked dish.
export function becauseYouCooked(historyIds: string[], n = 8): { seed: Recipe; recipes: Recipe[] } | null {
  for (const id of historyIds) {
    const seed = recipeById(id);
    if (seed) {
      const recs = relatedTo(seed, n);
      if (recs.length) return { seed, recipes: recs };
    }
  }
  return null;
}

export interface ForYouPrefs {
  cuisines?: string[];
  diet?: string;
  maxTime?: number;
  equipment?: string[];
}

// "Made for you" — ranks by matching preferences, history and saved items.
export function forYou(prefs: ForYouPrefs, historyIds: string[] = [], savedIds: string[] = [], n = 8): Recipe[] {
  const historyCuisines = new Set(recipesByIds(historyIds).map((r) => r.cuisine));
  const savedCuisines = new Set(recipesByIds(savedIds).map((r) => r.cuisine));
  const prefCuisines = new Set(prefs.cuisines ?? []);

  const scored = RECIPES
    .filter((r) => !historyIds.includes(r.id))
    .map((r) => {
      let s = r.popularity / 10;
      if (prefCuisines.has(r.cuisine)) s += 25;
      if (historyCuisines.has(r.cuisine)) s += 12;
      if (savedCuisines.has(r.cuisine)) s += 8;
      if (prefs.diet && prefs.diet !== 'any') {
        if (prefs.diet === 'veg' && r.diet !== 'nonveg') s += 10;
        else if (prefs.diet === 'vegan' && r.vegan) s += 14;
        else if (prefs.diet === r.diet) s += 10;
        else if (prefs.diet === 'veg' && r.diet === 'nonveg') s -= 40;
        else if (prefs.diet === 'vegan' && !r.vegan) s -= 40;
      }
      if (prefs.maxTime && r.prepMin + r.cookMin <= prefs.maxTime) s += 8;
      if (prefs.equipment && prefs.equipment.length && r.equipment.every((e) => prefs.equipment!.includes(e))) s += 6;
      return { r, s };
    })
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, n).map((x) => x.r);
}

// Seasonal picks based on the current month (configurable by hemisphere later).
export function seasonNow(month = new Date().getMonth()): 'Summer' | 'Monsoon' | 'Winter' {
  // India-centric: Mar–May summer, Jun–Sep monsoon, Oct–Feb "winter"/cool.
  if (month >= 2 && month <= 4) return 'Summer';
  if (month >= 5 && month <= 8) return 'Monsoon';
  return 'Winter';
}

export function seasonalPicks(n = 8): { season: string; recipes: Recipe[] } {
  const season = seasonNow();
  const recipes = RECIPES.filter((r) => r.season?.includes(season)).sort((a, b) => b.popularity - a.popularity).slice(0, n);
  return { season, recipes };
}

// "What can I cook?" — match by available ingredients (sections 30 / 43).
export interface CookMatch {
  recipe: Recipe;
  have: string[];
  missing: string[];
  matchPct: number;
}

const ingText = (r: Recipe) => r.ingredients.map((i) => i.item.toLowerCase());

export function whatCanICook(available: string[], n = 20): CookMatch[] {
  const avail = available.map((a) => a.toLowerCase().trim()).filter(Boolean);
  if (!avail.length) return [];
  const isStaple = (i: string) => ['salt', 'water', 'oil'].some((s) => i.includes(s));

  const matches = RECIPES.map((r) => {
    const ings = ingText(r).filter((i) => !isStaple(i));
    const have: string[] = [];
    const missing: string[] = [];
    for (const ing of ings) {
      const hit = avail.some((a) => ing.includes(a) || a.includes(ing.split(' ')[0]));
      (hit ? have : missing).push(ing);
    }
    const matchPct = ings.length ? Math.round((have.length / ings.length) * 100) : 0;
    return { recipe: r, have, missing, matchPct };
  })
    .filter((m) => m.have.length >= Math.min(2, m.recipe.ingredients.length) && m.matchPct >= 40)
    .sort((a, b) => b.matchPct - a.matchPct || a.missing.length - b.missing.length);

  return matches.slice(0, n);
}

// Leftover mode (section 31 / 44) — map a leftover to good uses.
export const LEFTOVERS: { item: string; art: string; suggestions: string[] }[] = [
  { item: 'Rice', art: 'rice', suggestions: ['lemon-rice', 'tomato-rice', 'curd-rice', 'veg-fried-rice', 'coconut-rice', 'tamarind-rice'] },
  { item: 'Parotta', art: 'flatbread', suggestions: ['kothu-parotta'] },
  { item: 'Idli', art: 'idli', suggestions: ['mini-idli'] },
  { item: 'Dosa batter', art: 'dosa', suggestions: ['paniyaram', 'uthappam', 'onion-dosa'] },
  { item: 'Sambar', art: 'sambar', suggestions: ['mini-idli', 'maggi-sambar'] },
  { item: 'Maggi', art: 'noodles', suggestions: ['maggi-cutlet', 'maggi-sandwich', 'maggi-pizza'] },
  { item: 'Vegetables', art: 'poriyal', suggestions: ['veg-fried-rice', 'veg-noodles', 'kootu', 'sambar-vegetable'] },
];

export function leftoverSuggestions(item: string): Recipe[] {
  const entry = LEFTOVERS.find((l) => l.item.toLowerCase() === item.toLowerCase());
  return entry ? recipesByIds(entry.suggestions) : [];
}
