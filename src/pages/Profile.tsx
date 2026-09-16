import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { forYou } from '../lib/recommend';
import { RecipeCard, Scroller } from '../components/cards';
import { SectionHead, useToast } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

const CUISINES = ['Tamil', 'Kerala', 'Karnataka', 'Andhra', 'Chettinad', 'Hyderabadi', 'Punjabi', 'Bengali', 'Maharashtrian', 'Gujarati', 'Goan'];
const DIETS = [
  { key: 'any', label: 'No preference' }, { key: 'veg', label: 'Vegetarian' }, { key: 'vegan', label: 'Vegan' }, { key: 'egg', label: 'Eggetarian' }, { key: 'nonveg', label: 'Non-vegetarian' },
] as const;

export default function Profile() {
  useSeo('Profile', 'Set your cooking preferences — cuisines, diet, family size and skill mode.');
  const toast = useToast();
  const prefs = useStore((s) => s.prefs);
  const history = useStore((s) => s.history);
  const saved = useStore((s) => s.saved);
  const setPrefs = useStore((s) => s.setPrefs);

  const toggleCuisine = (c: string) => setPrefs({ cuisines: prefs.cuisines.includes(c) ? prefs.cuisines.filter((x) => x !== c) : [...prefs.cuisines, c] });
  const madeForYou = forYou({ cuisines: prefs.cuisines, diet: prefs.diet, maxTime: prefs.maxTime }, history.map((h) => h.id), saved, 10);

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 780 }}>
      <span className="eyebrow">Personalize</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>Made for you</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Set your tastes — no account needed, everything stays on this device.</p>

      <div className="card card-pad">
        <div className="eyebrow" style={{ marginBottom: 8 }}>Favourite cuisines</div>
        <div className="row wrap gap6">{CUISINES.map((c) => <button key={c} className={`chip ${prefs.cuisines.includes(c) ? 'active' : ''}`} onClick={() => toggleCuisine(c)}>{c}</button>)}</div>

        <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Diet</div>
        <div className="row wrap gap6">{DIETS.map((d) => <button key={d.key} className={`chip ${prefs.diet === d.key ? 'active' : ''}`} onClick={() => setPrefs({ diet: d.key })}>{d.label}</button>)}</div>

        <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Family size</div>
        <div className="row wrap gap6">{[1, 2, 4, 6, 10].map((n) => <button key={n} className={`chip ${prefs.familySize === n ? 'active' : ''}`} onClick={() => setPrefs({ familySize: n })}>{n}</button>)}</div>

        <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Cooking skill</div>
        <div className="row wrap gap6">
          <button className={`chip ${prefs.mode === 'beginner' ? 'active' : ''}`} onClick={() => setPrefs({ mode: 'beginner' })}>🐣 Beginner — explain everything</button>
          <button className={`chip ${prefs.mode === 'chef' ? 'active' : ''}`} onClick={() => setPrefs({ mode: 'chef' })}>👩‍🍳 Chef — condensed steps</button>
        </div>

        <div className="eyebrow" style={{ margin: '16px 0 8px' }}>Max cooking time</div>
        <div className="row wrap gap6">
          {[15, 30, 45, 0].map((t) => <button key={t} className={`chip ${(prefs.maxTime ?? 0) === t ? 'active' : ''}`} onClick={() => setPrefs({ maxTime: t || undefined })}>{t ? `≤ ${t} min` : 'Any'}</button>)}
        </div>

        <label className="row between" style={{ marginTop: 16, cursor: 'pointer' }}>
          <span>Reduce motion</span>
          <input type="checkbox" checked={prefs.reduceMotion} onChange={(e) => { setPrefs({ reduceMotion: e.target.checked }); toast('Preference saved'); }} />
        </label>
      </div>

      {/* Beginner mode explainer */}
      {prefs.mode === 'beginner' && (
        <section className="section"><div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
          <SectionHead title="I'm new to cooking" />
          <div style={{ display: 'grid', gap: 10 }}>
            {[['What is a kadai?', 'A deep, round Indian wok for frying and sautéing — it concentrates heat at the base.'],
              ['What is medium flame?', 'Roughly half power on a gas stove — the flame reaches the base but not up the sides of the pan.'],
              ['What is tempering (tadka)?', 'Blooming whole spices in hot oil to release aroma, then adding them to (or starting) a dish.'],
              ['What does “golden brown” mean?', 'Cooked until an even light-brown colour with a toasted aroma — not pale, not dark/bitter.'],
              ['What does “simmer” mean?', 'A gentle bubble just below a boil — small lazy bubbles, not a rolling boil.']].map(([q, a]) => (
              <details key={q} className="card card-pad" style={{ padding: 12 }}><summary style={{ fontWeight: 600, cursor: 'pointer' }}>{q}</summary><p className="muted" style={{ marginTop: 6 }}>{a}</p></details>
            ))}
          </div>
        </div></section>
      )}

      {madeForYou.length > 0 && <section className="section"><SectionHead title="Recommended for you" /><Scroller>{madeForYou.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>}

      <div className="grid grid-2 gap12" style={{ marginTop: 8 }}>
        <Link to="/history" className="btn btn-ghost">🍳 Cooking history</Link>
        <Link to="/saved" className="btn btn-ghost">♥ Saved recipes</Link>
        <Link to="/kitchen" className="btn btn-ghost">🍴 My kitchen</Link>
        <Link to="/fix" className="btn btn-ghost">🛟 Fix my dish</Link>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
