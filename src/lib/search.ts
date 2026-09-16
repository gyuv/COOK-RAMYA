import { RECIPES, familyFor } from '../data/recipes';
import { PRODUCTS } from '../data/products';
import { INGREDIENTS } from '../data/ingredients';
import { TECHNIQUES } from '../data/techniques';
import { REGIONS } from '../data/regions';
import type { Recipe, Product, IngredientInfo, Technique } from '../data/types';

// Local search engine (sections 10 / 11 / 85). Normalised index, partial and
// case-insensitive matching, common Indian spelling variants and synonyms.
// The SearchEngine interface below could later be backed by Meilisearch /
// Typesense / Algolia without changing any UI.

export type SearchKind = 'recipe' | 'product' | 'ingredient' | 'technique' | 'cuisine' | 'family';

export interface SearchHit {
  kind: SearchKind;
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  art: string;
  score: number;
  extra?: string;
}

export interface GroupedResults {
  query: string;
  recipes: SearchHit[];
  families: SearchHit[];
  products: SearchHit[];
  ingredients: SearchHit[];
  techniques: SearchHit[];
  cuisines: SearchHit[];
  total: number;
}

// Common alias / synonym map → canonical tokens added to the haystack.
const SYNONYMS: Record<string, string> = {
  dosai: 'dosa', dhosa: 'dosa', thosai: 'dosa',
  idly: 'idli', idlis: 'idli',
  sambhar: 'sambar', saambar: 'sambar',
  rasham: 'rasam', chaaru: 'rasam',
  biriyani: 'biryani', biriani: 'biryani', briyani: 'biryani',
  chutny: 'chutney', chatni: 'chutney',
  maggie: 'maggi', magi: 'maggi', noodle: 'noodles',
  paratha: 'parotta', porotta: 'parotta',
  tiffin: 'breakfast dosa idli pongal upma',
  brekfast: 'breakfast', bfast: 'breakfast',
  veg: 'vegetarian', nonveg: 'non-vegetarian', 'non veg': 'non-vegetarian',
  coffee: 'filter coffee', curd: 'curd yoghurt',
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Cheap singular/plural fold.
const singular = (t: string) => (t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t);

interface IndexEntry {
  kind: SearchKind;
  id: string; slug: string; title: string; subtitle: string; art: string;
  hay: string;      // normalized searchable text
  weight: number;   // base importance (popularity-ish)
  extra?: string;
}

function buildIndex(): IndexEntry[] {
  const entries: IndexEntry[] = [];

  for (const r of RECIPES) {
    const syn = Object.entries(SYNONYMS).filter(([, v]) => v.split(' ').includes(norm(r.dishType).split(' ')[0])).map(([k]) => k).join(' ');
    entries.push({
      kind: 'recipe', id: r.id, slug: r.slug, title: r.name,
      subtitle: `${r.state} · ${r.cuisine} · ${r.category}`, art: r.art,
      hay: norm([r.name, r.dishType, r.cuisine, r.state, r.region, r.category, r.tags.join(' '), r.styleLabel ?? '', r.diet, syn].join(' ')),
      weight: r.popularity,
      extra: r.styleLabel,
    });
  }
  // Families as their own hits (e.g. "Dosa" → the family page).
  const familySeen = new Set<string>();
  for (const r of RECIPES) {
    if (familySeen.has(r.dishType)) continue;
    familySeen.add(r.dishType);
    const members = familyFor(r.dishType);
    if (members.length < 2) continue;
    entries.push({
      kind: 'family', id: r.dishType, slug: norm(r.dishType).replace(/\s+/g, '-'), title: r.dishType,
      subtitle: `${members.length} variations`, art: members[0].art,
      hay: norm([r.dishType, members.map((m) => m.name).join(' ')].join(' ')),
      weight: 90 + members.length, extra: `${members.length} ways`,
    });
  }
  for (const p of PRODUCTS) {
    entries.push({
      kind: 'product', id: p.id, slug: p.slug, title: p.name, subtitle: p.category, art: p.art,
      hay: norm([p.name, p.category, p.variants.map((v) => v.name).join(' ')].join(' ')),
      weight: 70,
    });
  }
  for (const i of INGREDIENTS) {
    entries.push({
      kind: 'ingredient', id: i.id, slug: i.id, title: i.name, subtitle: `${i.kind} · ${i.flavor.split(',')[0]}`, art: i.art,
      hay: norm([i.name, i.kind, i.flavor].join(' ')), weight: 50,
    });
  }
  for (const t of TECHNIQUES) {
    entries.push({
      kind: 'technique', id: t.id, slug: t.slug, title: t.name, subtitle: t.local ?? 'Technique', art: t.art,
      hay: norm([t.name, t.local ?? '', t.what].join(' ')), weight: 40,
    });
  }
  const cuisineSeen = new Set<string>();
  for (const region of REGIONS) {
    for (const c of region.cuisines) {
      if (cuisineSeen.has(c)) continue;
      cuisineSeen.add(c);
      entries.push({
        kind: 'cuisine', id: region.id, slug: region.id, title: `${c} Cuisine`, subtitle: region.name, art: region.art,
        hay: norm([c, region.name, region.region].join(' ')), weight: 45,
      });
    }
  }
  return entries;
}

const INDEX = buildIndex();

function scoreEntry(entry: IndexEntry, tokens: string[]): number {
  let score = 0;
  for (const tok of tokens) {
    const t = singular(tok);
    const title = norm(entry.title);
    if (title === t) score += 120;
    else if (title.startsWith(t)) score += 70;
    else if (title.includes(t)) score += 45;
    else if (entry.hay.includes(` ${t}`) || entry.hay.startsWith(t)) score += 25;
    else if (entry.hay.includes(t)) score += 12;
    else return -1; // every token must match somewhere
  }
  return score + entry.weight / 20;
}

export function search(query: string, limitPerGroup = 8): GroupedResults {
  const q = norm(query);
  const empty: GroupedResults = { query, recipes: [], families: [], products: [], ingredients: [], techniques: [], cuisines: [], total: 0 };
  if (!q) return empty;

  // Expand synonyms in the query itself.
  const expanded = q.split(' ').map((w) => SYNONYMS[w] ?? w).join(' ');
  const tokens = expanded.split(' ').filter(Boolean);

  const hits: SearchHit[] = [];
  for (const e of INDEX) {
    const s = scoreEntry(e, tokens);
    if (s >= 0) hits.push({ kind: e.kind, id: e.id, slug: e.slug, title: e.title, subtitle: e.subtitle, art: e.art, score: s, extra: e.extra });
  }
  hits.sort((a, b) => b.score - a.score);

  const pick = (kind: SearchKind) => hits.filter((h) => h.kind === kind).slice(0, limitPerGroup);
  const res: GroupedResults = {
    query,
    families: pick('family'),
    recipes: pick('recipe'),
    products: pick('product'),
    ingredients: pick('ingredient'),
    techniques: pick('technique'),
    cuisines: pick('cuisine'),
    total: hits.length,
  };
  return res;
}

// Lightweight autocomplete: top mixed suggestions while typing.
export function suggest(query: string, limit = 8): SearchHit[] {
  const r = search(query, limit);
  const merged = [...r.families, ...r.recipes, ...r.products, ...r.ingredients, ...r.techniques, ...r.cuisines];
  return merged.sort((a, b) => b.score - a.score).slice(0, limit);
}

export const POPULAR_SEARCHES = ['Idli', 'Dosa', 'Sambar', 'Biryani', 'Maggi', 'Chicken Curry', 'Paneer', 'Rasam'];
export const BROWSE_CATEGORIES = ['Breakfast', 'Main', 'Snack', 'Sweet', 'Chutney', 'Drink', 'Side'];

// Typed accessors kept here so callers don't reach past the search module.
export type { Recipe, Product, IngredientInfo, Technique };
