import { useParams, useNavigate, Link } from 'react-router-dom';
import { EQUIPMENT } from '../data/equipment';
import { RECIPES, recipesByIds } from '../data/recipes';
import { useStore } from '../store/useStore';
import { RecipeCard, Scroller } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { EmptyState, SectionHead, useToast } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export function Equipment() {
  useSeo('My Kitchen equipment', 'Tell RAMYA-COOK what equipment you own to get recipes you can actually make.');
  const owned = useStore((s) => s.equipmentOwned);
  const toggle = useStore((s) => s.toggleEquipment);
  const toast = useToast();

  const cookable = owned.length ? RECIPES.filter((r) => r.equipment.length && r.equipment.every((e) => owned.includes(e))).sort((a, b) => b.popularity - a.popularity).slice(0, 12) : [];

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">My kitchen</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>My equipment</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Tap what you own — we'll recommend recipes you can make with it.</p>

      <div className="grid grid-auto">
        {EQUIPMENT.map((e) => {
          const has = owned.includes(e.id);
          return (
            <div key={e.id} className="recipe-card" style={{ borderColor: has ? 'var(--green)' : 'var(--line)' }}>
              <Link to={`/equipment/${e.slug}`} className="thumb" style={{ aspectRatio: '16 / 10', display: 'block' }}><FoodArt art={e.art} seed={e.id} /></Link>
              <div className="rc-body">
                <Link to={`/equipment/${e.slug}`} className="rc-title" style={{ fontSize: '0.98rem' }}>{e.name}</Link>
                <button className={`chip ${has ? 'active' : ''}`} style={{ marginTop: 6 }} onClick={() => { toggle(e.id); toast(has ? `Removed ${e.name}` : `Added ${e.name}`); }}>{has ? '✓ In my kitchen' : '+ I have this'}</button>
              </div>
            </div>
          );
        })}
      </div>

      {cookable.length > 0 && <section className="section"><SectionHead title="Recipes you can make" /><Scroller>{cookable.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>}
      <div style={{ height: 20 }} />
    </div>
  );
}

export function EquipmentDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const e = EQUIPMENT.find((x) => x.slug === slug);
  useSeo(e ? e.name : 'Equipment', e?.what);
  if (!e) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🍳" title="Equipment not found" action="My kitchen" onAction={() => nav('/kitchen')} /></div>;
  const recipes = recipesByIds(e.recipeIds);
  const Section = ({ t, children }: { t: string; children: React.ReactNode }) => (<div className="card card-pad" style={{ marginTop: 12 }}><div className="eyebrow" style={{ marginBottom: 6 }}>{t}</div><div style={{ lineHeight: 1.55 }}>{children}</div></div>);
  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 7', maxHeight: 220, overflow: 'hidden' }}><FoodArt art={e.art} seed={e.id} /></div>
      <div className="container" style={{ marginTop: -24, position: 'relative', maxWidth: 720 }}>
        <div className="card card-pad">
          <span className="eyebrow">Equipment{e.local ? ` · ${e.local}` : ''}</span>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)', margin: '6px 0' }}>{e.name}</h1>
          <p style={{ lineHeight: 1.55 }}>{e.what}</p>
        </div>
        <Section t="Good for">{e.goodFor}</Section>
        <Section t="How to use">{e.howToUse}</Section>
        <Section t="Cleaning & care">{e.cleaning}</Section>
        <Section t="Common mistakes">{e.mistakes}</Section>
        {recipes.length > 0 && <section className="section"><SectionHead title="Recipes that use it" /><Scroller>{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller></section>}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
