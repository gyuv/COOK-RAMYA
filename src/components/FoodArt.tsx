import { memo } from 'react';

// Procedural "food art" — tasteful flat SVG illustrations generated from an
// art key. No external images means no broken images, no hotlinked/copyrighted
// assets, and full offline support (sections 14 / 63 / 80). Warm, premium
// palette consistent with the design system.

type Motif =
  | 'dosa' | 'idli' | 'vada' | 'bowl' | 'rice' | 'noodles' | 'sweet' | 'drink'
  | 'flatbread' | 'snack' | 'biryani' | 'dumpling' | 'thali' | 'appam' | 'puttu'
  | 'idiyappam' | 'paniyaram' | 'ingredient' | 'chilli' | 'leaf' | 'pack'
  | 'region' | 'festival' | 'pan';

interface Palette { bg: string; bg2: string; a: string; b: string; c: string; }

// Warm, non-neon palettes keyed to a dish "mood".
const PALETTES: Record<string, Palette> = {
  savory: { bg: '#f7ece0', bg2: '#f1e0cd', a: '#c0562f', b: '#e0a92e', c: '#8a4a2b' },
  veg:    { bg: '#eaf1e7', bg2: '#dcebd6', a: '#2f9e6f', b: '#7cae4a', c: '#c0562f' },
  sweet:  { bg: '#f7ecdc', bg2: '#f6e2c6', a: '#d99e2b', b: '#c0562f', c: '#b07a3a' },
  drink:  { bg: '#efe6da', bg2: '#e4d4bf', a: '#8a5a2b', b: '#c9a06a', c: '#5c3a1e' },
  cream:  { bg: '#f8f2e6', bg2: '#efe3cc', a: '#e0a92e', b: '#c0562f', c: '#b79b6a' },
  bread:  { bg: '#f4e9d6', bg2: '#ebd9bd', a: '#c08a45', b: '#8a5a2b', c: '#e0a92e' },
  cool:   { bg: '#e8f0ee', bg2: '#d8e8e2', a: '#2f9e6f', b: '#3f8f9e', c: '#c0562f' },
  spice:  { bg: '#f6e6dd', bg2: '#f0d3c2', a: '#cf3b30', b: '#e0a92e', c: '#8a3421' },
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return Math.abs(h);
}

