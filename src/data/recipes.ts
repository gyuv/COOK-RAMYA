import type { Recipe } from './types';
import { FEATURED_RECIPES } from './recipes-featured';
import { DOSA_IDLI_RECIPES } from './recipes-dosa-idli';
import { TAMIL_RECIPES } from './recipes-tamil';
import { SOUTH_RECIPES } from './recipes-south';
import { INDIA_RECIPES } from './recipes-india';
import { EXTRA_RECIPES } from './recipes-extras';
import { MAGGI_RECIPES } from './recipes-maggi';

// The full recipe corpus. Kept as plain data, independent of the UI, so a
// future DatabaseRecipeRepository could replace this module without UI changes.
export const RECIPES: Recipe[] = [
  ...FEATURED_RECIPES,
  ...DOSA_IDLI_RECIPES,
  ...TAMIL_RECIPES,
  ...SOUTH_RECIPES,
  ...INDIA_RECIPES,
  ...EXTRA_RECIPES,
  ...MAGGI_RECIPES,
];

// ---- Indexes (built once) ----
const byId = new Map<string, Recipe>();
const bySlug = new Map<string, Recipe>();
for (const r of RECIPES) {
  byId.set(r.id, r);
  bySlug.set(r.slug, r);
}

export const recipeById = (id: string): Recipe | undefined => byId.get(id);
export const recipeBySlug = (slug: string): Recipe | undefined => bySlug.get(slug);
export const recipesByIds = (ids: string[] = []): Recipe[] =>
  ids.map((id) => byId.get(id)).filter((r): r is Recipe => Boolean(r));

// ---- Recipe families / variations ----
export interface RecipeFamily {
  dishType: string;
  members: Recipe[];
  count: number;
}

export function familyFor(dishType: string): Recipe[] {
  return RECIPES.filter((r) => r.dishType === dishType).sort((a, b) => b.popularity - a.popularity);
}

export function allFamilies(minMembers = 2): RecipeFamily[] {
  const map = new Map<string, Recipe[]>();
  for (const r of RECIPES) {
    const arr = map.get(r.dishType) ?? [];
    arr.push(r);
    map.set(r.dishType, arr);
  }
  return [...map.entries()]
    .map(([dishType, members]) => ({ dishType, members: members.sort((a, b) => b.popularity - a.popularity), count: members.length }))
    .filter((f) => f.count >= minMembers)
    .sort((a, b) => b.count - a.count);
}

// ---- Filters used across pages ----
export const byRegion = (region: string) => RECIPES.filter((r) => r.region === region);
export const byState = (state: string) => RECIPES.filter((r) => r.state === state);
export const byCuisine = (cuisine: string) => RECIPES.filter((r) => r.cuisine === cuisine);
export const byCategory = (category: string) => RECIPES.filter((r) => r.category === category);
export const byTag = (tag: string) => RECIPES.filter((r) => r.tags.includes(tag));

export const popular = (n = 8) => [...RECIPES].sort((a, b) => b.popularity - a.popularity).slice(0, n);
export const popularIn = (region: string, n = 8) =>
  byRegion(region).sort((a, b) => b.popularity - a.popularity).slice(0, n);

export const quickRecipes = (maxTotal = 25, n = 12) =>
  RECIPES.filter((r) => r.prepMin + r.cookMin <= maxTotal).sort((a, b) => b.popularity - a.popularity).slice(0, n);

export const bySeason = (season: 'Summer' | 'Monsoon' | 'Winter') =>
  RECIPES.filter((r) => r.season?.includes(season)).sort((a, b) => b.popularity - a.popularity);

export const totalTime = (r: Recipe) => r.prepMin + r.cookMin;
