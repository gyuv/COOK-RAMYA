import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { Diet } from '../data/types';
import { formatMinutes } from '../hooks/useTick';

// ---------- Diet indicator (color + shape + label, never color alone) ----------
export function DietDot({ diet, showLabel }: { diet: Diet; showLabel?: boolean }) {
  const label = diet === 'nonveg' ? 'Non-veg' : diet === 'egg' ? 'Egg' : diet === 'vegan' ? 'Vegan' : diet === 'jain' ? 'Jain' : 'Veg';
  const cls = diet === 'nonveg' ? 'dot-nonveg' : diet === 'egg' ? 'dot-egg' : 'dot-veg';
  return (
    <span className="row" style={{ gap: 6 }} title={label}>
      <span className={`dot ${cls}`} aria-hidden="true" />
      {showLabel && <span style={{ fontSize: '0.78rem' }}>{label}</span>}
    </span>
  );
}

// ---------- Meta row: time · difficulty · diet ----------
export function MetaBits({ totalMin, difficulty, diet }: { totalMin: number; difficulty?: string; diet?: Diet }) {
  return (
    <div className="rc-meta">
      {diet && <DietDot diet={diet} />}
      <span>⏱ {formatMinutes(totalMin)}</span>
      {difficulty && <span>· {difficulty}</span>}
    </div>
  );
}

// ---------- Section header ----------
export function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action && (
        <button className="link" onClick={onAction} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>{action} →</button>
      )}
    </div>
  );
}

// ---------- Skeleton loader ----------
export function Skeleton({ h = 16, w = '100%', r = 8, style }: { h?: number | string; w?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div style={{ height: h, width: w, borderRadius: r, background: 'linear-gradient(90deg,#efe6d8,#f6efe4,#efe6d8)', backgroundSize: '200% 100%', animation: 'shimmer 1.3s linear infinite', ...style }} />;
}

// ---------- Empty state ----------
export function EmptyState({ emoji, title, body, action, onAction }: { emoji: string; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="card card-pad center" style={{ padding: '40px 24px', maxWidth: 460, margin: '0 auto' }}>
      <div style={{ fontSize: '2.6rem', marginBottom: 8 }} aria-hidden="true">{emoji}</div>
      <h3 style={{ fontSize: '1.3rem', marginBottom: 6 }}>{title}</h3>
      {body && <p className="muted" style={{ marginBottom: action ? 18 : 0 }}>{body}</p>}
      {action && <button className="btn btn-primary" onClick={onAction}>{action}</button>}
    </div>
  );
}

// ---------- Modal / bottom sheet ----------
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => { if (e.target === ref.current) onClose(); }} ref={ref}
      style={{ position: 'fixed', inset: 0, background: 'rgba(43,35,32,0.42)', backdropFilter: 'blur(2px)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ animation: 'sheetUp 0.34s var(--ease)', background: 'var(--surface)', width: '100%', maxWidth: wide ? 720 : 520, maxHeight: '88vh', overflowY: 'auto', borderRadius: '22px 22px 0 0', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--surface)', padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
          <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
          <button aria-label="Close" onClick={onClose} className="btn btn-ghost" style={{ padding: '6px 12px' }}>✕</button>
        </div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}

// ---------- Toast ----------
interface Toast { id: number; msg: string; }
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 'calc(var(--nav-h) + 16px)', zIndex: 200, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', pointerEvents: 'none' }} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} style={{ animation: 'toastIn 0.32s var(--ease)', background: 'var(--ink)', color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: '0.9rem', fontWeight: 500, boxShadow: 'var(--shadow-lg)', maxWidth: '90vw' }}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

// ---------- Progress bar ----------
export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height: 6, background: 'var(--ivory-2)', borderRadius: 999, overflow: 'hidden' }} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--terra),var(--gold))', transition: 'width 0.3s var(--ease)' }} />
    </div>
  );
}
