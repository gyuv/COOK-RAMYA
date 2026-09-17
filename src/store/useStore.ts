import { create } from 'zustand';
import { load, save } from '../lib/storage';
import { aisleFor, normalizeName, type Aisle } from '../lib/shopping';
import { recipeById } from '../data/recipes';
import { scaleIngredients } from '../lib/scaling';

// ---- Persisted domain types ----
export interface HistoryEntry { id: string; cookedAt: number; rating?: number; note?: string; mods?: string; times: number; }
export interface PantryItem { name: string; status: 'available' | 'low' | 'expiring'; }
export interface ShoppingItem { name: string; aisle: Aisle; qty?: string; checked: boolean; fromRecipes: string[]; }
export type MealSlot = 'Breakfast' | 'Lunch' | 'Dinner';
export type MealPlan = Record<string, Partial<Record<MealSlot, string>>>; // day -> slot -> recipeId
export type CookingMode = 'beginner' | 'chef';
export interface Prefs {
  cuisines: string[];
  diet: 'any' | 'veg' | 'vegan' | 'egg' | 'nonveg';
  familySize: number;
  maxTime?: number;
  mode: CookingMode;
  reduceMotion: boolean;
}

// ---- Timer engine (timestamp based) ----
export interface ActiveTimer {
  id: string;
  label: string;
  durationSec: number;
  endAt: number | null;    // ms epoch when running
  remainingSec: number;    // authoritative when paused
  running: boolean;
  doneAcked: boolean;
}

export function timerRemaining(t: ActiveTimer, now = Date.now()): number {
  if (t.running && t.endAt != null) return Math.max(0, Math.round((t.endAt - now) / 1000));
  return Math.max(0, Math.round(t.remainingSec));
}

// ---- Cooking session ----
export interface CookingSession {
  recipeId: string;
  servings: number;
  stepIndex: number;
  startedAt: number;
  checklist: Record<string, boolean>; // "prep" mise-en-place ticks by ingredient index
  completedSteps: number[];
}

interface StoreState {
  saved: string[];
  history: HistoryEntry[];
  notes: Record<string, string>;
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  mealPlan: MealPlan;
  equipmentOwned: string[];
  prefs: Prefs;
  recentSearches: string[];
  timers: ActiveTimer[];
  session: CookingSession | null;

  // saved / history / notes
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  logCooked: (id: string) => void;
  rate: (id: string, rating: number) => void;
  setNote: (id: string, note: string) => void;

  // pantry
  addPantry: (name: string) => void;
  setPantryStatus: (name: string, status: PantryItem['status']) => void;
  removePantry: (name: string) => void;

  // shopping
  addToShopping: (items: { name: string; qty?: string }[], fromRecipe?: string) => void;
  addRecipeToShopping: (recipeId: string, servings?: number) => void;
  toggleShopping: (name: string) => void;
  removeShopping: (name: string) => void;
  clearChecked: () => void;
  clearShopping: () => void;

  // meal plan
  setMeal: (day: string, slot: MealSlot, recipeId: string | null) => void;
  clearMealPlan: () => void;

  // equipment & prefs
  toggleEquipment: (id: string) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  toggleMode: () => void;
  addRecentSearch: (q: string) => void;

  // timers
  addTimer: (label: string, seconds: number) => string;
  pauseTimer: (id: string) => void;
  resumeTimer: (id: string) => void;
  bumpTimer: (id: string, seconds: number) => void;
  ackTimer: (id: string) => void;
  removeTimer: (id: string) => void;
  clearTimers: () => void;

  // cooking session
  startSession: (recipeId: string, servings: number) => void;
  setStep: (i: number) => void;
  toggleChecklist: (key: string) => void;
  completeStep: (i: number) => void;
  endSession: () => void;
}

const KEYS = {
  saved: 'saved', history: 'history', notes: 'notes', pantry: 'pantry', shopping: 'shopping',
  mealPlan: 'mealPlan', equipment: 'equipment', prefs: 'prefs', recent: 'recent', timers: 'timers', session: 'session',
};

const DEFAULT_PREFS: Prefs = { cuisines: [], diet: 'any', familySize: 4, mode: 'beginner', reduceMotion: false };

