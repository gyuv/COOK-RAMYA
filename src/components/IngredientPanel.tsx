import { Link } from 'react-router-dom';
import { ingredientByName } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { FoodArt } from './FoodArt';

// Ingredient intelligence (section 16 / 20). Renders full detail when we know
// the ingredient, and a graceful minimal panel when we don't.
export function IngredientPanel({ name }: { name: string }) {
  const info = ingredientByName(name) ?? ingredientByName(name.split(' ')[0]);
  if (!info) {
    return (
      <div>
        <div className="row gap12" style={{ marginBottom: 8 }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><FoodArt art="other" seed={name} /></div>
          <div><h3 style={{ fontSize: '1.15rem' }}>{name}</h3><span className="muted" style={{ fontSize: '0.82rem' }}>Ingredient</span></div>
        </div>
        <p className="muted" style={{ fontSize: '0.9rem' }}>We don't have detailed notes for this ingredient yet — but it's used in this recipe as listed.</p>
      </div>
    );
  }

  const related = RECIPES.filter((r) => r.ingredients.some((i) => i.item === info.id)).slice(0, 6);
  const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 12 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.92rem', lineHeight: 1.5 }}>{children}</div>
    </div>
  );

  return (
    <div>
      <div className="row gap12" style={{ marginBottom: 6 }}>
        <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}><FoodArt art={info.art} seed={info.id} /></div>
        <div>
          <h3 style={{ fontSize: '1.25rem' }}>{info.name}</h3>
          <span className="pill" style={{ marginTop: 4 }}>{info.kind}</span>
        </div>
      </div>
      <Section label="What it is">{info.what}</Section>
      <Section label="Flavour">{info.flavor}</Section>
      <Section label="How to use">{info.howToUse}</Section>
      <Section label="When to add">{info.whenToAdd}</Section>
      <Section label="How to store">{info.store}</Section>
      <Section label="Substitutes"><ul style={{ paddingLeft: 18, listStyle: 'disc' }}>{info.substitutes.map((s) => <li key={s}>{s}</li>)}</ul></Section>
      <Section label="Common mistakes"><ul style={{ paddingLeft: 18, listStyle: 'disc' }}>{info.mistakes.map((s) => <li key={s}>{s}</li>)}</ul></Section>
      {related.length > 0 && (
        <Section label="Used in">
          <div className="row wrap gap6">{related.map((r) => <Link key={r.id} to={`/recipes/${r.slug}`} className="chip">{r.name}</Link>)}</div>
        </Section>
      )}
    </div>
  );
}
