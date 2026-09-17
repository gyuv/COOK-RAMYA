import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { allFamilies, familyFor } from '../data/recipes';
import { VariationCard } from '../components/cards';
import { EmptyState, SectionHead, DietDot } from '../components/ui';
import { useSeo } from '../hooks/useSeo';
import { FILTER_TAGS } from '../lib/constants';
import { formatMinutes } from '../hooks/useTick';

export default function DishFamily() {
  const { slug } = useParams();
  const nav = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);

  const dishType = useMemo(() => {
    const fam = allFamilies(1).find((f) => f.dishType.toLowerCase().replace(/\s+/g, '-') === slug);
    return fam?.dishType;
  }, [slug]);

  const members = dishType ? familyFor(dishType) : [];
  useSeo(dishType ? `${members.length} ways to make ${dishType}` : 'Dish', dishType ? `Discover ${members.length} ways to make ${dishType} — filter by style and compare variations.` : undefined);

  if (!dishType || members.length === 0) {
    return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🍲" title="Dish not found" body="Try searching for a dish like Dosa, Sambar or Maggi." action="Back home" onAction={() => nav('/')} /></div>;
  }

  const availableTags = FILTER_TAGS.filter((t) => members.some((m) => m.tags.includes(t)));
  const shown = filter ? members.filter((m) => m.tags.includes(filter)) : members;

  return (
    <div className="container fade-up" style={{ paddingTop: 18 }}>
      <button onClick={() => nav(-1)} className="btn btn-ghost" style={{ marginBottom: 12, padding: '6px 12px' }}>← Back</button>
      <span className="eyebrow">Recipe family</span>
      <h1 style={{ fontSize: 'clamp(1.8rem,6vw,2.8rem)', margin: '6px 0 4px' }}>{members.length}+ ways to make {dishType}</h1>
      <p className="muted">Which version would you like to cook?</p>

      {/* Filters */}
      <div className="row wrap gap6" style={{ margin: '16px 0' }}>
        <button className={`chip ${!filter ? 'active' : ''}`} onClick={() => setFilter(null)}>All ({members.length})</button>
        {availableTags.map((t) => (
          <button key={t} className={`chip ${filter === t ? 'active' : ''}`} onClick={() => setFilter(filter === t ? null : t)}>{t}</button>
        ))}
        <button className={`chip ${compare ? 'active' : ''}`} style={{ marginLeft: 'auto' }} onClick={() => setCompare((c) => !c)} aria-pressed={compare}>⇄ Compare</button>
      </div>

      {compare ? (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem', minWidth: 520 }}>
            <thead>
              <tr style={{ textAlign: 'left', background: 'var(--ivory-2)' }}>
                {['Version', 'Diet', 'Total time', 'Difficulty', 'Ingredients', 'Style'].map((h) => <th key={h} style={{ padding: '10px 12px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => nav(`/recipes/${r.slug}`)}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--terra)' }}>{r.name}</td>
                  <td style={{ padding: '10px 12px' }}><DietDot diet={r.diet} /></td>
                  <td style={{ padding: '10px 12px' }}>{formatMinutes(r.prepMin + r.cookMin)}</td>
                  <td style={{ padding: '10px 12px' }}>{r.difficulty}</td>
                  <td style={{ padding: '10px 12px' }}>{r.ingredients.length}</td>
                  <td style={{ padding: '10px 12px' }}>{r.styleLabel ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <SectionHead title={filter ? `${filter} (${shown.length})` : 'All variations'} />
          {shown.length ? (
            <div className="grid grid-auto">{shown.map((r) => <VariationCard key={r.id} recipe={r} />)}</div>
          ) : (
            <EmptyState emoji="🔎" title={`No ${filter} versions`} body="Try a different filter." action="Show all" onAction={() => setFilter(null)} />
          )}
        </>
      )}
    </div>
  );
}
