# RAMYA-COOK

### _Your kitchen, guided._

An **India-first premium cooking platform** with a strong focus on **South Indian cuisine** — a digital kitchen companion that takes you from **Search → Choose your version → Prepare → Cook step by step → Understand why → Fix mistakes → Save → Cook again.**

> _Amma's kitchen wisdom + professional chef guidance + modern technology._

Built as a **mobile-first, offline-ready PWA** with **Vite + React + TypeScript** — zero backend, Vercel-free-tier friendly, and architected to become an Android app later.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build → dist/
npm run preview    # preview the production build
npm run typecheck  # type-check only
```

No environment variables are required — the whole app runs client-side. See `.env.example` for future server features.

---

## What's inside

- **140 real Indian recipes**, no lorem ipsum, spanning Tamil Nadu, Kerala, Karnataka, Andhra/Telangana, and North/West/East India, each modelled as **Country → Region → State → Cuisine → Dish → Variation**.
- **Recipe families**: search _Maggi_ → **25 ways to make Maggi**; _Dosa_ → 15 variations; full Sambar, Rasam, Idli, Biryani, Pongal families, and more.
- **Structured cooking graph**: every step carries heat, flame level, temperature ranges, timers, sensory cues (look/listen/smell/feel), doneness cues, "why this step" science, and parallel tasks.
- **Guided cooking** with mise-en-place, immersive step screen, swipe navigation, and a **timestamp-based multi-timer engine** that survives refresh, backgrounding and sleep.
- **RAMYA AI Chef** (on-device, rule-based), **Fix My Dish**, **Smart Substitutions**, **What Can I Cook?**, **Use My Leftovers**, **Pantry**, **Shopping List** (aisle-grouped, duplicates merged), **Meal Planner + South Indian Menu Builder**, **Techniques library**, **Regional browsing**, **Festival collections**, **Equipment / My Kitchen**, **Beginner/Chef modes**, cooking **history, ratings & personal notes**.

---

## Architecture

```
src/
  data/        Recipes, products, ingredients, techniques, equipment, regions,
               festivals, rescue library — plain typed data, UI-independent
               (a future DatabaseRecipeRepository could replace this module).
  lib/         Business logic: search engine, recommendation engine, serving
               scaling, shopping intelligence, AI chef, local-storage layer.
  store/       Zustand store: saved/history/notes/pantry/shopping/meal-plan/
               prefs/timers/cooking-session — all persisted locally.
  hooks/       useTick (timer repaint), useSeo (title + Recipe JSON-LD).
  components/  Design-system components + FoodArt (procedural SVG imagery).
  pages/       Route screens (lazy-loaded for a small initial bundle).
  styles/      Centralized design tokens (colors, type, spacing, radius, shadow).
```

**Design system** — warm ivory / white / charcoal with terracotta & olive-green accents, Fraunces (display) + Inter (UI), consistent tokens. No neon, no excessive gradients.

**Imagery** — all food/product/region art is **procedural inline SVG** keyed by dish type. No broken images, no hotlinked or copyrighted assets, fully offline. Swap `FoodArt` for licensed photography later without touching data or pages.

**PWA** — web manifest, SVG icons, theme color, standalone mode, and a service worker that precaches the app shell so cooking works with weak/no connectivity.

**SEO** — deep-linkable clean URLs (`/recipes/masala-dosa`), per-page `<title>`/meta, canonical, Recipe **JSON-LD** structured data, `robots.txt`, and a generated `sitemap.xml` (227 URLs). _(Note: this is a client-rendered SPA; a future Next.js migration would add true SSR — see limitations.)_

---

## Feature status

**Implemented (functional):** search + grouped autocomplete (typo/plural tolerant), recipe families & variations, product pages, serving calculator with sensible rounding, staged ingredients + ingredient intelligence, aisle-grouped shopping list with de-duping, guided cooking (mise-en-place → steps → plate → rate → note → save), heat control, multi-timer engine with persistence & alarm, sensory & doneness cues, why-this-step, parallel tasks, deterministic recommendations, "what can I cook", leftovers, pantry, meal planner + menu builder, techniques library + tadka visual guide, regional browsing, festival collections, equipment/my-kitchen, beginner/chef modes, history/ratings/notes, saved cookbook, error boundary, empty/loading/404 states, PWA install.

**Mocked (clearly local, not real infra):** RAMYA AI Chef (on-device rule-based, not an LLM); nutrition values (labelled estimates); recipe "stories" (general cultural context).

**Future-ready (abstractions in place, not built):** secure server AI endpoint (`/api/chef`), database repository, auth, hosted search service, voice control, camera/ingredient vision, budget price feed, smart-kitchen devices.

---

## Build status

- `npm run typecheck` — passes (TypeScript strict).
- `npm run build` — passes; pages code-split, initial JS ~135 KB gzip.
- Headless smoke tests pass for all key routes and the full **search → family → recipe → guided cook → rate → save → shopping** journey.

---

---

## Motion & micro-interactions

An original premium-motion layer (CSS + IntersectionObserver, all my own — not copied from any UI kit) with **30+ animations**, each gated on `prefers-reduced-motion` and the in-app "Reduce motion" toggle:

1. Page/section fade-up entrance · 2. Scroll-reveal (IntersectionObserver) · 3. Staggered grid children · 4. Horizontal card-row reveal · 5. Card image zoom-on-hover · 6. Card title colour shift · 7. Card 3D tilt/lift · 8. Save-heart pop · 9. Save-heart burst · 10. Save hover scale · 11. Button light sheen · 12. Button ripple · 13. Chip press scale · 14. Animated link underline · 15. Section-header link underline · 16. Hero floating blobs · 17. Hero gradient-text shimmer · 18. Type-cycle rotating dish name · 19. Trending marquee ticker · 20. Count-up stats · 21. Top scroll-progress bar · 22. Cursor-follow spotlight glow · 23. Bottom-nav active bounce · 24. "Why this step?" accordion expand · 25. Start-Cooking CTA gradient glow · 26. Serving-quantity flash on change · 27. Mise-en-place check pop · 28. Timer finished pulse-ring · 29. Timer progress fill · 30. Toast slide-in · 31. Modal/bottom-sheet slide-up · 32. Skeleton shimmer · 33. Loading spinner.

---

Tagline: **From Amma's kitchen to your screen.** · _Search anything. Learn anything. Cook anything._