function resolve(art: string): { motif: Motif; pal: Palette } {
  const a = art.toLowerCase();
  const p = (k: keyof typeof PALETTES) => PALETTES[k];

  if (a.startsWith('pack')) return { motif: 'pack', pal: p('cream') };
  if (a.startsWith('region')) return { motif: 'region', pal: p('savory') };
  if (a.startsWith('fest')) return { motif: 'festival', pal: p('spice') };

  const map: Record<string, { motif: Motif; pal: Palette }> = {
    dosa: { motif: 'dosa', pal: p('savory') },
    idli: { motif: 'idli', pal: p('cream') },
    vada: { motif: 'vada', pal: p('savory') },
    sambar: { motif: 'bowl', pal: p('savory') },
    rasam: { motif: 'bowl', pal: p('spice') },
    curry: { motif: 'bowl', pal: p('spice') },
    kuzhambu: { motif: 'bowl', pal: p('spice') },
    kootu: { motif: 'bowl', pal: p('veg') },
    chutney: { motif: 'bowl', pal: p('veg') },
    poriyal: { motif: 'bowl', pal: p('veg') },
    avial: { motif: 'bowl', pal: p('veg') },
    porridge: { motif: 'bowl', pal: p('cream') },
    rice: { motif: 'rice', pal: p('cream') },
    biryani: { motif: 'biryani', pal: p('savory') },
    noodles: { motif: 'noodles', pal: p('savory') },
    sweet: { motif: 'sweet', pal: p('sweet') },
    drink: { motif: 'drink', pal: p('drink') },
    flatbread: { motif: 'flatbread', pal: p('bread') },
    snack: { motif: 'snack', pal: p('savory') },
    dumpling: { motif: 'dumpling', pal: p('cream') },
    thali: { motif: 'thali', pal: p('savory') },
    appam: { motif: 'appam', pal: p('cream') },
    puttu: { motif: 'puttu', pal: p('cream') },
    idiyappam: { motif: 'idiyappam', pal: p('cream') },
    paniyaram: { motif: 'paniyaram', pal: p('savory') },
    coconut: { motif: 'ingredient', pal: p('cream') },
    herb: { motif: 'leaf', pal: p('veg') },
    leaf: { motif: 'leaf', pal: p('veg') },
    seeds: { motif: 'ingredient', pal: p('spice') },
    lentil: { motif: 'ingredient', pal: p('cream') },
    grain: { motif: 'ingredient', pal: p('cream') },
    chilli: { motif: 'chilli', pal: p('spice') },
    veg: { motif: 'ingredient', pal: p('veg') },
    other: { motif: 'ingredient', pal: p('savory') },
    // techniques
    tadka: { motif: 'pan', pal: p('spice') }, saute: { motif: 'pan', pal: p('savory') },
    dum: { motif: 'biryani', pal: p('savory') }, cooker: { motif: 'pan', pal: p('savory') },
    roast: { motif: 'pan', pal: p('spice') }, fry: { motif: 'pan', pal: p('savory') },
    steam: { motif: 'idli', pal: p('cream') }, ferment: { motif: 'bowl', pal: p('cream') },
    grind: { motif: 'bowl', pal: p('veg') }, simmer: { motif: 'bowl', pal: p('spice') },
    marinate: { motif: 'bowl', pal: p('savory') }, panfry: { motif: 'pan', pal: p('savory') },
    // equipment
    kadai: { motif: 'pan', pal: p('savory') }, tawa: { motif: 'pan', pal: p('savory') },
    'idli-stand': { motif: 'idli', pal: p('cream') }, mixie: { motif: 'pan', pal: p('cool') },
    grinder: { motif: 'pan', pal: p('cool') }, 'appam-pan': { motif: 'appam', pal: p('cream') },
    'paniyaram-pan': { motif: 'paniyaram', pal: p('savory') }, airfryer: { motif: 'pan', pal: p('cool') },
    oven: { motif: 'pan', pal: p('savory') },
  };
  return map[a] ?? { motif: 'bowl', pal: p('savory') };
}

