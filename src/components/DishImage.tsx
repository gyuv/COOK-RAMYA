import { useState } from 'react';
import { FoodArt } from './FoodArt';
import { photoFor } from '../data/images';

// Real photo for a dish when a VERIFIED one exists (curated in images.ts, or
// self-hosted in images.generated.ts produced by `npm run resolve-images`),
// otherwise the polished procedural FoodArt. No random/placeholder photo
// services — a wrong photo is worse than clean, on-brand art. The wrapper owns
// the aspect ratio, so there is never layout shift or a broken-image icon.
interface Props {
  id?: string;
  art: string;
  seed?: string;
  alt: string;
  name?: string; // kept for API compatibility; not used for a fallback photo
  className?: string;
  showCredit?: boolean;
  eager?: boolean;
}

export function DishImage({ id, art, seed, alt, className, showCredit, eager }: Props) {
  const photo = id ? photoFor(id) : undefined;
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!photo || failed) {
    return <FoodArt art={art} seed={seed ?? id} className={className} />;
  }

  return (
    <div className={`art ${className ?? ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
      {!loaded && <div style={{ position: 'absolute', inset: 0 }}><FoodArt art={art} seed={seed ?? id} /></div>}
      <img
        src={photo.src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: loaded ? 1 : 0, transition: 'opacity 0.4s var(--ease)' }}
      />
      {showCredit && loaded && (
        <span style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '0.62rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '2px 7px', borderRadius: 999, backdropFilter: 'blur(2px)' }}>{photo.credit}</span>
      )}
    </div>
  );
}
