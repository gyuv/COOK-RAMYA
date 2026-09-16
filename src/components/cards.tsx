import { Link } from 'react-router-dom';
import type { Recipe, Product, Region, Technique } from '../data/types';
import { FoodArt } from './FoodArt';
import { DietDot } from './ui';
import { useStore } from '../store/useStore';
import { useToast } from './ui';
import { formatMinutes } from '../hooks/useTick';

export function SaveButton({ id, name }: { id: string; name?: string }) {
  const saved = useStore((s) => s.saved.includes(id));
  const toggle = useStore((s) => s.toggleSave);
  const toast = useToast();
  return (
    <button
      className={`save-btn ${saved ? 'saved' : ''}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${name ?? 'recipe'} from saved` : `Save ${name ?? 'recipe'}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); toast(saved ? 'Removed from saved' : 'Saved to your cookbook'); }}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link to={`/recipes/${recipe.slug}`} className="recipe-card">
      <div className="thumb">
        <FoodArt art={recipe.art} seed={recipe.id} />
        <SaveButton id={recipe.id} name={recipe.name} />
        {recipe.styleLabel && <span className="pill pill-terra badge-tl">{recipe.styleLabel}</span>}
      </div>
      <div className="rc-body">
        <div className="rc-region">{recipe.state} · {recipe.cuisine}</div>
        <div className="rc-title">{recipe.name}</div>
        <div className="rc-meta">
          <DietDot diet={recipe.diet} />
          <span>⏱ {formatMinutes(recipe.prepMin + recipe.cookMin)}</span>
          <span>· {recipe.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

export function VariationCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link to={`/recipes/${recipe.slug}`} className="recipe-card">
      <div className="thumb" style={{ aspectRatio: '16 / 10' }}>
        <FoodArt art={recipe.art} seed={recipe.id} />
        <SaveButton id={recipe.id} name={recipe.name} />
      </div>
      <div className="rc-body">
        <div className="rc-title" style={{ fontSize: '1rem' }}>{recipe.name}</div>
        {recipe.tagline && <div className="muted" style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>{recipe.tagline}</div>}
        <div className="rc-meta">
          <DietDot diet={recipe.diet} />
          <span>⏱ {formatMinutes(recipe.prepMin + recipe.cookMin)}</span>
          <span>· {recipe.difficulty}</span>
        </div>
        <div className="row wrap gap6" style={{ marginTop: 2 }}>
          {recipe.tags.slice(0, 2).map((t) => <span key={t} className="pill">{t}</span>)}
        </div>
      </div>
    </Link>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link to={`/products/${product.slug}`} className="recipe-card">
      <div className="thumb" style={{ aspectRatio: '4 / 3' }}>
        <FoodArt art={product.art} seed={product.id} />
      </div>
      <div className="rc-body">
        <div className="rc-region">{product.category}</div>
        <div className="rc-title" style={{ fontSize: '1rem' }}>{product.name}</div>
        <div className="rc-meta"><span>{product.recipeIds.length} recipes</span>{product.variants.length ? <span>· {product.variants.length} variants</span> : null}</div>
      </div>
    </Link>
  );
}

export function RegionCard({ region }: { region: Region }) {
  return (
    <Link to={`/regions/${region.id}`} className="recipe-card">
      <div className="thumb" style={{ aspectRatio: '16 / 10' }}>
        <FoodArt art={region.art} seed={region.id} />
      </div>
      <div className="rc-body">
        <div className="rc-region">{region.region}</div>
        <div className="rc-title" style={{ fontSize: '1.05rem' }}>{region.name}</div>
        <div className="muted" style={{ fontSize: '0.82rem', lineHeight: 1.35 }}>{region.blurb}</div>
      </div>
    </Link>
  );
}

export function TechniqueCard({ technique }: { technique: Technique }) {
  return (
    <Link to={`/techniques/${technique.slug}`} className="recipe-card">
      <div className="thumb" style={{ aspectRatio: '16 / 10' }}>
        <FoodArt art={technique.art} seed={technique.id} />
      </div>
      <div className="rc-body">
        <div className="rc-region">Technique</div>
        <div className="rc-title" style={{ fontSize: '1.02rem' }}>{technique.name}</div>
        <div className="muted" style={{ fontSize: '0.82rem', lineHeight: 1.35 }}>{technique.local}</div>
      </div>
    </Link>
  );
}

// Horizontal scroller wrapper for card rows.
export function Scroller({ children }: { children: React.ReactNode }) {
  return <div className="hscroll">{children}</div>;
}
