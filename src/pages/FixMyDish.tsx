import { useState } from 'react';
import { RESCUES } from '../data/regions';
import { useSeo } from '../hooks/useSeo';

const ICON: Record<string, string> = {
  salt: '🧂', chilli: '🌶', lemon: '🍋', sugar: '🍯', water: '💧', thick: '🥣', burnt: '🔥',
  bland: '😐', dry: '🏜', raw: '⏳', mushy: '🥴', oil: '🛢', split: '🥛', sticky: '🍚', lumpy: '🌀',
};

export default function FixMyDish() {
  useSeo('Fix my dish', 'Practical recovery steps for common cooking problems — too salty, too sour, burnt, watery and more.');
  const [open, setOpen] = useState<string | null>('Too salty');
  const active = RESCUES.find((r) => r.problem === open);

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 820 }}>
      <span className="eyebrow">Cooking rescue</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>Fix my dish</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Something went wrong? Pick the problem for a practical fix.</p>

      <div className="row wrap gap6" style={{ marginBottom: 16 }}>
        {RESCUES.map((r) => (
          <button key={r.problem} className={`chip ${open === r.problem ? 'active' : ''}`} onClick={() => setOpen(r.problem)}>
            <span aria-hidden="true">{ICON[r.icon] ?? '🍲'}</span> {r.problem}
          </button>
        ))}
      </div>

      {active && (
        <div className="card card-pad fade-up" key={active.problem}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}><span aria-hidden="true">{ICON[active.icon] ?? '🍲'}</span> {active.problem}?</h2>
          <div className="eyebrow" style={{ margin: '12px 0 8px' }}>Try this</div>
          <ol style={{ display: 'grid', gap: 10, paddingLeft: 20 }}>{active.fixes.map((f, i) => <li key={i} style={{ lineHeight: 1.55 }}>{f}</li>)}</ol>
          <div className="card card-pad" style={{ marginTop: 14, background: 'var(--green-soft)', borderColor: '#cfe6da' }}>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Prevent it next time</div>
            <p style={{ lineHeight: 1.5 }}>{active.prevent}</p>
          </div>
        </div>
      )}
      <div style={{ height: 20 }} />
    </div>
  );
}