export const useStore = create<StoreState>((set, get) => ({
  saved: load(KEYS.saved, [] as string[]),
  history: load(KEYS.history, [] as HistoryEntry[]),
  notes: load(KEYS.notes, {} as Record<string, string>),
  pantry: load(KEYS.pantry, [] as PantryItem[]),
  shopping: load(KEYS.shopping, [] as ShoppingItem[]),
  mealPlan: load(KEYS.mealPlan, {} as MealPlan),
  equipmentOwned: load(KEYS.equipment, [] as string[]),
  prefs: { ...DEFAULT_PREFS, ...load(KEYS.prefs, {} as Partial<Prefs>) },
  recentSearches: load(KEYS.recent, [] as string[]),
  timers: load(KEYS.timers, [] as ActiveTimer[]),
  session: load(KEYS.session, null as CookingSession | null),

  toggleSave: (id) => set((s) => {
    const saved = s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [id, ...s.saved];
    save(KEYS.saved, saved);
    return { saved };
  }),
  isSaved: (id) => get().saved.includes(id),

  logCooked: (id) => set((s) => {
    const existing = s.history.find((h) => h.id === id);
    let history: HistoryEntry[];
    if (existing) {
      history = [{ ...existing, cookedAt: Date.now(), times: existing.times + 1 }, ...s.history.filter((h) => h.id !== id)];
    } else {
      history = [{ id, cookedAt: Date.now(), times: 1 }, ...s.history];
    }
    save(KEYS.history, history);
    return { history };
  }),
  rate: (id, rating) => set((s) => {
    const has = s.history.find((h) => h.id === id);
    const history = has
      ? s.history.map((h) => (h.id === id ? { ...h, rating } : h))
      : [{ id, cookedAt: Date.now(), rating, times: 1 }, ...s.history];
    save(KEYS.history, history);
    return { history };
  }),
  setNote: (id, note) => set((s) => {
    const notes = { ...s.notes, [id]: note };
    if (!note.trim()) delete notes[id];
    save(KEYS.notes, notes);
    // Mirror into history for "cook again" surfacing
    const history = s.history.map((h) => (h.id === id ? { ...h, note } : h));
    save(KEYS.history, history);
    return { notes, history };
  }),

  addPantry: (name) => set((s) => {
    const clean = name.trim();
    if (!clean || s.pantry.some((p) => normalizeName(p.name) === normalizeName(clean))) return s;
    const pantry = [{ name: clean, status: 'available' as const }, ...s.pantry];
    save(KEYS.pantry, pantry);
    return { pantry };
  }),
  setPantryStatus: (name, status) => set((s) => {
    const pantry = s.pantry.map((p) => (p.name === name ? { ...p, status } : p));
    save(KEYS.pantry, pantry);
    return { pantry };
  }),
  removePantry: (name) => set((s) => {
    const pantry = s.pantry.filter((p) => p.name !== name);
    save(KEYS.pantry, pantry);
    return { pantry };
  }),

  addToShopping: (items, fromRecipe) => set((s) => {
    const shopping = [...s.shopping];
    for (const it of items) {
      const key = normalizeName(it.name);
      const idx = shopping.findIndex((x) => normalizeName(x.name) === key);
      if (idx >= 0) {
        const ex = shopping[idx];
        shopping[idx] = {
          ...ex,
          qty: [ex.qty, it.qty].filter(Boolean).join(' + ') || undefined,
          fromRecipes: fromRecipe && !ex.fromRecipes.includes(fromRecipe) ? [...ex.fromRecipes, fromRecipe] : ex.fromRecipes,
        };
      } else {
        shopping.push({ name: it.name, qty: it.qty, aisle: aisleFor(it.name), checked: false, fromRecipes: fromRecipe ? [fromRecipe] : [] });
      }
    }
    save(KEYS.shopping, shopping);
    return { shopping };
  }),
  addRecipeToShopping: (recipeId, servings) => {
    const r = recipeById(recipeId);
    if (!r) return;
    const scaled = scaleIngredients(r.ingredients, r.baseServings, servings ?? r.baseServings);
    get().addToShopping(
      scaled.map((i) => ({ name: i.item, qty: [i.displayQty, i.unit].filter(Boolean).join(' ').trim() || undefined })),
      r.name
    );
  },
  toggleShopping: (name) => set((s) => {
    const shopping = s.shopping.map((x) => (x.name === name ? { ...x, checked: !x.checked } : x));
    save(KEYS.shopping, shopping);
    return { shopping };
  }),
  removeShopping: (name) => set((s) => {
    const shopping = s.shopping.filter((x) => x.name !== name);
    save(KEYS.shopping, shopping);
    return { shopping };
  }),
  clearChecked: () => set((s) => {
    const shopping = s.shopping.filter((x) => !x.checked);
    save(KEYS.shopping, shopping);
    return { shopping };
  }),
  clearShopping: () => { save(KEYS.shopping, []); set({ shopping: [] }); },

  setMeal: (day, slot, recipeId) => set((s) => {
    const dayPlan = { ...(s.mealPlan[day] ?? {}) };
    if (recipeId) dayPlan[slot] = recipeId; else delete dayPlan[slot];
    const mealPlan = { ...s.mealPlan, [day]: dayPlan };
    save(KEYS.mealPlan, mealPlan);
    return { mealPlan };
  }),
  clearMealPlan: () => { save(KEYS.mealPlan, {}); set({ mealPlan: {} }); },

  toggleEquipment: (id) => set((s) => {
    const equipmentOwned = s.equipmentOwned.includes(id) ? s.equipmentOwned.filter((x) => x !== id) : [...s.equipmentOwned, id];
    save(KEYS.equipment, equipmentOwned);
    return { equipmentOwned };
  }),
  setPrefs: (p) => set((s) => {
    const prefs = { ...s.prefs, ...p };
    save(KEYS.prefs, prefs);
    return { prefs };
  }),
  toggleMode: () => set((s) => {
    const prefs = { ...s.prefs, mode: (s.prefs.mode === 'beginner' ? 'chef' : 'beginner') as CookingMode };
    save(KEYS.prefs, prefs);
    return { prefs };
  }),
  addRecentSearch: (q) => set((s) => {
    const clean = q.trim();
    if (!clean) return s;
    const recentSearches = [clean, ...s.recentSearches.filter((x) => x.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    save(KEYS.recent, recentSearches);
    return { recentSearches };
  }),

  addTimer: (label, seconds) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => {
      const timers = [...s.timers, { id, label, durationSec: seconds, endAt: Date.now() + seconds * 1000, remainingSec: seconds, running: true, doneAcked: false }];
      save(KEYS.timers, timers);
      return { timers };
    });
    return id;
  },
  pauseTimer: (id) => set((s) => {
    const timers = s.timers.map((t) => (t.id === id && t.running ? { ...t, running: false, remainingSec: timerRemaining(t), endAt: null } : t));
    save(KEYS.timers, timers);
    return { timers };
  }),
  resumeTimer: (id) => set((s) => {
    const timers = s.timers.map((t) => (t.id === id && !t.running ? { ...t, running: true, endAt: Date.now() + t.remainingSec * 1000 } : t));
    save(KEYS.timers, timers);
    return { timers };
  }),
  bumpTimer: (id, seconds) => set((s) => {
    const timers = s.timers.map((t) => {
      if (t.id !== id) return t;
      const rem = timerRemaining(t) + seconds;
      return t.running ? { ...t, endAt: Date.now() + rem * 1000, doneAcked: false } : { ...t, remainingSec: rem, doneAcked: false };
    });
    save(KEYS.timers, timers);
    return { timers };
  }),
  ackTimer: (id) => set((s) => {
    const timers = s.timers.map((t) => (t.id === id ? { ...t, doneAcked: true } : t));
    save(KEYS.timers, timers);
    return { timers };
  }),
  removeTimer: (id) => set((s) => {
    const timers = s.timers.filter((t) => t.id !== id);
    save(KEYS.timers, timers);
    return { timers };
  }),
  clearTimers: () => { save(KEYS.timers, []); set({ timers: [] }); },

  startSession: (recipeId, servings) => {
    const session: CookingSession = { recipeId, servings, stepIndex: -1, startedAt: Date.now(), checklist: {}, completedSteps: [] };
    save(KEYS.session, session);
    set({ session });
  },
  setStep: (i) => set((s) => {
    if (!s.session) return s;
    const session = { ...s.session, stepIndex: i };
    save(KEYS.session, session);
    return { session };
  }),
  toggleChecklist: (key) => set((s) => {
    if (!s.session) return s;
    const checklist = { ...s.session.checklist, [key]: !s.session.checklist[key] };
    const session = { ...s.session, checklist };
    save(KEYS.session, session);
    return { session };
  }),
  completeStep: (i) => set((s) => {
    if (!s.session) return s;
    const completedSteps = s.session.completedSteps.includes(i) ? s.session.completedSteps : [...s.session.completedSteps, i];
    const session = { ...s.session, completedSteps };
    save(KEYS.session, session);
    return { session };
  }),
  endSession: () => { save(KEYS.session, null); set({ session: null }); },
}));
