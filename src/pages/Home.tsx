import { Link, useNavigate } from 'react-router-dom';
import { SearchBar } from '../components/SearchBar';
import { RecipeCard, Scroller } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { DishImage } from '../components/DishImage';
import { SectionHead } from '../components/ui';
import { Reveal } from '../components/Reveal';
import { CountUp, TypeCycle, Marquee } from '../components/anim';
import { RECIPES } from '../data/recipes';
import { useSeo } from '../hooks/useSeo';
import { useStore } from '../store/useStore';
import { popularIn, quickRecipes, recipesByIds, recipeById, allFamilies } from '../data/recipes';
import { REGIONS, FESTIVALS } from '../data/regions';
import { TECHNIQUES } from '../data/techniques';
import { becauseYouCooked, forYou, seasonalPicks } from '../lib/recommend';
import { POPULAR_SEARCHES } from '../lib/search';
import type { Recipe } from '../data/types';

function Row({ title, action, to, recipes }: { title: string; action?: string; to?: string; recipes: Recipe[] }) {
  const nav = useNavigate();
  if (!recipes.length) return null;
  return (
    <section className="section">
      <div className="container"><SectionHead title={title} action={action} onAction={to ? () => nav(to) : undefined} /></div>
      <Scroller>{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
    </section>
  );
}

export default function Home() {
  useSeo('RAMYA-COOK', 'India-first guided cooking with a focus on South Indian cuisine — search a dish, choose your version, and cook it step by step with heat, timers, sensory cues and an AI chef.');
  const nav = useNavigate();
  const session = useStore((s) => s.session);
  const history = useStore((s) => s.history);
  const saved = useStore((s) => s.saved);
  const prefs = useStore((s) => s.prefs);

  const historyIds = history.map((h) => h.id);
  const cont = session ? recipeById(session.recipeId) : undefined;
  const because = becauseYouCooked(historyIds);
  const recommended = forYou({ cuisines: prefs.cuisines, diet: prefs.diet, maxTime: prefs.maxTime }, historyIds, saved);
  const season = seasonalPicks(10);
  const bigFamilies = allFamilies(4).slice(0, 6);
  const festival = FESTIVALS[1]; // Deepavali spotlight
  const recentlyCooked = recipesByIds(historyIds).slice(0, 10);

  return (
    <div className="fade-up">
      {/* Hero */}
      <section style={{ position: 'relative', background: 'linear-gradient(180deg, #fbf7f0 0%, var(--ivory) 100%)', paddingTop: 30, paddingBottom: 30, overflow: 'hidden' }}>
        <div className="hero-blobs" aria-hidden="true"><span /><span /><span /></div>
        <div className="container center" style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <span className="eyebrow">Amma's wisdom · Chef guidance · Modern tech</span>
          <h1 style={{ fontSize: 'clamp(2rem, 6vw, 3.2rem)', margin: '10px 0 6px', lineHeight: 1.05 }}>What are you <span className="gradient-text">cooking</span> today?</h1>
          <p className="muted" style={{ fontSize: '1.05rem', marginBottom: 16 }}>Tonight, maybe&nbsp;<TypeCycle words={['Masala Dosa', 'Ven Pongal', 'Chicken Biryani', 'Sambar', 'Kothu Parotta', 'Maggi']} /></p>
          <SearchBar variant="hero" />
          <div className="row wrap gap8" style={{ justifyContent: 'center', marginTop: 16 }}>
            {POPULAR_SEARCHES.slice(0, 6).map((p) => (
              <button key={p} className="chip" onClick={() => nav(`/search?q=${encodeURIComponent(p)}`)}>{p}</button>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'center', gap: 28, marginTop: 22, fontFamily: 'var(--font-display)' }}>
            <span><strong style={{ fontSize: '1.5rem' }}><CountUp to={RECIPES.length} suffix="+" /></strong><span className="muted" style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Recipes</span></span>
            <span><strong style={{ fontSize: '1.5rem' }}><CountUp to={25} suffix="+" /></strong><span className="muted" style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Maggi ways</span></span>
            <span><strong style={{ fontSize: '1.5rem' }}><CountUp to={7} /></strong><span className="muted" style={{ display: 'block', fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>Regions</span></span>
          </div>
          <div style={{ marginTop: 18 }}>
            <Marquee>{['Idli', 'Dosa', 'Sambar', 'Rasam', 'Biryani', 'Pongal', 'Chutney', 'Payasam', 'Vada', 'Parotta', 'Filter Coffee', 'Avial'].map((t) => <span key={t} className="pill" style={{ background: 'var(--surface)' }}>{t}</span>)}</Marquee>
          </div>
        </div>
      </section>

      {/* Continue cooking */}
      {cont && session && (
        <section className="section"><div className="container">
          <div className="card" style={{ display: 'flex', overflow: 'hidden', alignItems: 'stretch' }}>
            <div style={{ width: 120, flexShrink: 0 }}><DishImage id={cont.id} art={cont.art} seed={cont.id} alt={cont.name} name={cont.name} /></div>
            <div className="card-pad" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
              <span className="eyebrow" style={{ color: 'var(--green)' }}>Continue cooking</span>
              <h3 style={{ fontSize: '1.2rem' }}>{cont.name}</h3>
              <p className="muted" style={{ fontSize: '0.85rem' }}>{session.stepIndex < 0 ? 'Getting ready…' : `Step ${session.stepIndex + 1} of ${cont.steps.length}`}</p>
              <Link to={`/guided/${cont.slug}`} className="btn btn-green" style={{ alignSelf: 'flex-start', marginTop: 4 }}>Resume →</Link>
            </div>
          </div>
        </div></section>
      )}

      {because && (
        <Row title={`Because you cooked ${because.seed.name}`} recipes={because.recipes} />
      )}

      <Row title="Popular in South India" action="See all" to="/regions" recipes={popularIn('South India', 10)} />

      {/* 50 ways to make... family spotlights */}
      <section className="section"><div className="container">
        <SectionHead title="50 ways to make…" action="Browse dishes" onAction={() => nav('/discover')} />
        <Reveal as="div" className="grid grid-auto-lg" stagger>
          {bigFamilies.map((f) => (
            <Link key={f.dishType} to={`/dishes/${f.dishType.toLowerCase().replace(/\s+/g, '-')}`} className="recipe-card">
              <div className="thumb" style={{ aspectRatio: '16 / 9' }}><FoodArt art={f.members[0].art} seed={f.dishType} /></div>
              <div className="rc-body">
                <div className="rc-title">{f.count}+ ways to make {f.dishType}</div>
                <div className="muted" style={{ fontSize: '0.82rem' }}>{f.members.slice(0, 3).map((m) => m.name).join(' · ')}…</div>
              </div>
            </Link>
          ))}
        </Reveal>
      </div></section>

      <Row title="Quick Indian meals" action="More" to="/discover" recipes={quickRecipes(25, 10)} />

      {/* Cook with what you have CTA */}
      <section className="section"><div className="container">
        <div className="grid grid-2" style={{ gap: 14 }}>
          <Link to="/what-can-i-cook" className="card card-pad spotlight tilt" style={{ background: 'linear-gradient(135deg,#eef4ec,#e2efe0)', display: 'grid', gap: 6 }}>
            <span style={{ fontSize: '1.8rem' }} aria-hidden="true">🧺</span>
            <h3 style={{ fontSize: '1.15rem' }}>Cook with what you have</h3>
            <p className="muted" style={{ fontSize: '0.86rem' }}>Tell us your ingredients and we'll find matching recipes.</p>
          </Link>
          <Link to="/chef" className="card card-pad spotlight tilt" style={{ background: 'linear-gradient(135deg,#f7ebe3,#f5ddcf)', display: 'grid', gap: 6 }}>
            <span style={{ fontSize: '1.8rem' }} aria-hidden="true">👩‍🍳</span>
            <h3 style={{ fontSize: '1.15rem' }}>Ask RAMYA AI Chef</h3>
            <p className="muted" style={{ fontSize: '0.86rem' }}>Substitutions, fixes and cooking help — right in your kitchen.</p>
          </Link>
        </div>
      </div></section>

      {/* Festival specials */}
      <section className="section"><div className="container">
        <SectionHead title="Festival specials" action="All festivals" onAction={() => nav('/collections')} />
        <div className="card" style={{ display: 'flex', overflow: 'hidden' }}>
          <div style={{ width: 130, flexShrink: 0 }}><DishImage id={festival.id} art={festival.art} seed={festival.id} alt={festival.name} name={festival.name} /></div>
          <div className="card-pad" style={{ flex: 1 }}>
            <span className="eyebrow">{festival.when}</span>
            <h3 style={{ fontSize: '1.2rem', margin: '4px 0' }}>{festival.name}</h3>
            <p className="muted" style={{ fontSize: '0.86rem', marginBottom: 10 }}>{festival.blurb}</p>
            <Link to={`/festivals/${festival.id}`} className="btn btn-ghost">Explore the menu →</Link>
          </div>
        </div>
      </div></section>

      {/* Learn a technique */}
      <section className="section"><div className="container">
        <SectionHead title="Learn a technique" action="All techniques" onAction={() => nav('/techniques')} />
        <div className="grid grid-auto">
          {TECHNIQUES.slice(0, 6).map((t) => (
            <Link key={t.id} to={`/techniques/${t.slug}`} className="recipe-card">
              <div className="thumb" style={{ aspectRatio: '16 / 10' }}><FoodArt art={t.art} seed={t.id} /></div>
              <div className="rc-body"><div className="rc-title" style={{ fontSize: '0.98rem' }}>{t.name}</div><div className="muted" style={{ fontSize: '0.78rem' }}>{t.local}</div></div>
            </Link>
          ))}
        </div>
      </div></section>

      <Row title="Made for you" recipes={recommended} />
      <Row title={`Great for this ${season.season.toLowerCase()}`} recipes={season.recipes} />

      {recentlyCooked.length > 0 && <Row title="Recently cooked" action="History" to="/history" recipes={recentlyCooked} />}

      {/* Regions strip */}
      <section className="section"><div className="container">
        <SectionHead title="Explore by region" action="All regions" onAction={() => nav('/regions')} />
        <div className="grid grid-auto-lg">
          {REGIONS.map((r) => (
            <Link key={r.id} to={`/regions/${r.id}`} className="recipe-card">
              <div className="thumb" style={{ aspectRatio: '16 / 9' }}><FoodArt art={r.art} seed={r.id} /></div>
              <div className="rc-body"><div className="rc-region">{r.region}</div><div className="rc-title" style={{ fontSize: '1rem' }}>{r.name}</div></div>
            </Link>
          ))}
        </div>
      </div></section>

      <footer className="container center" style={{ padding: '30px 16px 40px', color: 'var(--ink-3)', fontSize: '0.82rem' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: 6 }}>RAMYA-COOK</p>
        <p>Your kitchen, guided. · From Amma's kitchen to your screen.</p>
        <p style={{ marginTop: 8 }}>Search anything. Learn anything. Cook anything.</p>
      </footer>
    </div>
  );
}
