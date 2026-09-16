import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { suggest, POPULAR_SEARCHES, BROWSE_CATEGORIES, type SearchHit } from '../lib/search';
import { useStore } from '../store/useStore';
import { FoodArt } from './FoodArt';

const KIND_LABEL: Record<string, string> = {
  recipe: 'Recipe', family: 'Variations', product: 'Product', ingredient: 'Ingredient', technique: 'Technique', cuisine: 'Cuisine',
};

function hitPath(h: SearchHit): string {
  switch (h.kind) {
    case 'recipe': return `/recipes/${h.slug}`;
    case 'family': return `/dishes/${h.slug}`;
    case 'product': return `/products/${h.slug}`;
    case 'ingredient': return `/ingredients/${h.slug}`;
    case 'technique': return `/techniques/${h.slug}`;
    case 'cuisine': return `/regions/${h.slug}`;
    default: return '/search';
  }
}

export function SearchBar({ variant = 'compact', autoFocus }: { variant?: 'hero' | 'compact'; autoFocus?: boolean }) {
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const nav = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const recent = useStore((s) => s.recentSearches);
  const addRecent = useStore((s) => s.addRecentSearch);

  // Debounce keystrokes (section 85 — no work per keystroke).
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(q), 140);
    return () => window.clearTimeout(id);
  }, [q]);

  const hits = useMemo(() => (debounced.trim() ? suggest(debounced, 8) : []), [debounced]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const go = (path: string, term?: string) => {
    if (term) addRecent(term);
    setOpen(false); setQ(''); setActive(-1);
    nav(path);
  };
  const submit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    addRecent(t);
    setOpen(false); setActive(-1);
    nav(`/search?q=${encodeURIComponent(t)}`);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === 'Enter') {
      if (active >= 0 && hits[active]) go(hitPath(hits[active]), hits[active].title);
      else submit(q);
    } else if (e.key === 'Escape') setOpen(false);
  };

  const isHero = variant === 'hero';

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: isHero ? 640 : 520, margin: isHero ? '0 auto' : undefined }}>
      <div className="row" style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 999, padding: isHero ? '6px 8px 6px 20px' : '4px 6px 4px 16px', boxShadow: isHero ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
        <span aria-hidden="true" style={{ fontSize: isHero ? '1.2rem' : '1rem', opacity: 0.5 }}>🔍</span>
        <input
          value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
          onFocus={() => setOpen(true)} onKeyDown={onKey}
          autoFocus={autoFocus}
          placeholder="Search for a dish, ingredient, product or cuisine..."
          aria-label="Search recipes, products, ingredients and cuisines"
          role="combobox" aria-expanded={open} aria-autocomplete="list"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: isHero ? '1.05rem' : '0.95rem', padding: isHero ? '10px 8px' : '8px 8px', color: 'var(--ink)', minWidth: 0 }}
        />
        <button className="btn btn-primary" onClick={() => submit(q)} style={{ padding: isHero ? '11px 22px' : '8px 16px', flexShrink: 0 }}>Search</button>
      </div>

      {open && (
        <div className="fade-up" style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: 'var(--surface)', borderRadius: 18, border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)', zIndex: 60, maxHeight: '60vh', overflowY: 'auto', padding: 8 }}>
          {debounced.trim() && hits.length > 0 && hits.map((h, i) => (
            <button key={`${h.kind}-${h.id}`} onClick={() => go(hitPath(h), h.title)}
              onMouseEnter={() => setActive(i)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, border: 'none', background: active === i ? 'var(--ivory-2)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}><FoodArt art={h.art} seed={h.id} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.title}</div>
                <div className="muted" style={{ fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.subtitle}</div>
              </div>
              <span className="pill" style={{ flexShrink: 0 }}>{KIND_LABEL[h.kind]}</span>
            </button>
          ))}
          {debounced.trim() && hits.length === 0 && (
            <div className="muted center" style={{ padding: 18, fontSize: '0.9rem' }}>No matches for "{debounced}". Try "dosa", "maggi" or "tomato".</div>
          )}
          {!debounced.trim() && (
            <div style={{ padding: 6, display: 'grid', gap: 12 }}>
              {recent.length > 0 && (
                <div>
                  <div className="eyebrow" style={{ padding: '4px 6px' }}>Recent</div>
                  <div className="row wrap gap6" style={{ padding: '0 6px' }}>{recent.map((r) => <button key={r} className="chip" onClick={() => submit(r)}>{r}</button>)}</div>
                </div>
              )}
              <div>
                <div className="eyebrow" style={{ padding: '4px 6px' }}>Popular searches</div>
                <div className="row wrap gap6" style={{ padding: '0 6px' }}>{POPULAR_SEARCHES.map((r) => <button key={r} className="chip" onClick={() => submit(r)}>{r}</button>)}</div>
              </div>
              <div>
                <div className="eyebrow" style={{ padding: '4px 6px' }}>Browse categories</div>
                <div className="row wrap gap6" style={{ padding: '0 6px' }}>{BROWSE_CATEGORIES.map((r) => <button key={r} className="chip" onClick={() => submit(r)}>{r}</button>)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
