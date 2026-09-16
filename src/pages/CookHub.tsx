import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { recipeById, quickRecipes } from '../data/recipes';
import { RecipeCard, Scroller } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

const TOOLS = [
  { to: '/what-can-i-cook', icon: '🧺', label: 'What can I cook?', desc: 'Match your ingredients' },
  { to: '/leftovers', icon: '♻️', label: 'Use my leftovers', desc: 'Second-life ideas' },
  { to: '/fix', icon: '🛟', label: 'Fix my dish', desc: 'Rescue a dish' },
  { to: '/chef', icon: '👩‍🍳', label: 'RAMYA AI Chef', desc: 'Ask anything' },
  { to: '/meal-planner', icon: '🗓', label: 'Menu builder', desc: 'Plan the week' },
  { to: '/techniques', icon: '📖', label: 'Techniques', desc: 'Learn the craft' },
];

export default function CookHub() {
  useSeo('Cook', 'Your cooking hub — resume a session, find what to cook, and open every cooking tool.');
  const session = useStore((s) => s.session);
  const cont = session ? recipeById(session.recipeId) : undefined;

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Cook</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 14px' }}>Let's cook something</h1>

      {cont && session && (
        <div className="card" style={{ display: 'flex', overflow: 'hidden', marginBottom: 18, borderColor: 'var(--green)' }}>
          <div style={{ width: 110, flexShrink: 0 }}><FoodArt art={cont.art} seed={cont.id} /></div>
          <div className="card-pad" style={{ flex: 1 }}>
            <span className="eyebrow" style={{ color: 'var(--green)' }}>In progress</span>
            <h3 style={{ fontSize: '1.15rem', margin: '2px 0 4px' }}>{cont.name}</h3>
            <p className="muted" style={{ fontSize: '0.82rem' }}>{session.stepIndex < 0 ? 'Getting ready' : `Step ${session.stepIndex + 1} of ${cont.steps.length}`}</p>
            <div className="row gap8" style={{ marginTop: 8 }}>
              <Link to={`/guided/${cont.slug}`} className="btn btn-green">Resume cooking →</Link>
              <button className="btn btn-ghost" onClick={() => useStore.getState().endSession()}>End</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-auto" style={{ marginBottom: 8 }}>
        {TOOLS.map((t) => (
          <Link key={t.to} to={t.to} className="card card-pad" style={{ display: 'grid', gap: 4, minHeight: 108 }}>
            <span style={{ fontSize: '1.6rem' }} aria-hidden="true">{t.icon}</span>
            <strong style={{ fontFamily: 'var(--font-display)' }}>{t.label}</strong>
            <span className="muted" style={{ fontSize: '0.8rem' }}>{t.desc}</span>
          </Link>
        ))}
      </div>

      <section className="section"><SectionHead title="Quick to start" action="More" onAction={() => (window.location.href = '/discover')} /><Scroller>{quickRecipes(25, 10).map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>
      <div style={{ height: 20 }} />
    </div>
  );
}
