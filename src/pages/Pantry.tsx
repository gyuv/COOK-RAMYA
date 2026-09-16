import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore, type PantryItem } from '../store/useStore';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

const STATUS: { key: PantryItem['status']; label: string; color: string }[] = [
  { key: 'available', label: 'Available', color: 'var(--green)' },
  { key: 'low', label: 'Running low', color: 'var(--gold)' },
  { key: 'expiring', label: 'Expiring soon', color: 'var(--chilli)' },
];
const STAPLES = ['Rice', 'Toor dal', 'Urad dal', 'Mustard seeds', 'Turmeric', 'Chilli powder', 'Oil', 'Ghee', 'Onion', 'Tomato', 'Coconut', 'Curry leaves'];

export default function Pantry() {
  useSeo('Pantry', 'Track what you have, what\'s running low and what\'s expiring — used to power recommendations.');
  const pantry = useStore((s) => s.pantry);
  const { addPantry, setPantryStatus, removePantry } = useStore.getState();
  const [input, setInput] = useState('');

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 760 }}>
      <span className="eyebrow">My kitchen</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 4px' }}>Pantry</h1>
      <p className="muted" style={{ marginBottom: 16 }}>Keep track of your staples. Stored on this device.</p>

      <div className="card card-pad">
        <div className="row gap8">
          <input className="input" placeholder="Add an item…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && input.trim()) { addPantry(input); setInput(''); } }} />
          <button className="btn btn-primary" onClick={() => { if (input.trim()) { addPantry(input); setInput(''); } }}>Add</button>
        </div>
        <div className="eyebrow" style={{ margin: '12px 0 6px' }}>Quick add</div>
        <div className="row wrap gap6">{STAPLES.map((s) => <button key={s} className="chip" onClick={() => addPantry(s)}>+ {s}</button>)}</div>
      </div>

      {pantry.length === 0 ? (
        <div style={{ marginTop: 20 }}><EmptyState emoji="🫙" title="Your pantry is empty" body="Add staples to power 'what can I cook' and smarter recommendations." /></div>
      ) : (
        <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
          {pantry.map((p) => (
            <div key={p.name} className="row between" style={{ padding: '12px 16px', borderBottom: '1px solid var(--line)', gap: 10, flexWrap: 'wrap' }}>
              <strong style={{ flex: '1 1 120px' }}>{p.name}</strong>
              <div className="row gap6">
                {STATUS.map((st) => (
                  <button key={st.key} onClick={() => setPantryStatus(p.name, st.key)} className="chip" aria-pressed={p.status === st.key}
                    style={{ borderColor: p.status === st.key ? st.color : 'var(--line-2)', color: p.status === st.key ? '#fff' : 'var(--ink-2)', background: p.status === st.key ? st.color : 'var(--surface)' }}>
                    {st.label}
                  </button>
                ))}
                <button className="chip" onClick={() => removePantry(p.name)} aria-label={`Remove ${p.name}`}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pantry.length > 0 && <Link to="/what-can-i-cook" className="btn btn-primary btn-block mt16">Cook with my pantry →</Link>}
      <div style={{ height: 20 }} />
    </div>
  );
}
