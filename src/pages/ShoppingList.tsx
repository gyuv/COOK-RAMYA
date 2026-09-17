import { useStore } from '../store/useStore';
import { AISLE_ORDER, type Aisle } from '../lib/shopping';
import { EmptyState, useToast } from '../components/ui';
import { useSeo } from '../hooks/useSeo';
import { useNavigate } from 'react-router-dom';

export default function ShoppingList() {
  useSeo('Shopping list', 'Your combined, aisle-grouped shopping list — duplicates merged across recipes.');
  const nav = useNavigate();
  const toast = useToast();
  const shopping = useStore((s) => s.shopping);
  const { toggleShopping, removeShopping, clearChecked, clearShopping } = useStore.getState();

  if (shopping.length === 0) {
    return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🛒" title="Your shopping list is empty" body="Add ingredients from any recipe and we'll group them by aisle and merge duplicates." action="Explore recipes" onAction={() => nav('/discover')} /></div>;
  }

  const byAisle = new Map<Aisle, typeof shopping>();
  for (const item of shopping) byAisle.set(item.aisle, [...(byAisle.get(item.aisle) ?? []), item]);
  const sortedAisles = AISLE_ORDER.filter((a) => byAisle.has(a));
  const checkedCount = shopping.filter((s) => s.checked).length;

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 720 }}>
      <div className="row between" style={{ marginBottom: 4 }}>
        <div><span className="eyebrow">My kitchen</span><h1 style={{ fontSize: 'clamp(1.6rem,5vw,2.2rem)' }}>Shopping list</h1></div>
      </div>
      <p className="muted" style={{ marginBottom: 14 }}>{shopping.length} items · {checkedCount} checked · grouped by aisle, duplicates merged.</p>

      {sortedAisles.map((aisle) => (
        <div key={aisle} className="card" style={{ marginBottom: 12, overflow: 'hidden' }}>
          <div className="eyebrow" style={{ padding: '10px 16px', background: 'var(--ivory-2)' }}>{aisle}</div>
          {byAisle.get(aisle)!.map((item) => (
            <div key={item.name} className="row between" style={{ padding: '10px 16px', borderTop: '1px solid var(--line)', gap: 10 }}>
              <button onClick={() => toggleShopping(item.name)} className="row gap10" style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${item.checked ? 'var(--green)' : 'var(--line-2)'}`, background: item.checked ? 'var(--green)' : 'transparent', color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '0.8rem' }}>{item.checked ? '✓' : ''}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ textDecoration: item.checked ? 'line-through' : 'none', color: item.checked ? 'var(--ink-3)' : 'var(--ink)' }}>{item.name}</span>
                  {item.qty && <span className="muted" style={{ fontSize: '0.82rem' }}> · {item.qty}</span>}
                  {item.fromRecipes.length > 0 && <div className="muted" style={{ fontSize: '0.72rem' }}>for {item.fromRecipes.join(', ')}</div>}
                </span>
              </button>
              <button className="chip" onClick={() => removeShopping(item.name)} aria-label={`Remove ${item.name}`}>✕</button>
            </div>
          ))}
        </div>
      ))}

      <div className="row gap8 mt16">
        {checkedCount > 0 && <button className="btn btn-ghost" onClick={() => { clearChecked(); toast('Cleared checked items'); }}>Clear checked ({checkedCount})</button>}
        <button className="btn btn-ghost" onClick={() => { if (confirm('Clear the entire shopping list?')) { clearShopping(); toast('Shopping list cleared'); } }} style={{ marginLeft: 'auto' }}>Clear all</button>
      </div>
      <div style={{ height: 20 }} />
    </div>
  );
}
