import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { recipesByIds } from '../data/recipes';
import { RecipeCard } from '../components/cards';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function Saved() {
  useSeo('Saved recipes', 'Your saved RAMYA-COOK recipes.');
  const nav = useNavigate();
  const saved = useStore((s) => s.saved);
  const recipes = recipesByIds(saved);

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Your cookbook</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 14px' }}>Saved recipes</h1>
      {recipes.length === 0 ? (
        <EmptyState emoji="📖" title="Your cookbook is waiting." body="Save recipes you want to cook later — tap the heart on any recipe." action="Explore recipes" onAction={() => nav('/discover')} />
      ) : (
        <div className="grid grid-auto">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}
