import { useParams, useNavigate, Link } from 'react-router-dom';
import { productBySlug, productById } from '../data/products';
import { recipesByIds, familyFor } from '../data/recipes';
import { RecipeCard, Scroller } from '../components/cards';
import { DishImage } from '../components/DishImage';
import { EmptyState, SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function Product() {
  const { slug } = useParams();
  const nav = useNavigate();
  const product = slug ? productBySlug(slug) : undefined;
  useSeo(product ? product.name : 'Product', product?.description);

  if (!product) {
    return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="📦" title="Product not found" action="Back home" onAction={() => nav('/')} /></div>;
  }

  const recipes = recipesByIds(product.recipeIds);
  const alts = product.alternatives.map(productById).filter(Boolean);
  // If a product maps to a big recipe family (e.g. Maggi), spotlight it.
  const family = recipes.length ? familyFor(recipes[0].dishType) : [];
  const isFamily = family.length >= 6 && recipes.every((r) => r.dishType === recipes[0].dishType);

  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 8', maxHeight: 300, overflow: 'hidden' }}><DishImage id={product.id} art={product.art} seed={product.id} alt={product.name} name={product.name} showCredit eager /></div>
      <div className="container" style={{ marginTop: -28, position: 'relative' }}>
        <div className="card card-pad">
          <span className="eyebrow">{product.category}</span>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.3rem)', margin: '6px 0' }}>{product.name}</h1>
          <p className="muted" style={{ lineHeight: 1.55 }}>{product.description}</p>
          {isFamily && (
            <Link to={`/dishes/${recipes[0].dishType.toLowerCase().replace(/\s+/g, '-')}`} className="btn btn-primary btn-lg" style={{ marginTop: 14 }}>
              See {family.length}+ ways to make {recipes[0].dishType} →
            </Link>
          )}
        </div>

        {product.variants.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Variants" />
            <div className="row wrap gap8">{product.variants.map((v) => <span key={v.name} className="pill">{v.name}{v.note ? ` · ${v.note}` : ''}</span>)}</div>
          </div></section>
        )}

        {recipes.length > 0 && (
          <section className="section">
            <SectionHead title={`Recipes using ${product.name.split(' ')[0]}`} />
            <Scroller>{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
          </section>
        )}

        {product.combos && product.combos.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Popular combinations" />
            <ul style={{ display: 'grid', gap: 6 }}>{product.combos.map((c) => <li key={c} className="row gap8"><span aria-hidden="true">🍽</span>{c}</li>)}</ul>
          </div></section>
        )}

        {product.servingIdeas && product.servingIdeas.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Serving ideas" />
            <ul style={{ display: 'grid', gap: 6 }}>{product.servingIdeas.map((s) => <li key={s} className="row gap8"><span aria-hidden="true">•</span>{s}</li>)}</ul>
          </div></section>
        )}

        {alts.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Alternative products" />
            <div className="row wrap gap8">{alts.map((a) => a && <Link key={a.id} to={`/products/${a.slug}`} className="chip">{a.name}</Link>)}</div>
          </div></section>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
