import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { recipeBySlug } from '../data/recipes';
import { scaleIngredients } from '../lib/scaling';
import { useStore } from '../store/useStore';
import { useSeo } from '../hooks/useSeo';
import { HeatControl, SensoryCues, StartTimerButton } from '../components/cooking';
import { ProgressBar, EmptyState, useToast } from '../components/ui';
import { RecipeCard, Scroller } from '../components/cards';
import { relatedTo, completeMeal } from '../lib/recommend';
import { formatClock } from '../hooks/useTick';

export default function GuidedCooking() {
  const { slug } = useParams();
  const nav = useNavigate();
  const recipe = slug ? recipeBySlug(slug) : undefined;
  const toast = useToast();

  const session = useStore((s) => s.session);
  const mode = useStore((s) => s.prefs.mode);
  const { startSession, setStep, endSession, toggleChecklist, completeStep, logCooked, rate, setNote, toggleMode } = useStore.getState();

  const [rating, setRating] = useState(0);
  const [note, setNoteLocal] = useState('');
  const touchStart = useRef<number | null>(null);

  useSeo(recipe ? `Cooking ${recipe.name}` : 'Guided cooking');

  // Ensure a session exists for this recipe.
  useEffect(() => {
    if (!recipe) return;
    if (!session || session.recipeId !== recipe.id) {
      startSession(recipe.id, session?.recipeId === recipe.id ? session.servings : recipe.baseServings);
    }
  }, [recipe, session, startSession]);

  if (!recipe) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🍳" title="Recipe not found" action="Back home" onAction={() => nav('/')} /></div>;
  if (!session || session.recipeId !== recipe.id) return <div className="container" style={{ paddingTop: 40 }}><p className="muted">Preparing your kitchen…</p></div>;

  const servings = session.servings;
  const scaled = scaleIngredients(recipe.ingredients, recipe.baseServings, servings);
  const steps = recipe.steps;
  const i = session.stepIndex;
  const atPrep = i < 0;
  const atFinish = i >= steps.length;

  const go = (n: number) => setStep(Math.max(-1, Math.min(steps.length, n)));
  const next = () => { if (i >= 0 && i < steps.length) completeStep(i); go(i + 1); };
  const prev = () => go(i - 1);

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 60) { if (dx < 0) next(); else prev(); }
    touchStart.current = null;
  };

  const exit = () => { nav(`/recipes/${recipe.slug}`); };

  // ---------- Top bar ----------
  const TopBar = (
    <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, height: 54 }}>
        <button onClick={exit} className="btn btn-ghost" style={{ padding: '6px 12px' }} aria-label="Exit cooking">✕</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{recipe.name}</div>
          <div className="muted" style={{ fontSize: '0.75rem' }}>{atPrep ? 'Get ready' : atFinish ? 'Finish' : `Step ${i + 1} of ${steps.length}`}</div>
        </div>
        <button className="chip" onClick={toggleMode}>{mode === 'beginner' ? '👩‍🍳 Chef mode' : '🐣 Beginner mode'}</button>
      </div>
      <div className="container" style={{ paddingBottom: 8 }}><ProgressBar value={atFinish ? steps.length : i + 1} max={steps.length + 1} /></div>
    </div>
  );

  // ---------- Mise en place ----------
  if (atPrep) {
    const allChecked = scaled.every((_, idx) => session.checklist[`ing-${idx}`]);
    return (
      <div className="fade-up">{TopBar}
        <div className="container" style={{ paddingTop: 18, maxWidth: 680 }}>
          <span className="eyebrow">Get ready · Mise en place</span>
          <h1 style={{ fontSize: '1.8rem', margin: '6px 0 4px' }}>Prepare everything first</h1>
          <p className="muted" style={{ marginBottom: 16 }}>Measuring and prepping before you start makes cooking calm and fast — especially for {recipe.dishType.toLowerCase()}.</p>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Ingredients to prepare ({servings} servings)</div>
            <ul style={{ display: 'grid', gap: 2 }}>
              {scaled.map((ing, idx) => {
                const key = `ing-${idx}`;
                const done = Boolean(session.checklist[key]);
                return (
                  <li key={key}>
                    <button onClick={() => toggleChecklist(key)} style={{ width: '100%', display: 'flex', gap: 10, alignItems: 'center', padding: '10px 4px', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? 'var(--green)' : 'var(--line-2)'}`, background: done ? 'var(--green)' : 'transparent', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '0.8rem' }}>{done ? '✓' : ''}</span>
                      <span style={{ flex: 1, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--ink-3)' : 'var(--ink)' }}>{ing.item}{ing.note ? <span className="muted"> · {ing.note}</span> : null}</span>
                      <strong style={{ whiteSpace: 'nowrap' }}>{ing.displayQty} {ing.unit}{ing.qty == null ? 'to taste' : ''}</strong>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {recipe.equipment.length > 0 && (
            <div className="card card-pad mt16">
              <div className="eyebrow" style={{ marginBottom: 8 }}>Equipment to collect</div>
              <div className="row wrap gap8">{recipe.equipment.map((e) => <span key={e} className="pill">{e.replace(/-/g, ' ')}</span>)}</div>
            </div>
          )}

          <div className="row gap8 mt24" style={{ position: 'sticky', bottom: 'calc(var(--nav-h) + 12px)' }}>
            <button className="btn btn-primary btn-lg btn-block" onClick={() => go(0)}>{allChecked ? 'Ready to Cook →' : 'Start cooking anyway →'}</button>
          </div>
          <div style={{ height: 30 }} />
        </div>
      </div>
    );
  }

  // ---------- Finish / plate / rate ----------
  if (atFinish) {
    const meal = completeMeal(recipe);
    const related = relatedTo(recipe, 6);
    const finish = () => {
      logCooked(recipe.id);
      if (rating) rate(recipe.id, rating);
      if (note.trim()) setNote(recipe.id, note.trim());
      endSession();
      toast('Nicely done! Saved to your history.');
      nav('/');
    };
    return (
      <div className="fade-up">{TopBar}
        <div className="container" style={{ paddingTop: 18, maxWidth: 680 }}>
          <div className="center" style={{ padding: '10px 0 4px' }}>
            <div style={{ fontSize: '3rem' }} aria-hidden="true">🎉</div>
            <h1 style={{ fontSize: '1.9rem', margin: '6px 0' }}>Your {recipe.name} is ready!</h1>
          </div>

          <div className="card card-pad">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Plate the dish</div>
            <ul style={{ display: 'grid', gap: 6, fontSize: '0.92rem' }}>
              <li className="row gap8"><span aria-hidden="true">🍽</span>Serve hot on a warm plate or banana leaf for the best experience.</li>
              <li className="row gap8"><span aria-hidden="true">🌿</span>Garnish with fresh coriander or curry leaves for colour and aroma.</li>
              {meal && meal.recipes.length > 1 && <li className="row gap8"><span aria-hidden="true">🥣</span>Pair with {meal.recipes.filter((r) => r.id !== recipe.id).slice(0, 3).map((r) => r.name).join(', ')}.</li>}
            </ul>
          </div>

          <div className="card card-pad mt16">
            <div className="eyebrow" style={{ marginBottom: 8 }}>Rate this recipe</div>
            <div className="row gap6" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} aria-checked={rating === n} role="radio" style={{ fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer', color: n <= rating ? 'var(--gold)' : 'var(--line-2)' }}>★</button>
              ))}
            </div>
            <div className="eyebrow" style={{ margin: '14px 0 6px' }}>Personal note (shown next time)</div>
            <textarea className="input" placeholder="e.g. Used less chilli. Next time add more coconut." value={note} onChange={(e) => setNoteLocal(e.target.value)} />
          </div>

          <button className="btn btn-primary btn-lg btn-block mt16" onClick={finish}>Save & finish</button>

          {meal && meal.recipes.length > 1 && (<section className="section"><h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Complete your meal</h2><Scroller>{meal.recipes.filter((r) => r.id !== recipe.id).map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>)}
          {related.length > 0 && (<section className="section"><h2 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Cook next</h2><Scroller>{related.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>)}
          <div style={{ height: 30 }} />
        </div>
      </div>
    );
  }

  // ---------- Step ----------
  const step = steps[i];
  const chef = mode === 'chef';
  return (
    <div className="fade-up">{TopBar}
      <div className="container" style={{ paddingTop: 20, maxWidth: 680 }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <span className="eyebrow">Step {step.n} of {steps.length}</span>
        <h1 style={{ fontSize: 'clamp(1.5rem,5vw,2rem)', margin: '6px 0 10px' }}>{step.title}</h1>
        <p style={{ fontSize: chef ? '1rem' : '1.15rem', lineHeight: 1.6, color: 'var(--ink)' }}>{step.body}</p>

        {/* Heat + timer */}
        <div className="grid" style={{ gap: 12, marginTop: 16 }}>
          {step.heat && step.heat !== 'Off' && <HeatControl level={step.heat} tempC={step.tempC} method={step.method} />}
          {step.timer && (
            <div className="card card-pad" style={{ display: 'grid', gap: 10 }}>
              <div className="row between"><span className="eyebrow">Timer · {step.timer.label}</span><span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1.3rem', fontWeight: 700 }}>{formatClock(step.timer.seconds)}</span></div>
              <StartTimerButton label={step.timer.label} seconds={step.timer.seconds} />
            </div>
          )}
        </div>

        {/* Sensory cues (beginner + always useful) */}
        {!chef && <div style={{ marginTop: 12 }}><SensoryCues step={step} /></div>}

        {/* Why this step */}
        {step.why && !chef && (
          <details className="card card-pad" style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Why this step?</summary>
            <p className="muted" style={{ marginTop: 8, lineHeight: 1.55 }}>{step.why}</p>
          </details>
        )}

        {/* Parallel tasks */}
        {step.parallel && step.parallel.length > 0 && (
          <div className="card card-pad" style={{ marginTop: 12, background: 'var(--green-soft)', borderColor: '#cfe6da' }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>While this cooks</div>
            <ul style={{ display: 'grid', gap: 6 }}>{step.parallel.map((p) => <li key={p} className="row gap8"><span aria-hidden="true">→</span>{p}</li>)}</ul>
          </div>
        )}

        <p className="muted center" style={{ fontSize: '0.75rem', marginTop: 16 }}>Swipe ← for next · → for previous</p>
      </div>

      {/* Sticky controls */}
      <div style={{ position: 'sticky', bottom: 0, background: 'var(--surface)', borderTop: '1px solid var(--line)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="container row gap8" style={{ padding: '12px 16px' }}>
          <button className="btn btn-ghost" onClick={prev} style={{ minWidth: 96, minHeight: 48 }}>← Previous</button>
          <Link to="/chef" className="btn btn-ghost" style={{ minHeight: 48 }} aria-label="Ask the AI chef">🤖</Link>
          <button className="btn btn-primary" onClick={next} style={{ flex: 1, minHeight: 48 }}>{i === steps.length - 1 ? 'Finish →' : 'Next step →'}</button>
        </div>
      </div>
    </div>
  );
}
