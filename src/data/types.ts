// ============================================================
// RAMYA-COOK — Core data model
// A recipe carries everything the guided-cooking experience needs:
// heat, timers, sensory cues, doneness, science, substitutions.
// ============================================================

export type Diet = 'veg' | 'nonveg' | 'egg' | 'vegan' | 'jain';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type HeatLevel = 'Off' | 'Low' | 'Medium-Low' | 'Medium' | 'Medium-High' | 'High';
export type StoveMethod =
  | 'Gas stove' | 'Induction' | 'Electric stove' | 'Oven' | 'OTG'
  | 'Air fryer' | 'Pressure cooker' | 'Instant Pot' | 'Wet grinder' | 'No-cook';

export interface Ingredient {
  item: string;          // references an IngredientInfo id where known
  qty: number | null;    // base quantity for `baseServings` (null = "to taste")
  unit: string;          // "cup", "tsp", "g", "" etc.
  note?: string;
  group?: string;        // "Dosa Batter", "Potato Masala"
  noScale?: boolean;     // culinary logic: do not scale linearly (e.g. salt, spice, water in some cases)
  optional?: boolean;
}

export interface Timer {
  label: string;
  seconds: number;
}

export interface Step {
  n: number;
  title: string;
  body: string;
  heat?: HeatLevel;
  tempC?: [number, number]; // recommended range
  method?: StoveMethod;
  timer?: Timer;
  see?: string;    // what should you see
  smell?: string;  // what should you smell
  hear?: string;   // what should you hear
  feel?: string;   // texture cue
  why?: string;    // cooking science, plain language
  parallel?: string[]; // useful parallel tasks while this cooks
  technique?: string;  // technique id used here
}

export interface Nutrition {
  calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number;
  estimate: true;
}

export interface Substitution {
  ingredient: string;
  options: { name: string; ratio: string; flavor: string; texture: string; note?: string }[];
}

export interface Recipe {
  id: string;
  slug: string;
  name: string;
  tagline?: string;
  description: string;
  // Region -> State -> Cuisine -> Dish
  country: string;
  region: string;        // "South India", "North India"...
  state: string;         // "Tamil Nadu"
  cuisine: string;       // "Tamil", "Kerala"
  category: string;      // "Breakfast", "Main", "Snack", "Sweet"...
  dishType: string;      // "Dosa", "Sambar" — links variations together
  diet: Diet;
  vegan?: boolean;       // a vegetarian dish that is also vegan
  glutenFree?: boolean;
  dairyFree?: boolean;
  nutFree?: boolean;
  difficulty: Difficulty;
  prepMin: number;
  cookMin: number;
  baseServings: number;
  popularity: number;    // 0-100
  tags: string[];        // "Traditional","Hotel style","Quick","Healthy","Spicy","Festive","Beginner"...
  styleLabel?: string;   // short label used in "choose your version"
  equipment: string[];   // equipment ids
  ingredients: Ingredient[];
  steps: Step[];
  doneness?: string[];   // "Dosa is ready when..."
  nutrition?: Nutrition;
  substitutions?: Substitution[];
  variationsOf?: string; // dishType key it belongs to (redundant w/ dishType but explicit)
  relatedRecipeIds?: string[];
  pairWith?: string[];   // recipe ids for "you might also like"
  completeMeal?: { title: string; recipeIds: string[] };
  products?: string[];   // product ids used
  techniques?: string[];
  story?: { origin: string; culture: string };
  festival?: string[];   // festival ids
  season?: ('Summer' | 'Monsoon' | 'Winter' | 'All')[];
  art: string;           // procedural art key (color/shape)
}

export interface ProductVariant { name: string; note?: string }
export interface Product {
  id: string;
  slug: string;
  name: string;
  brandNote?: string;
  category: string;      // "Instant noodles", "Rice", "Dal"...
  description: string;
  typicalCookMin?: number;
  variants: ProductVariant[];
  recipeIds: string[];       // recipes using the product
  alternatives: string[];    // alternative product ids
  combos?: string[];         // popular combinations (free text)
  servingIdeas?: string[];
  relatedIngredients?: string[];
  art: string;
}

export interface IngredientInfo {
  id: string;
  name: string;
  kind: 'spice' | 'vegetable' | 'grain' | 'lentil' | 'dairy' | 'herb' | 'other';
  what: string;
  flavor: string;
  howToUse: string;
  whenToAdd: string;
  store: string;
  substitutes: string[];
  mistakes: string[];
  shopGroup: 'Vegetables' | 'Spices' | 'Pantry' | 'Dairy' | 'Herbs' | 'Other';
  art: string;
}

export interface Technique {
  id: string;
  slug: string;
  name: string;
  local?: string;      // "Tadka"
  what: string;
  why: string;
  how: string[];
  heat?: HeatLevel;
  visualCues: string[];
  mistakes: string[];
  recipeIds: string[];
  sequence?: string[]; // for tadka-style visual guide
  art: string;
}

export interface Equipment {
  id: string;
  slug: string;
  name: string;
  local?: string;
  what: string;
  goodFor: string;
  howToUse: string;
  cleaning: string;
  mistakes: string;
  recipeIds: string[];
  art: string;
}

export interface Region {
  id: string;
  name: string;      // "Tamil Nadu"
  region: string;    // "South India"
  blurb: string;
  cuisines: string[];
  signature: string[]; // recipe ids
  art: string;
}

export interface Festival {
  id: string;
  name: string;
  region: string;
  when: string;
  blurb: string;
  recipeIds: string[];
  art: string;
}

export interface RescueFix {
  problem: string;
  icon: string;
  fixes: string[];
  prevent: string;
}
