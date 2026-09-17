import { useState } from 'react';
import { FoodArt } from './FoodArt';
import { photoFor, keywordPhoto, KEYWORD_CREDIT } from '../data/images';

// Real photo for every dish, via a cascade that guarantees no blank/dummy:
//   1. curated exact photo (IMAGES)  →  2. keyword-matched real food photo
//   →  3. procedural FoodArt (only if the network image can't load).
// The wrapper owns the aspect ratio, so there is never layout shift or a
// broken-image icon (sections 14 / 80).
interface Props {
  id?: string;
  art: string;
  seed?: string;
  alt: string;
  name?: string;       // dish/product name → drives the keyword photo
  className?: string;
  showCredit?: boolean;
  eager?: boolean;
}

export function DishImage({ id, art, seed, alt, name, className, showCredit, eager }: Props) {
  const curated = id ? photoFor(id) : undefined;
  const tiers: { src: string; credit: string }[] = [];
  if (curated) tiers.push(curated);
  if (name) tiers.push({ src: keywordPhoto(id ?? name, name), credit: KEYWORD_CREDIT });

  const [tier, setTier] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const current = tiers[tier];
  if (!current) return <FoodArt art={art} seed={seed ?? id} className={className} />;

  return (
    <div className={`art ${className ?? ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Art sits underneath as the placeholder until the photo decodes. */}
      {!loaded && <div style={{ position: 'absolute', inset: 0 }}><FoodArt art={art} seed={seed ?? id} /></div>}
      <img
        key={current.src}
        src={current.src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(false); setTier((t) => t + 1); }}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.4s var(--ease)',
        }}
      />
      {showCredit && loaded && (
        <span style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '0.62rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '2px 7px', borderRadius: 999, backdropFilter: 'blur(2px)' }}>{current.credit}</span>
      )}
    </div>
  );
}
