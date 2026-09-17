import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSeo } from '../hooks/useSeo';

const CARDS = [
  { to: '/pantry', icon: '🫙', label: 'Pantry', desc: 'Track your staples' },
  { to: '/shopping', icon: '🛒', label: 'Shopping list', desc: 'Grouped by aisle' },
  { to: '/meal-planner', icon: '🗓', label: 'Meal planner', desc: 'Plan your week' },
  { to: '/kitchen/equipment', icon: '🍳', label: 'My equipment', desc: 'What you own' },
  { to: '/saved', icon: '♥', label: 'Saved recipes', desc: 'Your cookbook' },
  { to: '/history', icon: '📜', label: 'Cooking history', desc: 'What you\'ve cooked' },
];

export default function Kitchen() {
  useSeo('My Kitchen', 'Your pantry, shopping list, meal plan, equipment, saved recipes and history in one place.');
  const shopping = useStore((s) => s.shopping.length);
  const pantry = useStore((s) => s.pantry.length);
  const saved = useStore((s) => s.saved.length);
  const cooked = useStore((s) => s.history.length);
  const counts: Record<string, number> = { '/shopping': shopping, '/pantry': pantry, '/saved': saved, '/history': cooked };

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <span className="eyebrow">Your space</span>
      <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.4rem)', margin: '6px 0 16px' }}>My Kitchen</h1>
      <div className="grid grid-auto-lg">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to} className="card card-pad" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: '1.8rem' }} aria-hidden="true">{c.icon}</span>
            <div style={{ flex: 1 }}>
              <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>{c.label}</strong>
              <div className="muted" style={{ fontSize: '0.82rem' }}>{c.desc}</div>
            </div>
            {counts[c.to] > 0 && <span className="pill pill-terra">{counts[c.to]}</span>}
          </Link>
        ))}
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
