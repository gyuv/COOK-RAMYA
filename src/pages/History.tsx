import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { recipeById } from '../data/recipes';
import { FoodArt } from '../components/FoodArt';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function History() {
  useSeo('Cooking history', 'Everything you\'ve cooked, with ratings and personal notes.');
  const nav = useNavigate();
  const history = useStore((s) => s.history);
  const notes = useStore((s) => s.notes);

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 760 }}>
      <span className="eyebrow">Your kitchen</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 14px' }}>Cooking history</h1>
      {history.length === 0 ? (
        <EmptyState emoji="🍳" title="Nothing cooked yet" body="Cook a recipe and it'll appear here — with your rating and notes for next time." action="Start cooking" onAction={() => nav('/discover')} />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {history.map((h) => {
            const r = recipeById(h.id);
            if (!r) return null;
            const note = h.note ?? notes[h.id];
            return (
              <div key={h.id} className="card" style={{ display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: 92, flexShrink: 0 }}><FoodArt art={r.art} seed={r.id} /></div>
                <div className="card-pad" style={{ flex: 1, padding: 14 }}>
                  <div className="row between">
                    <Link to={`/recipes/${r.slug}`} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>{r.name}</Link>
                    {h.rating ? <span style={{ color: 'var(--gold)' }}>{'★'.repeat(h.rating)}{'☆'.repeat(5 - h.rating)}</span> : null}
                  </div>
                  <div className="muted" style={{ fontSize: '0.78rem', marginTop: 2 }}>Cooked {h.times}× · last {new Date(h.cookedAt).toLocaleDateString()}</div>
                  {note && <p style={{ fontSize: '0.86rem', marginTop: 6, fontStyle: 'italic', color: 'var(--ink-2)' }}>“{note}”</p>}
                  <Link to={`/recipes/${r.slug}`} className="btn btn-ghost" style={{ marginTop: 8, padding: '6px 14px' }}>Cook again →</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}
