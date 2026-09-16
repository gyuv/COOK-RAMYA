import { Link, NavLink, useLocation } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import { useStore } from '../store/useStore';

function Logo() {
  return (
    <Link to="/" aria-label="RAMYA-COOK home" className="row" style={{ gap: 9, flexShrink: 0 }}>
      <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,var(--terra),var(--terra-dark))', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>R</span>
      <span style={{ display: 'grid', lineHeight: 1 }}>
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.12rem', letterSpacing: '-0.01em' }}>RAMYA-COOK</strong>
        <span style={{ fontSize: '0.64rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>Your kitchen, guided.</span>
      </span>
    </Link>
  );
}

const DESKTOP_LINKS = [
  { to: '/discover', label: 'Discover' },
  { to: '/regions', label: 'Regions' },
  { to: '/techniques', label: 'Techniques' },
  { to: '/collections', label: 'Collections' },
  { to: '/kitchen', label: 'My Kitchen' },
];

export function Header() {
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,246,239,0.88)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 'var(--header-h)' }}>
        <Logo />
        <nav className="desktop-only" style={{ display: 'flex', gap: 4, marginLeft: 8 }} aria-label="Primary">
          {DESKTOP_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => 'header-link' + (isActive ? ' active' : '')}
              style={({ isActive }) => ({ padding: '8px 12px', borderRadius: 999, fontWeight: 600, fontSize: '0.9rem', color: isActive ? 'var(--terra)' : 'var(--ink-2)' })}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', maxWidth: 460, marginLeft: 'auto' }}>
          <SearchBar variant="compact" />
        </div>
        <Link to="/profile" className="desktop-only" aria-label="Profile" style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--ivory-2)', placeItems: 'center', flexShrink: 0 }}>
          <span aria-hidden="true">👤</span>
        </Link>
      </div>
    </header>
  );
}

const NAV = [
  { to: '/', label: 'Home', icon: '🏠', exact: true },
  { to: '/discover', label: 'Discover', icon: '🧭' },
  { to: '/cook', label: 'Cook', icon: '🍳', primary: true },
  { to: '/saved', label: 'Saved', icon: '♥' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export function BottomNavigation() {
  const loc = useLocation();
  const hasSession = useStore((s) => Boolean(s.session));
  const isActive = (to: string, exact?: boolean) => (exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + '/'));
  return (
    <nav className="mobile-only bottom-nav" aria-label="Bottom navigation"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 'calc(var(--nav-h) + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)', background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--line)', display: 'flex', zIndex: 80 }}>
      {NAV.map((n) => {
        const act = isActive(n.to, n.exact);
        if (n.primary) {
          return (
            <Link key={n.to} to={n.to} aria-label={n.label} style={{ flex: 1, display: 'grid', placeItems: 'center', position: 'relative' }}>
              <span style={{ position: 'absolute', top: -18, width: 56, height: 56, borderRadius: '50%', background: hasSession ? 'linear-gradient(135deg,var(--green),#1f7a52)' : 'linear-gradient(135deg,var(--terra),var(--terra-dark))', display: 'grid', placeItems: 'center', color: '#fff', fontSize: '1.4rem', boxShadow: '0 6px 18px rgba(192,86,47,0.35)' }}>{n.icon}</span>
              <span style={{ marginTop: 30, fontSize: '0.66rem', fontWeight: 600, color: act ? 'var(--terra)' : 'var(--ink-3)' }}>{hasSession ? 'Resume' : n.label}</span>
            </Link>
          );
        }
        return (
          <Link key={n.to} to={n.to} aria-label={n.label} aria-current={act ? 'page' : undefined} style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 2, color: act ? 'var(--terra)' : 'var(--ink-3)' }}>
            <span aria-hidden="true" style={{ fontSize: '1.2rem' }}>{n.icon}</span>
            <span style={{ fontSize: '0.66rem', fontWeight: 600 }}>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
