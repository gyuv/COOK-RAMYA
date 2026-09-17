import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react';

// Scroll-reveal wrapper (IntersectionObserver). Adds `.in` when the element
// enters the viewport, once. `stagger` cascades the children's entrance.
// Honours reduced motion by revealing immediately (CSS also enforces this).
export function Reveal({
  children, as = 'div', className = '', stagger = false, style,
}: { children: ReactNode; as?: ElementType; className?: string; stagger?: boolean; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
      || document.documentElement.dataset.reduceMotion === 'true';
    if (reduce || typeof IntersectionObserver === 'undefined') { setInView(true); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { setInView(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${stagger ? 'stagger' : ''} ${inView ? 'in' : ''} ${className}`.trim()} style={style}>
      {children}
    </Tag>
  );
}
