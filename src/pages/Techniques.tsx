import { useParams, useNavigate } from 'react-router-dom';
import { TECHNIQUES } from '../data/techniques';
import { recipesByIds } from '../data/recipes';
import { TechniqueCard, RecipeCard, Scroller } from '../components/cards';
import { FoodArt } from '../components/FoodArt';
import { EmptyState, SectionHead } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export function Techniques() {
  useSeo('Techniques', 'Learn the core Indian cooking techniques — tempering, bhunao, dum, dry-roasting, deep-frying, steaming, fermentation and more.');
  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Learn</span>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.6rem)', margin: '6px 0' }}>Cooking technique library</h1>
      <p className="muted" style={{ marginBottom: 18 }}>The methods behind great Indian cooking — what they are, why they matter, and how to master them.</p>
      <div className="grid grid-auto-lg">{TECHNIQUES.map((t) => <TechniqueCard key={t.id} technique={t} />)}</div>
    </div>
  );
}

export function TechniqueDetail() {
  const { slug } = useParams();
  const nav = useNavigate();
  const t = TECHNIQUES.find((x) => x.slug === slug);
  useSeo(t ? t.name : 'Technique', t?.what);
  if (!t) return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="📖" title="Technique not found" action="All techniques" onAction={() => nav('/techniques')} /></div>;

  const recipes = recipesByIds(t.recipeIds);
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card card-pad" style={{ marginTop: 14 }}><div className="eyebrow" style={{ marginBottom: 8 }}>{title}</div>{children}</div>
  );

  return (
    <div className="fade-up">
      <div style={{ position: 'relative', aspectRatio: '16 / 7', maxHeight: 240, overflow: 'hidden' }}><FoodArt art={t.art} seed={t.id} /></div>
      <div className="container" style={{ marginTop: -24, position: 'relative', maxWidth: 720 }}>
        <div className="card card-pad">
          <span className="eyebrow">Technique{t.local ? ` · ${t.local}` : ''}</span>
          <h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.3rem)', margin: '6px 0' }}>{t.name}</h1>
          <p style={{ lineHeight: 1.6 }}>{t.what}</p>
          <p className="muted" style={{ lineHeight: 1.6, marginTop: 8 }}><strong style={{ color: 'var(--ink)' }}>Why it matters.</strong> {t.why}</p>
          {t.heat && <span className="pill pill-terra" style={{ marginTop: 12 }}>Typical heat: {t.heat}</span>}
        </div>

        <Section title="How to do it">
          <ol style={{ display: 'grid', gap: 8, paddingLeft: 20 }}>{t.how.map((h, i) => <li key={i} style={{ lineHeight: 1.5 }}>{h}</li>)}</ol>
        </Section>

        {/* Tadka-style visual sequence */}
        {t.sequence && (
          <Section title="Visual sequence">
            <div className="row wrap" style={{ gap: 6, alignItems: 'center' }}>
              {t.sequence.map((s, i) => (
                <span key={i} className="row gap6">
                  <span className="pill" style={{ background: 'var(--terra-soft)', color: 'var(--terra-dark)' }}>{s}</span>
                  {i < t.sequence!.length - 1 && <span aria-hidden="true" style={{ color: 'var(--terra)' }}>→</span>}
                </span>
              ))}
            </div>
          </Section>
        )}

        <Section title="Visual & sensory cues"><ul style={{ display: 'grid', gap: 6, paddingLeft: 18, listStyle: 'disc' }}>{t.visualCues.map((c) => <li key={c}>{c}</li>)}</ul></Section>
        <Section title="Common mistakes"><ul style={{ display: 'grid', gap: 6, paddingLeft: 18, listStyle: 'disc' }}>{t.mistakes.map((c) => <li key={c}>{c}</li>)}</ul></Section>

        {recipes.length > 0 && (
          <section className="section">
            <SectionHead title="Recipes using this technique" />
            <Scroller>{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
          </section>
        )}
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
