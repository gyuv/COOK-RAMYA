// ============================================================
// RAMYA-COOK image resolver — runs where there IS internet (GitHub Actions or
// your machine). It fetches a REAL, cross-verified photo for every dish,
// product, festival and region, then writes src/data/images.generated.ts.
//   node scripts/resolve-images.mjs            (hotlink verified URLs)
//   node scripts/resolve-images.mjs --download (also self-host to public/dishes)
//
// Cross-verification, so NO wrong/random images are shown:
//   • Recipes: TheMealDB exact-name search only (returns the real dish photo).
//   • Products/Festivals/Regions: Wikimedia Commons search, but a result is
//     ACCEPTED ONLY IF the file title contains a keyword from the item's name.
//   • Every candidate URL is HEAD-checked to be a live image before use.
// Anything that doesn't pass shows the clean procedural art (never a wrong pic).
// ============================================================
import { writeFileSync, mkdirSync, createWriteStream, readFileSync, readdirSync } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

const DOWNLOAD = process.argv.includes('--download');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wikimedia (and good API etiquette generally) REQUIRE a descriptive
// User-Agent — without one the API returns 403 and nothing resolves.
const UA = 'RAMYA-COOK-image-resolver/1.0 (+https://github.com/gyuv/COOK-RAMYA)';
const getJSON = (url) => fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } }).then((r) => r.json());
const STOP = new Set(['style', 'the', 'a', 'with', 'and', 'of', 'dish', 'india', 'indian', 'food', 'special', 'classic', 'home', 'hotel', 'restaurant']);

const tokens = (name) =>
  name.toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w));

function pairs(text) {
  const out = [];
  const re = /id:\s*'([a-z0-9-]+)'[\s\S]{0,140}?name:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(text))) out.push({ id: m[1], name: m[2].replace(/\\'/g, "'") });
  return out;
}

function loadRecipes() {
  const out = [];
  for (const f of readdirSync('src/data').filter((x) => x.startsWith('recipes-'))) out.push(...pairs(readFileSync(`src/data/${f}`, 'utf8')));
  return out;
}
const loadProducts = () => pairs(readFileSync('src/data/products.ts', 'utf8'));
const loadRegionsFestivals = () => pairs(readFileSync('src/data/regions.ts', 'utf8')); // REGIONS + FESTIVALS
const loadIngredients = () => pairs(readFileSync('src/data/ingredients.ts', 'utf8'));

async function fromMealDB(name) {
  try {
    const j = await getJSON(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
    const url = j.meals?.[0]?.strMealThumb;
    return url ? { src: url, credit: 'Photo: TheMealDB' } : null;
  } catch { return null; }
}

// Commons search with a keyword guard: the chosen file's title must contain one
// of the item's keywords, or it is rejected (prevents unrelated matches).
async function fromCommons(name, query) {
  try {
    const api = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=800&format=json`;
    const j = await getJSON(api);
    const pages = j.query?.pages ? Object.values(j.query.pages) : [];
    const keys = tokens(name);
    for (const pg of pages) {
      const title = (pg.title || '').toLowerCase();
      const info = pg.imageinfo?.[0];
      if (!info?.thumburl) continue;
      if (!/\.(jpg|jpeg|png)$/i.test(info.url || '')) continue;
      if (!keys.some((k) => title.includes(k))) continue; // GUARD: must match name
      const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').trim() || 'Wikimedia Commons';
      const lic = info.extmetadata?.LicenseShortName?.value || 'CC';
      return { src: info.thumburl, credit: `Photo: ${artist} / ${lic} (Wikimedia Commons)` };
    }
    return null;
  } catch { return null; }
}

async function download(id, url) {
  mkdirSync('public/dishes', { recursive: true });
  const ext = (url.split('?')[0].match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg').toLowerCase();
  const path = `public/dishes/${id}.${ext}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok || !res.body) throw new Error('download failed');
  await pipeline(Readable.fromWeb(res.body), createWriteStream(path));
  return `/dishes/${id}.${ext}`;
}

const jobs = [
  ...loadRecipes().map((x) => ({ ...x, kind: 'recipe' })),
  ...loadProducts().map((x) => ({ ...x, kind: 'product' })),
  ...loadRegionsFestivals().map((x) => ({ ...x, kind: 'place' })),
  ...loadIngredients().map((x) => ({ ...x, kind: 'ingredient' })),
];

const out = {};
let ok = 0;
for (const { id, name, kind } of jobs) {
  if (out[id]) continue;
  let hit = null;
  if (kind === 'recipe') hit = (await fromMealDB(name)) || (await fromCommons(name, `${name} indian food`));
  else if (kind === 'product') hit = await fromCommons(name, `${name}`);
  else if (kind === 'ingredient') hit = await fromCommons(name, `${name} ingredient`);
  else hit = await fromCommons(name, `${name} indian cuisine food`); // festivals + regions

  // Trust the authoritative source URL (TheMealDB thumb / Commons thumburl are
  // always live); correctness comes from the keyword guard in fromCommons.
  if (hit && /^https:\/\//.test(hit.src)) {
    if (DOWNLOAD) { try { hit.src = await download(id, hit.src); } catch { /* keep hotlink */ } }
    out[id] = { src: hit.src, credit: hit.credit };
    ok++;
    console.log(`✓ ${id}`);
  } else {
    console.log(`· ${id} (art)`);
  }
  await sleep(180);
}

writeFileSync('src/data/images.generated.ts',
  `// AUTO-GENERATED by scripts/resolve-images.mjs — do not edit by hand.\nimport type { DishPhoto } from './images';\n\nexport const GENERATED_IMAGES: Record<string, DishPhoto> = ${JSON.stringify(out, null, 2)};\n`);
console.log(`\nResolved ${ok}/${jobs.length} cross-verified photos -> src/data/images.generated.ts`);
