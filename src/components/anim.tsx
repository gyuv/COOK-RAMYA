import { useEffect, useRef, useState, type ReactNode } from 'react';

const prefersReduce = () =>
  (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches) ||
  document.documentElement.dataset.reduceMotion === 'true';

// ---- CountUp: animates a number into view (rAF, once) ----
export function CountUp({ to, duration = 1100, suffix = '', className }: { to: number; duration?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReduce() || typeof IntersectionObserver === 'undefined') { setN(to); return; }
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(to * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref} className={className}>{n}{suffix}</span>;
}

// ---- TypeCycle: rotating word with fade/slide in ----
export function TypeCycle({ words, interval = 2200, className }: { words: string[]; interval?: number; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReduce()) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);
  return <span className={`type-cycle ${className ?? ''}`}><span key={i} className="word">{words[i]}</span></span>;
}

// ---- Marquee: seamless horizontal ticker (duplicates content) ----
export function Marquee({ children }: { children: ReactNode }) {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <span style={{ display: 'inline-flex', gap: 10 }}>{children}</span>
        <span style={{ display: 'inline-flex', gap: 10 }}>{children}</span>
      </div>
    </div>
  );
}

// ---- ScrollProgress: top reading-progress bar ----
export function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? (h.scrollTop / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return <div className="scroll-progress" style={{ ['--progress' as string]: `${pct}%` }} />;
}

// ---- Global delegated effects: button ripple + spotlight cursor glow ----
export function useGlobalMotionEffects() {
  useEffect(() => {
    if (prefersReduce()) return;

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('.btn, .chip') as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement('span');
      span.className = 'ripple';
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      target.appendChild(span);
      window.setTimeout(() => span.remove(), 650);
    };

    const onMove = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest('.spotlight') as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };

    document.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMove);
    return () => { document.removeEventListener('click', onClick); document.removeEventListener('mousemove', onMove); };
  }, []);
}
