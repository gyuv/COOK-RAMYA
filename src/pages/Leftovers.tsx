import { useState } from 'react';
import { LEFTOVERS, leftoverSuggestions } from '../lib/recommend';
import { RecipeCard } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function Leftovers() {
  useSeo('Use my leftovers', 'Turn leftover rice, parotta, idli or Maggi into something new.');
  const [pick, setPick] = useState<string>(LEFTOVERS[0].item);
  const recipes = leftoverSuggestions(pick);

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 820 }}>
      <span className="eyebrow">Reduce waste</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>Use my leftovers</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Got leftovers? Give them a delicious second life.</p>

      <div className="grid grid-auto" style={{ marginBottom: 16 }}>
        {LEFTOVERS.map((l) => (
          <button key={l.item} onClick={() => setPick(l.item)} className="recipe-card" style={{ borderColor: pick === l.item ? 'var(--terra)' : 'var(--line)', textAlign: 'left' }}>
            <div className="thumb" style={{ aspectRatio: '16 / 9' }}><FoodArt art={l.art} seed={l.item} /></div>
            <div className="rc-body"><div className="rc-title" style={{ fontSize: '0.98rem' }}>Leftover {l.item}</div><div className="muted" style={{ fontSize: '0.8rem' }}>{l.suggestions.length} ideas</div></div>
          </button>
        ))}
      </div>

      <SectionHead title={`Turn leftover ${pick.toLowerCase()} into`} />
      <div className="grid grid-auto">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
      <div style={{ height: 20 }} />
    </div>
  );
}