function Motif({ motif, pal, seed }: { motif: Motif; pal: Palette; seed: number }) {
  const jitter = (seed % 7) - 3;
  switch (motif) {
    case 'dosa':
      return (<g>
        <ellipse cx="50" cy="70" rx="34" ry="7" fill={pal.c} opacity="0.15" />
        <path d="M18 66 Q50 30 82 66 Q66 60 50 62 Q34 60 18 66 Z" fill={pal.b} />
        <path d="M22 64 Q50 40 78 64 Q64 58 50 60 Q36 58 22 64 Z" fill={pal.a} opacity="0.85" />
        <circle cx="40" cy="58" r="1.6" fill={pal.c} /><circle cx="56" cy="56" r="1.4" fill={pal.c} /><circle cx="63" cy="60" r="1.2" fill={pal.c} />
      </g>);
    case 'idli':
      return (<g>
        <ellipse cx="50" cy="72" rx="36" ry="7" fill={pal.c} opacity="0.12" />
        {[30, 50, 70].map((x, i) => (<g key={x}><ellipse cx={x} cy={60 - (i === 1 ? 4 : 0)} rx="13" ry="11" fill="#fff" /><ellipse cx={x} cy={57 - (i === 1 ? 4 : 0)} rx="10" ry="7" fill="#fffdf7" /></g>))}
      </g>);
    case 'vada':
      return (<g>
        <ellipse cx="50" cy="68" rx="30" ry="7" fill={pal.c} opacity="0.15" />
        <circle cx="50" cy="52" r="24" fill={pal.b} /><circle cx="50" cy="52" r="24" fill="none" stroke={pal.c} strokeWidth="1.5" opacity="0.4" />
        <circle cx="50" cy="52" r="7" fill={pal.bg} /><circle cx="50" cy="50" r="20" fill={pal.a} opacity="0.25" />
      </g>);
    case 'bowl':
      return (<g>
        <path d="M22 46 H78 A28 28 0 0 1 22 46 Z" fill="#fff" />
        <path d="M26 46 H74 A24 22 0 0 1 26 46 Z" fill={pal.a} />
        <ellipse cx="50" cy="46" rx="28" ry="5.5" fill="#fff" /><ellipse cx="50" cy="46" rx="24" ry="4.2" fill={pal.a} />
        <circle cx={42 + jitter} cy="45" r="2.2" fill={pal.b} /><circle cx="57" cy="44" r="1.8" fill={pal.c} opacity="0.6" />
        <path d="M60 40 q4 -3 8 0" stroke={pal.c} strokeWidth="1.4" fill="none" opacity="0.5" />
      </g>);
    case 'rice':
      return (<g>
        <ellipse cx="50" cy="66" rx="34" ry="8" fill={pal.c} opacity="0.12" />
        <path d="M20 64 Q50 30 80 64 Z" fill="#fff" /><path d="M26 62 Q50 40 74 62 Z" fill={pal.bg2} />
        {Array.from({ length: 7 }).map((_, i) => (<ellipse key={i} cx={34 + i * 5} cy={54 + ((i * 7 + seed) % 6)} rx="2.4" ry="1.1" fill={pal.b} opacity="0.7" transform={`rotate(${(i * 40 + seed) % 90} ${34 + i * 5} 54)`} />))}
      </g>);
    case 'biryani':
      return (<g>
        <path d="M24 40 H76 V58 A26 12 0 0 1 24 58 Z" fill={pal.c} />
        <ellipse cx="50" cy="40" rx="26" ry="8" fill="#fff" /><ellipse cx="50" cy="40" rx="22" ry="6" fill={pal.bg2} />
        {Array.from({ length: 6 }).map((_, i) => (<ellipse key={i} cx={34 + i * 6} cy={39 + ((i + seed) % 3)} rx="2.6" ry="1.1" fill={i % 2 ? pal.b : pal.a} transform={`rotate(${(i * 50) % 80} ${34 + i * 6} 39)`} />))}
        <circle cx="44" cy="38" r="2" fill={pal.a} /><path d="M58 34 q3 -3 6 0" stroke={pal.b} strokeWidth="1.4" fill="none" />
      </g>);
    case 'noodles':
      return (<g>
        <path d="M24 48 H76 A26 14 0 0 1 24 48 Z" fill="#fff" />
        {Array.from({ length: 5 }).map((_, i) => (<path key={i} d={`M${30 + i * 4} 44 q6 ${6 + (i % 2) * 4} 12 0 q6 -6 12 0`} stroke={pal.b} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.9" />))}
        <circle cx="40" cy="42" r="2" fill={pal.a} /><circle cx="60" cy="43" r="2" fill={pal.c} />
      </g>);
    case 'sweet':
      return (<g>
        <ellipse cx="50" cy="70" rx="26" ry="6" fill={pal.c} opacity="0.15" />
        <rect x="34" y="42" width="32" height="26" rx="5" transform="rotate(45 50 55)" fill={pal.a} />
        <rect x="40" y="48" width="20" height="14" rx="3" transform="rotate(45 50 55)" fill={pal.b} opacity="0.7" />
      </g>);
    case 'drink':
      return (<g>
        <path d="M38 34 H62 L59 72 A3 3 0 0 1 56 74 H44 A3 3 0 0 1 41 72 Z" fill="#fff" />
        <path d="M40 40 H60 L58 68 A2 2 0 0 1 56 70 H44 A2 2 0 0 1 42 68 Z" fill={pal.a} />
        <ellipse cx="50" cy="36" rx="12" ry="3.5" fill="#fff" /><ellipse cx="50" cy="36" rx="9" ry="2.4" fill={pal.b} opacity="0.7" />
      </g>);
    case 'flatbread':
      return (<g>
        <ellipse cx="50" cy="66" rx="32" ry="7" fill={pal.c} opacity="0.12" />
        {[60, 54, 48].map((y, i) => (<ellipse key={y} cx={50 + (i - 1) * 3} cy={y} rx={30 - i * 3} ry={9 - i} fill={i === 0 ? pal.b : pal.a} opacity={0.7 + i * 0.1} />))}
        <circle cx="44" cy="47" r="1.5" fill={pal.c} /><circle cx="58" cy="49" r="1.5" fill={pal.c} />
      </g>);
    case 'snack':
      return (<g>
        <ellipse cx="50" cy="70" rx="26" ry="6" fill={pal.c} opacity="0.14" />
        <circle cx="50" cy="50" r="22" fill="none" stroke={pal.a} strokeWidth="5" />
        <circle cx="50" cy="50" r="13" fill="none" stroke={pal.b} strokeWidth="5" />
        <circle cx="50" cy="50" r="4.5" fill="none" stroke={pal.a} strokeWidth="4" />
      </g>);
    case 'dumpling':
      return (<g>
        <ellipse cx="50" cy="70" rx="24" ry="6" fill={pal.c} opacity="0.14" />
        <path d="M30 66 Q34 38 50 26 Q66 38 70 66 Z" fill="#fff" />
        <path d="M36 64 Q40 44 50 34 Q60 44 64 64 Z" fill={pal.bg2} />
        {Array.from({ length: 5 }).map((_, i) => (<path key={i} d={`M${38 + i * 6} 64 Q50 40 ${62 - i * 6} 30`} stroke={pal.b} strokeWidth="0.8" fill="none" opacity="0.5" />))}
      </g>);
    case 'thali':
      return (<g>
        <circle cx="50" cy="52" r="34" fill="#fff" /><circle cx="50" cy="52" r="34" fill="none" stroke={pal.c} strokeWidth="1" opacity="0.2" />
        <circle cx="50" cy="52" r="12" fill={pal.bg2} />
        {[0, 60, 120, 180, 240, 300].map((deg) => { const r = 22; const x = 50 + r * Math.cos((deg * Math.PI) / 180); const y = 52 + r * Math.sin((deg * Math.PI) / 180); return <circle key={deg} cx={x} cy={y} r="7" fill={deg % 120 === 0 ? pal.a : pal.b} opacity="0.85" />; })}
      </g>);
    case 'appam':
      return (<g>
        <ellipse cx="50" cy="60" rx="34" ry="16" fill="#fff" /><ellipse cx="50" cy="58" rx="30" ry="13" fill={pal.bg2} />
        <circle cx="50" cy="56" r="12" fill="#fff" /><circle cx="50" cy="56" r="12" fill={pal.b} opacity="0.25" />
      </g>);
    case 'puttu':
      return (<g>
        <rect x="38" y="30" width="24" height="42" rx="6" fill="#fff" />
        {[36, 46, 56, 66].map((y) => (<g key={y}><rect x="38" y={y} width="24" height="4" fill={pal.b} opacity="0.5" /><rect x="38" y={y + 4} width="24" height="6" fill="#fffdf7" /></g>))}
      </g>);
    case 'idiyappam':
      return (<g>
        <ellipse cx="50" cy="60" rx="30" ry="16" fill="#fff" />
        {Array.from({ length: 6 }).map((_, i) => (<ellipse key={i} cx="50" cy="56" rx={26 - i * 3} ry={13 - i * 1.5} fill="none" stroke={pal.bg2} strokeWidth="2" />))}
      </g>);
    case 'paniyaram':
      return (<g>
        <path d="M24 44 H76 V50 A26 14 0 0 1 24 50 Z" fill={pal.c} opacity="0.5" />
        {[36, 50, 64].map((x, i) => (<circle key={x} cx={x} cy={44 - (i === 1 ? 2 : 0)} r="9" fill={pal.a} />))}
        {[36, 50, 64].map((x, i) => (<circle key={x} cx={x} cy={42 - (i === 1 ? 2 : 0)} r="5" fill={pal.b} opacity="0.6" />))}
      </g>);
    case 'chilli':
      return (<g>
        <path d="M40 30 q6 4 4 12 q10 20 -6 32 q-14 -10 -6 -30 q0 -8 8 -14 Z" fill={pal.a} />
        <path d="M40 30 q4 -6 10 -4" stroke={pal.b} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>);
    case 'leaf':
      return (<g>
        <path d="M50 24 Q74 40 50 78 Q26 40 50 24 Z" fill={pal.a} />
        <path d="M50 26 V76" stroke={pal.bg} strokeWidth="1.6" />
        {[36, 46, 56, 66].map((y) => (<g key={y}><path d={`M50 ${y} Q60 ${y - 4} 64 ${y - 8}`} stroke={pal.bg} strokeWidth="1" fill="none" /><path d={`M50 ${y} Q40 ${y - 4} 36 ${y - 8}`} stroke={pal.bg} strokeWidth="1" fill="none" /></g>))}
      </g>);
    case 'ingredient':
      return (<g>
        <ellipse cx="50" cy="70" rx="24" ry="6" fill={pal.c} opacity="0.14" />
        <circle cx="42" cy="52" r="15" fill={pal.a} /><circle cx="60" cy="56" r="12" fill={pal.b} /><circle cx="54" cy="44" r="10" fill={pal.c} opacity="0.85" />
      </g>);
    case 'pack':
      return (<g>
        <rect x="32" y="26" width="36" height="50" rx="4" fill="#fff" stroke={pal.c} strokeWidth="1.4" opacity="0.95" />
        <rect x="32" y="26" width="36" height="16" rx="4" fill={pal.a} />
        <rect x="38" y="48" width="24" height="22" rx="3" fill={pal.bg2} />
        <circle cx="50" cy="59" r="7" fill={pal.b} opacity="0.8" />
        <rect x="38" y="34" width="18" height="3" rx="1.5" fill="#fff" opacity="0.8" />
      </g>);
    case 'region':
      return (<g>
        <path d="M30 66 L38 40 L50 30 L64 38 L70 64 Z" fill={pal.a} opacity="0.85" />
        <path d="M50 30 L50 22 L54 26" stroke={pal.c} strokeWidth="2" fill="none" />
        <rect x="44" y="52" width="12" height="14" fill={pal.b} /><path d="M42 52 L50 44 L58 52 Z" fill={pal.c} />
      </g>);
    case 'festival':
      return (<g>
        <path d="M32 56 Q50 66 68 56 Q66 66 50 68 Q34 66 32 56 Z" fill={pal.a} />
        <ellipse cx="50" cy="56" rx="18" ry="4" fill={pal.c} opacity="0.4" />
        <path d="M50 52 Q46 40 50 30 Q54 40 50 52 Z" fill={pal.b} />
        <circle cx="50" cy="30" r="3" fill="#fff" />
      </g>);
    case 'pan':
      return (<g>
        <ellipse cx="48" cy="52" rx="26" ry="9" fill={pal.c} />
        <ellipse cx="48" cy="49" rx="26" ry="9" fill="#5a4a3f" />
        <ellipse cx="48" cy="48" rx="21" ry="6.5" fill={pal.a} opacity="0.6" />
        <rect x="72" y="47" width="20" height="5" rx="2.5" fill="#5a4a3f" />
        <path d="M40 40 q3 -6 0 -12 M50 40 q3 -6 0 -12" stroke={pal.b} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>);
    default:
      return null;
  }
}

interface Props { art: string; seed?: string; className?: string; rounded?: boolean; }

export const FoodArt = memo(function FoodArt({ art, seed = '', className, rounded }: Props) {
  const { motif, pal } = resolve(art);
  const s = hash(art + seed);
  return (
    <div className={`art ${className ?? ''}`} aria-hidden="true" style={{ background: `radial-gradient(120% 120% at 30% 20%, ${pal.bg} 0%, ${pal.bg2} 100%)`, borderRadius: rounded ? 'inherit' : undefined }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" role="img">
        <Motif motif={motif} pal={pal} seed={s} />
      </svg>
    </div>
  );
});
