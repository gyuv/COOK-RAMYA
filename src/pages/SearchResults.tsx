import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { search } from '../lib/search';
import { RecipeCard, ProductCard, TechniqueCard } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { DishImage } from '../components/DishImage';
import { EmptyState, SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';
import { recipeById } from '../data/recipes';
import { productById } from '../data/products';
import { TECHNIQUES } from '../data/techniques';
import { SearchBar } from '../components/SearchBar';

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  useSeo(q ? `Search: ${q}` : 'Search', `Search results for "${q}" across recipes, dishes, products, ingredients, techniques and cuisines.`);
  const results = useMemo(() => search(q, 24), [q]);

  const techBySlug = (slug: string) => TECHNIQUES.find((t) => t.slug === slug);

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <div className="mobile-only" style={{ marginBottom: 14 }}><SearchBar variant="compact" /></div>

      {!q.trim() ? (
        <EmptyState emoji="🔍" title="Search RAMYA-COOK" body="Try a dish (dosa), a product (maggi), an ingredient (tomato) or a cuisine." />
      ) : results.total === 0 ? (
        <EmptyState emoji="🍚" title={`No matches for "${q}"`} body="Try a simpler word like 'dosa', 'sambar' or 'maggi'." action="Back home" onAction={() => (window.location.href = '/')} />
      ) : (
        <>
          <p className="muted" style={{ margin: '6px 0 14px' }}>{results.total} results for <strong style={{ color: 'var(--ink)' }}>“{q}”</strong></p>

          {/* Recipe families — the "50 ways" hero */}
          {results.families.length > 0 && (
            <section className="section" style={{ marginTop: 8 }}>
              {results.families.map((f) => (
                <Link key={f.id} to={`/dishes/${f.slug}`} className="card" style={{ display: 'flex', overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ width: 110, flexShrink: 0 }}><FoodArt art={f.art} seed={f.id} /></div>
                  <div className="card-pad" style={{ flex: 1 }}>
                    <span className="eyebrow">Recipe family</span>
                    <h2 style={{ fontSize: '1.4rem', margin: '4px 0' }}>{f.extra} to make {f.title}</h2>
                    <span className="btn btn-ghost" style={{ marginTop: 4 }}>Choose your version →</span>
                  </div>
                </Link>
              ))}
            </section>
          )}

          {results.products.length > 0 && (
            <section className="section">
              <SectionHead title="Products" />
              <div className="grid grid-auto">{results.products.map((p) => { const pr = productById(p.id); return pr ? <ProductCard key={p.id} product={pr} /> : null; })}</div>
            </section>
          )}

          {results.recipes.length > 0 && (
            <section className="section">
              <SectionHead title="Recipes" />
              <div className="grid grid-auto">{results.recipes.map((h) => { const r = recipeById(h.id); return r ? <RecipeCard key={h.id} recipe={r} /> : null; })}</div>
            </section>
          )}

          {results.ingredients.length > 0 && (
            <section className="section">
              <SectionHead title="Ingredients" />
              <div className="grid grid-auto">
                {results.ingredients.map((i) => (
                  <Link key={i.id} to={`/ingredients/${i.slug}`} className="recipe-card">
                    <div className="thumb" style={{ aspectRatio: '4 / 3' }}><DishImage id={i.id} art={i.art} seed={i.id} alt={i.title} name={i.title} /></div>
                    <div className="rc-body"><div className="rc-title" style={{ fontSize: '0.98rem' }}>{i.title}</div><div className="muted" style={{ fontSize: '0.8rem' }}>{i.subtitle}</div></div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.techniques.length > 0 && (
            <section className="section">
              <SectionHead title="Techniques" />
              <div className="grid grid-auto">{results.techniques.map((t) => { const tech = techBySlug(t.slug); return tech ? <TechniqueCard key={t.id} technique={tech} /> : null; })}</div>
            </section>
          )}

          {results.cuisines.length > 0 && (
            <section className="section">
              <SectionHead title="Cuisines & regions" />
              <div className="row wrap gap8">{results.cuisines.map((c) => <Link key={c.title} to={`/regions/${c.slug}`} className="chip">{c.title} · {c.subtitle}</Link>)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
