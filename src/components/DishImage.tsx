import { useState } from 'react';
import { FoodArt } from './FoodArt';
import { photoFor } from '../data/images';

// Renders a real dish photo when one is configured for `id`, otherwise (or if
// the photo fails to load) the procedural FoodArt. Guarantees no broken images
// and no layout shift — the wrapper owns the aspect ratio (sections 14/80).
interface Props {
  id?: string;
  art: string;
  seed?: string;
  alt: string;
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
      {/* Art shows underneath until the photo has decoded (acts as the placeholder). */}
      {!loaded && <div style={{ position: 'absolute', inset: 0 }}><FoodArt art={art} seed={seed ?? id} /></div>}
      <img
        src={photo.src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          opacity: loaded ? 1 : 0, transition: 'opacity 0.4s var(--ease)',
        }}
      />
      {showCredit && loaded && (
        <span style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '0.62rem', color: '#fff', background: 'rgba(0,0,0,0.4)', padding: '2px 7px', borderRadius: 999, backdropFilter: 'blur(2px)' }}>{photo.credit}</span>
      )}
    </div>
  );
}
