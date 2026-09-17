import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, type MealSlot } from '../store/useStore';
import { RECIPES, recipeById, byRegion } from '../data/recipes';
import { DAYS, MEAL_SLOTS } from '../lib/constants';
import { Modal, SectionHead, useToast } from '../components/ui';
import { FoodArt } from '../components/FoodArt';
import { useSeo } from '../hooks/useSeo';

// Deterministic menu generation from the South Indian corpus.
const south = byRegion('South India');
const pool = (cats: string[], seed: number, n = 1) => {
  const list = south.filter((r) => cats.includes(r.category)).sort((a, b) => b.popularity - a.popularity);
  const out: string[] = [];
  for (let k = 0; k < n && list.length; k++) out.push(list[(seed * 7 + k * 3) % list.length].id);
  return out;
};

function generateDay(seed: number): Record<MealSlot, string> {
  return {
    Breakfast: pool(['Breakfast'], seed)[0],
    Lunch: pool(['Main'], seed + 1)[0],
    Dinner: pool(['Breakfast', 'Main'], seed + 2)[0],
  };
}

export default function MealPlanner() {
  useSeo('Meal planner', 'Plan your week and auto-generate a South Indian menu; then build a shopping list from the plan.');
  const toast = useToast();
  const mealPlan = useStore((s) => s.mealPlan);
  const familySize = useStore((s) => s.prefs.familySize);
  const { setMeal, clearMealPlan, addRecipeToShopping } = useStore.getState();
  const [picker, setPicker] = useState<{ day: string; slot: MealSlot } | null>(null);
  const [menu, setMenu] = useState<{ Breakfast: string[]; Lunch: string[]; Dinner: string[] } | null>(null);

  const generateWeek = () => { DAYS.forEach((day, i) => { const d = generateDay(i); (Object.keys(d) as MealSlot[]).forEach((slot) => setMeal(day, slot, d[slot])); }); toast('Generated a South Indian week'); };

  const buildMenu = () => {
    setMenu({
      Breakfast: [...pool(['Breakfast'], 3, 1), ...pool(['Main'], 8, 1), ...pool(['Chutney'], 1, 1), ...RECIPES.filter((r) => r.id === 'filter-coffee').map((r) => r.id)],
      Lunch: [...RECIPES.filter((r) => r.id === 'curd-rice').map((r) => r.id), ...pool(['Main'], 2, 1), ...pool(['Side'], 5, 1), ...pool(['Main'], 9, 1)],
      Dinner: [...pool(['Breakfast'], 6, 1), ...pool(['Chutney'], 4, 1)],
    });
  };

  const addPlanToShopping = () => {
    let count = 0;
    for (const day of DAYS) for (const slot of MEAL_SLOTS) { const id = mealPlan[day]?.[slot]; if (id) { addRecipeToShopping(id, familySize); count++; } }
    toast(count ? `Added ${count} meals to shopping list` : 'Plan is empty');
  };

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Plan ahead</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>My week</h1>
      <p className="muted" style={{ marginBottom: 14 }}>Tap a slot to choose a recipe, or auto-generate a South Indian week.</p>

      <div className="row wrap gap8" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" onClick={generateWeek}>✨ Generate South Indian week</button>
        <button className="btn btn-ghost" onClick={addPlanToShopping}>🛒 Add week to shopping list</button>
        <button className="btn btn-ghost" onClick={() => { if (confirm('Clear the whole plan?')) { clearMealPlan(); toast('Plan cleared'); } }}>Clear</button>
      </div>

      <div style={{ overflowX: 'auto', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: `90px repeat(3, minmax(140px,1fr))`, gap: 8, minWidth: 560 }}>
          <div />
          {MEAL_SLOTS.map((s) => <div key={s} className="eyebrow center" style={{ padding: 6 }}>{s}</div>)}
          {DAYS.map((day) => (
            <FragmentRow key={day} day={day} onPick={(slot) => setPicker({ day, slot })} onClear={(slot) => setMeal(day, slot, null)} plan={mealPlan[day]} />
          ))}
        </div>
      </div>

      {/* South Indian menu builder */}
      <section className="section">
        <SectionHead title="South Indian menu builder" />
        <div className="card card-pad">
          <p className="muted" style={{ marginBottom: 12 }}>Generate a complete traditional day — breakfast, a full lunch and a light dinner.</p>
          <button className="btn btn-primary" onClick={buildMenu}>Build a full day's menu →</button>
          {menu && (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginTop: 16 }}>
              {(['Breakfast', 'Lunch', 'Dinner'] as const).map((slot) => (
                <div key={slot} className="card card-pad" style={{ background: 'var(--surface-2)' }}>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>{slot}</div>
                  <ul style={{ display: 'grid', gap: 8 }}>
                    {menu[slot].filter(Boolean).map((id) => { const r = recipeById(id); return r ? <li key={id}><Link to={`/recipes/${r.slug}`} className="row gap8"><span style={{ width: 30, height: 30, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}><FoodArt art={r.art} seed={r.id} /></span><span style={{ fontSize: '0.9rem' }}>{r.name}</span></Link></li> : null; })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Modal open={Boolean(picker)} onClose={() => setPicker(null)} title={picker ? `Choose for ${picker.day} ${picker.slot}` : ''} wide>
        <div className="grid grid-auto">
          {(picker ? RECIPES.filter((r) => picker.slot === 'Breakfast' ? ['Breakfast', 'Snack'].includes(r.category) : ['Main', 'Side', 'Street Food'].includes(r.category)).sort((a, b) => b.popularity - a.popularity).slice(0, 24) : []).map((r) => (
            <button key={r.id} className="recipe-card" style={{ textAlign: 'left' }} onClick={() => { if (picker) { setMeal(picker.day, picker.slot, r.id); toast(`Added ${r.name}`); setPicker(null); } }}>
              <div className="thumb" style={{ aspectRatio: '16 / 10' }}><FoodArt art={r.art} seed={r.id} /></div>
              <div className="rc-body"><div className="rc-title" style={{ fontSize: '0.9rem' }}>{r.name}</div></div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function FragmentRow({ day, plan, onPick, onClear }: { day: string; plan?: Partial<Record<MealSlot, string>>; onPick: (s: MealSlot) => void; onClear: (s: MealSlot) => void }) {
  return (
    <>
      <div className="row" style={{ fontWeight: 600, fontSize: '0.85rem', alignItems: 'center' }}>{day.slice(0, 3)}</div>
      {MEAL_SLOTS.map((slot) => {
        const r = plan?.[slot] ? recipeById(plan[slot]!) : undefined;
        return (
          <div key={slot} className="card" style={{ minHeight: 72, padding: 6, position: 'relative' }}>
            {r ? (
              <button onClick={() => onClear(slot)} style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', textAlign: 'left' }} title="Tap to remove">
                <span style={{ width: 30, height: 30, borderRadius: 7, overflow: 'hidden', flexShrink: 0 }}><FoodArt art={r.art} seed={r.id} /></span>
                <span style={{ fontSize: '0.76rem', lineHeight: 1.2 }}>{r.name}</span>
              </button>
            ) : (
              <button onClick={() => onPick(slot)} style={{ width: '100%', height: '100%', minHeight: 60, border: '1.5px dashed var(--line-2)', borderRadius: 10, background: 'transparent', cursor: 'pointer', color: 'var(--ink-3)', fontSize: '1.2rem' }} aria-label={`Add ${slot} for ${day}`}>+</button>
            )}
          </div>
        );
      })}
    </>
  );
}
