import { useState, useRef, useEffect } from 'react';
import { askLocal, CHEF_SUGGESTIONS, type ChefReply } from '../lib/ai';
import { useStore } from '../store/useStore';
import { recipeById } from '../data/recipes';
import { useSeo } from '../hooks/useSeo';

interface Msg { role: 'user' | 'chef'; text: string; bullets?: string[] }

export default function AIChef() {
  useSeo('RAMYA AI Chef', 'Ask the on-device RAMYA AI Chef for substitutions, fixes, scaling and cooking help.');
  const session = useStore((s) => s.session);
  const recipe = session ? recipeById(session.recipeId) : undefined;
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'chef',
    text: recipe ? `I can see you're cooking ${recipe.name}. Ask me anything — substitutions, fixes, scaling, or what to do next.` : 'Namaste! I\'m RAMYA AI Chef. Ask me about substitutions, fixing a dish, scaling servings or techniques.',
  }]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const reply: ChefReply = askLocal(q, { recipe, stepIndex: session?.stepIndex });
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'chef', text: reply.text, bullets: reply.bullets }]);
    setInput('');
  };

  return (
    <div className="container fade-up" style={{ paddingTop: 18, maxWidth: 720, display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - var(--header-h) - var(--nav-h))' }}>
      <div className="row gap8" style={{ marginBottom: 8 }}>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,var(--terra),var(--terra-dark))', display: 'grid', placeItems: 'center', fontSize: '1.2rem' }} aria-hidden="true">👩‍🍳</span>
        <div><h1 style={{ fontSize: '1.3rem' }}>RAMYA AI Chef</h1><span className="muted" style={{ fontSize: '0.78rem' }}>On-device · private · no data leaves your kitchen</span></div>
      </div>

      <div style={{ flex: 1, display: 'grid', gap: 10, alignContent: 'start', padding: '10px 0' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ justifySelf: m.role === 'user' ? 'end' : 'start', maxWidth: '88%' }}>
            <div className={m.role === 'user' ? '' : 'card'} style={{ background: m.role === 'user' ? 'var(--terra)' : 'var(--surface)', color: m.role === 'user' ? '#fff' : 'var(--ink)', padding: '11px 15px', borderRadius: 16, borderBottomRightRadius: m.role === 'user' ? 4 : 16, borderBottomLeftRadius: m.role === 'chef' ? 4 : 16, boxShadow: m.role === 'chef' ? 'var(--shadow-sm)' : undefined }}>
              <div style={{ lineHeight: 1.5 }}>{m.text}</div>
              {m.bullets && <ul style={{ marginTop: 8, display: 'grid', gap: 6, paddingLeft: 18, listStyle: 'disc' }}>{m.bullets.map((b, j) => <li key={j} style={{ lineHeight: 1.45 }}>{b}</li>)}</ul>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div style={{ position: 'sticky', bottom: 'calc(var(--nav-h) + 8px)', paddingTop: 8 }}>
        <div className="row wrap gap6" style={{ marginBottom: 8 }}>
          {CHEF_SUGGESTIONS.slice(0, 4).map((s) => <button key={s} className="chip" onClick={() => send(s)}>{s}</button>)}
        </div>
        <div className="row gap8" style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 999, padding: '4px 6px 4px 16px', boxShadow: 'var(--shadow-sm)' }}>
          <input className="input" style={{ border: 'none', background: 'transparent', padding: '10px 0' }} placeholder="Ask the chef…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} />
          <button className="btn btn-primary" onClick={() => send(input)}>Send</button>
        </div>
        <p className="muted center" style={{ fontSize: '0.72rem', marginTop: 6 }}>Rule-based assistant. A future version can connect to a secure AI endpoint (no keys in the browser).</p>
      </div>
    </div>
  );
}
