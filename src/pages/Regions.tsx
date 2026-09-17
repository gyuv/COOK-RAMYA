import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { REGIONS } from '../data/regions';
import { byRegion, recipesByIds } from '../data/recipes';
import { RegionCard, RecipeCard } from '../components/cards';
import { EmptyState, SectionHead } from '../components/ui';
import { FoodArt } from '../components/FoodArt';
import { useSeo } from '../hooks/useSeo';

export function Regions() {
  useSeo('Regions', 'Explore Indian cuisine by region and state — from Tamil Nadu, Kerala and Karnataka to Punjab, Bengal and beyond.');
  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">India → Region → State → Cuisine → Dish</span>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.6rem)', margin: '6px 0' }}>Explore by region</h1>
      <p className="muted" style={{ marginBottom: 18 }}>South India first, then every corner of the country.</p>
      <div className="grid grid-auto-lg">{REGIONS.map((r) => <RegionCard key={r.id} region={r} />)}</div>
    </div>
  );
}

const DIETS = [
  { key: 'all', label: 'All' },
  { key: 'veg', label: 'Veg' },
  { key: 'nonveg', label: 'Non-veg' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'egg', label: 'Egg' },
] as const;

export function RegionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const region = REGIONS.find((r) => r.id === id);
  const [diet, setDiet] = useState<string>('all');
  useSeo(region ? region.name : 'Region', region?.blurb);

  if (!region) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🗺" title="Region not found" action="All regions" onAction={() => nav('/regions')} /></div>;

  const signature = recipesByIds(region.signature);
  let all = byRegion(region.region).filter((r) => region.cuisines.includes(r.cuisine) || r.state.includes(region.name.split(' ')[0]));
  if (!all.length) all = byRegion(region.region);
  const filtered = diet === 'all' ? all : all.filter((r) => (diet === 'vegan' ? r.vegan : diet === 'veg' ? r.diet === 'veg' || r.diet === 'vegan' : r.diet === diet));

  // Group by cuisine
  const groups = new Map<string, typeof filtered>();
  for (const r of filtered) groups.set(r.cuisine, [...(groups.get(r.cuisine) ?? []), r]);

  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 7', maxHeight: 240, overflow: 'hidden' }}><FoodArt art={region.art} seed={region.id} /></div>
      <div className="container" style={{ marginTop: -24, position: 'relative' }}>
        <div className="card card-pad">
          <span className="eyebrow">{region.region}</span>
          <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0' }}>{region.name}</h1>
          <p className="muted" style={{ lineHeight: 1.55 }}>{region.blurb}</p>
          <div className="row wrap gap6" style={{ marginTop: 10 }}>{region.cuisines.map((c) => <span key={c} className="pill pill-terra">{c}</span>)}</div>
        </div>

        {signature.length > 0 && (
          <section className="section">
            <SectionHead title="Signature dishes" />
            <div className="grid grid-auto">{signature.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
          </section>
        )}

        <div className="row wrap gap6" style={{ margin: '8px 0 6px' }}>
          {DIETS.map((d) => <button key={d.key} className={`chip ${diet === d.key ? 'active' : ''}`} onClick={() => setDiet(d.key)}>{d.label}</button>)}
        </div>

        {[...groups.entries()].map(([cuisine, recipes]) => (
          <section className="section" key={cuisine}>
            <SectionHead title={`${cuisine} cuisine`} />
            <div className="grid grid-auto">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
          </section>
        ))}
        {filtered.length === 0 && <EmptyState emoji="🍽" title="No dishes match this filter" action="Show all" onAction={() => setDiet('all')} />}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
