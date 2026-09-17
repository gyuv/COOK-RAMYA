import { useEffect, useRef } from 'react';
import type { HeatLevel, StoveMethod, Step } from '../data/types';
import { useStore, timerRemaining } from '../store/useStore';
import { useTick, formatClock } from '../hooks/useTick';
import { useToast } from './ui';

// ---------- Heat control (sections 20 / 31) ----------
const HEAT_ORDER: HeatLevel[] = ['Off', 'Low', 'Medium-Low', 'Medium', 'Medium-High', 'High'];
const HEAT_COLORS = ['#cdb89a', 'var(--heat-1)', 'var(--heat-2)', 'var(--heat-3)', 'var(--heat-4)', 'var(--heat-5)'];

export function HeatControl({ level, tempC, method }: { level: HeatLevel; tempC?: [number, number]; method?: StoveMethod }) {
  const idx = HEAT_ORDER.indexOf(level);
  const flame = level === 'Off' ? 'Flame off' : `${level} flame`;
  return (
    <div className="card card-pad" style={{ display: 'grid', gap: 10 }}>
      <div className="row between">
        <span className="eyebrow">Heat</span>
        {method && <span className="pill">{method}</span>}
      </div>
      <div className="row" style={{ gap: 4 }} aria-label={`Heat level: ${level}`}>
        {HEAT_ORDER.slice(1).map((h, i) => (
          <div key={h} title={h} style={{ flex: 1, height: 12, borderRadius: 4, background: i < idx ? HEAT_COLORS[i + 1] : 'var(--ivory-2)', transition: 'background 0.2s' }} />
        ))}
      </div>
      <div className="row between">
        <strong style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>{level}</strong>
        <span className="muted" style={{ fontSize: '0.82rem' }}>🔥 {flame}</span>
      </div>
      {tempC && <div className="muted" style={{ fontSize: '0.82rem' }}>Recommended range: {tempC[0]}–{tempC[1]}°C (a guide — stoves, pans and quantities vary)</div>}
    </div>
  );
}

// ---------- Sensory cues (sections 25 / 34 / 35) ----------
export function SensoryCues({ step }: { step: Step }) {
  const cues: [string, string, string][] = [];
  if (step.see) cues.push(['👁', 'Look for', step.see]);
  if (step.hear) cues.push(['👂', 'Listen for', step.hear]);
  if (step.smell) cues.push(['👃', 'Smell for', step.smell]);
  if (step.feel) cues.push(['✋', 'Feel for', step.feel]);
  if (!cues.length) return null;
  return (
    <div className="grid grid-2" style={{ gap: 10 }}>
      {cues.map(([icon, label, text]) => (
        <div key={label} className="card card-pad" style={{ padding: 12, background: 'var(--surface-2)' }}>
          <div className="row gap6" style={{ marginBottom: 3 }}><span aria-hidden="true">{icon}</span><span className="eyebrow" style={{ color: 'var(--ink-3)' }}>{label}</span></div>
          <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>{text}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Alarm sound (WebAudio; no asset needed) ----------
function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = new Ctx();
    [0, 0.28, 0.56].forEach((t) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, ac.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.3, ac.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + t + 0.22);
      o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.24);
    });
    if ('vibrate' in navigator) navigator.vibrate?.([200, 100, 200]);
  } catch { /* audio not available */ }
}

// ---------- Single timer control ----------
export function TimerRow({ id, now }: { id: string; now: number }) {
  const t = useStore((s) => s.timers.find((x) => x.id === id));
  const { pauseTimer, resumeTimer, bumpTimer, removeTimer } = useStore.getState();
  if (!t) return null;
  const remaining = timerRemaining(t, now);
  const done = remaining <= 0;
  const pct = t.durationSec > 0 ? Math.min(100, ((t.durationSec - remaining) / t.durationSec) * 100) : 100;
  return (
    <div className="card card-pad" style={{ padding: 12, borderColor: done ? 'var(--terra)' : 'var(--line)', display: 'grid', gap: 8, animation: done && !t.doneAcked ? 'pulse-ring 1.4s infinite' : undefined }}>
      <div className="row between">
        <strong style={{ fontSize: '0.92rem' }}>{t.label}</strong>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: '1.35rem', fontWeight: 700, color: done ? 'var(--terra)' : 'var(--ink)' }}>{done ? "Time's up" : formatClock(remaining)}</span>
      </div>
      <div style={{ height: 5, background: 'var(--ivory-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: done ? 'var(--terra)' : 'linear-gradient(90deg,var(--gold),var(--terra))' }} />
      </div>
      <div className="row wrap gap6">
        {!done && (t.running
          ? <button className="chip" onClick={() => pauseTimer(id)}>⏸ Pause</button>
          : <button className="chip" onClick={() => resumeTimer(id)}>▶ Resume</button>)}
        <button className="chip" onClick={() => bumpTimer(id, 30)}>+30s</button>
        <button className="chip" onClick={() => bumpTimer(id, 60)}>+1 min</button>
        <button className="chip" onClick={() => removeTimer(id)} style={{ marginLeft: 'auto' }}>{done ? 'Dismiss' : 'Cancel'}</button>
      </div>
    </div>
  );
}

// ---------- Add-timer button ----------
export function StartTimerButton({ label, seconds }: { label: string; seconds: number }) {
  const addTimer = useStore((s) => s.addTimer);
  const toast = useToast();
  return (
    <button className="btn btn-primary" onClick={() => { addTimer(label, seconds); toast(`Timer started: ${label}`); }}>
      ▶ Start timer · {formatClock(seconds)}
    </button>
  );
}

// ---------- Global floating timer dock ----------
export function TimerDock() {
  const timers = useStore((s) => s.timers);
  const ackTimer = useStore((s) => s.ackTimer);
  const active = timers.length > 0;
  const now = useTick(active, 500);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    for (const t of timers) {
      const remaining = timerRemaining(t, now);
      if (remaining <= 0 && !t.doneAcked && !firedRef.current.has(t.id)) {
        firedRef.current.add(t.id);
        beep();
        if ('Notification' in window && Notification.permission === 'granted') {
          try { new Notification('RAMYA-COOK timer', { body: `${t.label} is done` }); } catch { /* ignore */ }
        }
        ackTimer(t.id);
      }
      if (remaining > 0) firedRef.current.delete(t.id);
    }
  }, [timers, now, ackTimer]);

  if (!active) return null;
  return (
    <div style={{ position: 'fixed', right: 12, bottom: 'calc(var(--nav-h) + 12px)', width: 'min(320px, calc(100vw - 24px))', zIndex: 90, display: 'grid', gap: 8 }}>
      {timers.map((t) => <TimerRow key={t.id} id={t.id} now={now} />)}
    </div>
  );
}
