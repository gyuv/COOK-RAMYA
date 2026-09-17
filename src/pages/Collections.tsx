import { useParams, useNavigate, Link } from 'react-router-dom';
import { FESTIVALS } from '../data/regions';
import { recipesByIds, quickRecipes, bySeason } from '../data/recipes';
import { seasonNow } from '../lib/recommend';
import { RecipeCard, Scroller } from '../components/cards';
import { DishImage } from '../components/DishImage';
import { EmptyState, SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export function Collections() {
  useSeo('Collections', 'Festival menus, seasonal picks, quick meals and menu builders — curated collections from RAMYA-COOK.');
  const nav = useNavigate();
  const season = seasonNow();
  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Collections</span>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.6rem)', margin: '6px 0 18px' }}>Menus & moments</h1>

      {/* Tools */}
      <div className="grid grid-2" style={{ gap: 12, marginBottom: 8 }}>
        <Link to="/meal-planner" className="card card-pad" style={{ background: 'linear-gradient(135deg,#f7ece0,#f1e0cd)', display: 'grid', gap: 4 }}>
          <span style={{ fontSize: '1.6rem' }} aria-hidden="true">🗓</span><h3 style={{ fontSize: '1.1rem' }}>South Indian menu builder</h3><span className="muted" style={{ fontSize: '0.84rem' }}>Auto-generate a full day's menu.</span>
        </Link>
        <Link to="/what-can-i-cook" className="card card-pad" style={{ background: 'linear-gradient(135deg,#eef4ec,#e2efe0)', display: 'grid', gap: 4 }}>
          <span style={{ fontSize: '1.6rem' }} aria-hidden="true">🧺</span><h3 style={{ fontSize: '1.1rem' }}>Cook with what you have</h3><span className="muted" style={{ fontSize: '0.84rem' }}>Match recipes to your ingredients.</span>
        </Link>
      </div>

      <SectionHead title="Festival specials" />
      <div className="grid grid-auto-lg" style={{ marginBottom: 8 }}>
        {FESTIVALS.map((f) => (
          <Link key={f.id} to={`/festivals/${f.id}`} className="recipe-card">
            <div className="thumb" style={{ aspectRatio: '16 / 9' }}><DishImage id={f.id} art={f.art} seed={f.id} alt={f.name} name={f.name} /></div>
            <div className="rc-body"><div className="rc-region">{f.when}</div><div className="rc-title" style={{ fontSize: '1rem' }}>{f.name}</div><div className="muted" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{f.blurb}</div></div>
          </Link>
        ))}
      </div>

      <section className="section"><SectionHead title={`Great for this ${season.toLowerCase()}`} action="Seasonal" /><Scroller>{bySeason(season).slice(0, 10).map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>
      <section className="section"><SectionHead title="Quick tonight (under 25 min)" /><Scroller>{quickRecipes(25, 10).map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>

      <button className="btn btn-ghost btn-block" onClick={() => nav('/techniques')}>Learn a technique →</button>
      <div style={{ height: 20 }} />
    </div>
  );
}

export function FestivalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const festival = FESTIVALS.find((f) => f.id === id);
  useSeo(festival ? festival.name : 'Festival', festival?.blurb);
  if (!festival) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🪔" title="Festival not found" action="All collections" onAction={() => nav('/collections')} /></div>;
  const recipes = recipesByIds(festival.recipeIds);
  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 7', maxHeight: 240, overflow: 'hidden' }}><DishImage id={festival.id} art={festival.art} seed={festival.id} alt={festival.name} name={festival.name} showCredit eager /></div>
      <div className="container" style={{ marginTop: -24, position: 'relative' }}>
        <div className="card card-pad">
          <span className="eyebrow">{festival.region} · {festival.when}</span>
          <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0' }}>{festival.name}</h1>
          <p className="muted" style={{ lineHeight: 1.55 }}>{festival.blurb}</p>
        </div>
        <section className="section"><SectionHead title="The festive menu" /><div className="grid grid-auto">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div></section>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
