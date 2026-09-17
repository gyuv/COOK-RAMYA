import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RECIPES, allFamilies, byCategory } from '../data/recipes';
import { RecipeCard } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { SectionHead, DietDot } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

const CATEGORIES = ['Breakfast', 'Main', 'Side', 'Snack', 'Sweet', 'Chutney', 'Drink', 'Street Food'];
const DIETS = ['all', 'veg', 'nonveg', 'vegan', 'egg'] as const;

export default function Discover() {
  useSeo('Discover', 'Browse every RAMYA-COOK dish — recipe families, categories and dietary filters across Indian cuisine.');
  const nav = useNavigate();
  const [cat, setCat] = useState('All');
  const [diet, setDiet] = useState<string>('all');
  const families = allFamilies(3).slice(0, 12);

  const recipes = useMemo(() => {
    let list = cat === 'All' ? RECIPES : byCategory(cat);
    if (diet !== 'all') list = list.filter((r) => (diet === 'vegan' ? r.vegan : diet === 'veg' ? r.diet === 'veg' || r.diet === 'vegan' : r.diet === diet));
    return [...list].sort((a, b) => b.popularity - a.popularity);
  }, [cat, diet]);

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Discover</span>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.6rem)', margin: '6px 0 4px' }}>Search anything. Cook anything.</h1>
      <p className="muted" style={{ marginBottom: 18 }}>{RECIPES.length} recipes across every Indian region — start with a family or filter below.</p>

      <SectionHead title="Recipe families" />
      <div className="grid grid-auto" style={{ marginBottom: 8 }}>
        {families.map((f) => (
          <Link key={f.dishType} to={`/dishes/${f.dishType.toLowerCase().replace(/\s+/g, '-')}`} className="recipe-card">
            <div className="thumb" style={{ aspectRatio: '16 / 10' }}><FoodArt art={f.members[0].art} seed={f.dishType} /></div>
            <div className="rc-body"><div className="rc-title" style={{ fontSize: '0.98rem' }}>{f.dishType}</div><div className="muted" style={{ fontSize: '0.8rem' }}>{f.count} variations</div></div>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div style={{ position: 'sticky', top: 'var(--header-h)', background: 'var(--ivory)', paddingTop: 10, zIndex: 5 }}>
        <div className="row wrap gap6" style={{ marginBottom: 6 }}>
          <button className={`chip ${cat === 'All' ? 'active' : ''}`} onClick={() => setCat('All')}>All</button>
          {CATEGORIES.map((c) => <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="row wrap gap6" style={{ marginBottom: 12 }}>
          {DIETS.map((d) => <button key={d} className={`chip ${diet === d ? 'active' : ''}`} onClick={() => setDiet(d)}><DietDot diet={(d === 'all' ? 'veg' : d) as never} /> {d === 'all' ? 'All diets' : d}</button>)}
        </div>
      </div>

      <p className="muted" style={{ fontSize: '0.85rem', marginBottom: 10 }}>{recipes.length} recipes</p>
      <div className="grid grid-auto">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
      <div style={{ height: 20 }} />
      <button className="btn btn-ghost btn-block" onClick={() => nav('/regions')}>Browse by region instead →</button>
      <div style={{ height: 20 }} />
    </div>
  );
}
