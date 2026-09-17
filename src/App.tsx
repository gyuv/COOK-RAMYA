import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header, BottomNavigation } from './components/nav';
import { TimerDock } from './components/cooking';
import { ToastProvider, Skeleton } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useStore } from './store/useStore';
import Home from './pages/Home';

// Route-level code splitting keeps the initial bundle small (sections 73 / 104).
const SearchResults = lazy(() => import('./pages/SearchResults'));
const Recipe = lazy(() => import('./pages/Recipe'));
const DishFamily = lazy(() => import('./pages/DishFamily'));
const Product = lazy(() => import('./pages/Product'));
const Ingredient = lazy(() => import('./pages/Ingredient'));
const Discover = lazy(() => import('./pages/Discover'));
const Techniques = lazy(() => import('./pages/Techniques').then((m) => ({ default: m.Techniques })));
const TechniqueDetail = lazy(() => import('./pages/Techniques').then((m) => ({ default: m.TechniqueDetail })));
const Regions = lazy(() => import('./pages/Regions').then((m) => ({ default: m.Regions })));
const RegionDetail = lazy(() => import('./pages/Regions').then((m) => ({ default: m.RegionDetail })));
const Collections = lazy(() => import('./pages/Collections').then((m) => ({ default: m.Collections })));
const FestivalDetail = lazy(() => import('./pages/Collections').then((m) => ({ default: m.FestivalDetail })));
const GuidedCooking = lazy(() => import('./pages/GuidedCooking'));
const CookHub = lazy(() => import('./pages/CookHub'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const Pantry = lazy(() => import('./pages/Pantry'));
const ShoppingList = lazy(() => import('./pages/ShoppingList'));
const MealPlanner = lazy(() => import('./pages/MealPlanner'));
const WhatCanICook = lazy(() => import('./pages/WhatCanICook'));
const Leftovers = lazy(() => import('./pages/Leftovers'));
const FixMyDish = lazy(() => import('./pages/FixMyDish'));
const AIChef = lazy(() => import('./pages/AIChef'));
const Saved = lazy(() => import('./pages/Saved'));
const History = lazy(() => import('./pages/History'));
const Profile = lazy(() => import('./pages/Profile'));
const Equipment = lazy(() => import('./pages/Equipment').then((m) => ({ default: m.Equipment })));
const EquipmentDetail = lazy(() => import('./pages/Equipment').then((m) => ({ default: m.EquipmentDetail })));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="container" style={{ paddingTop: 24, display: 'grid', gap: 14 }}>
      <Skeleton h={28} w="55%" />
      <Skeleton h={200} r={16} />
      <div className="grid grid-auto">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={180} r={16} />)}</div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const loc = useLocation();
  const reduceMotion = useStore((s) => s.prefs.reduceMotion);
  const immersive = loc.pathname.startsWith('/guided/');

  // Honour the reduced-motion preference app-wide.
  useEffect(() => {
    document.documentElement.style.scrollBehavior = reduceMotion ? 'auto' : '';
    document.documentElement.dataset.reduceMotion = reduceMotion ? 'true' : 'false';
  }, [reduceMotion]);

  return (
    <ToastProvider>
      <ScrollToTop />
      <div className="app-shell">
        {!immersive && <Header />}
        <ErrorBoundary>
          <main>
            <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/recipes/:slug" element={<Recipe />} />
              <Route path="/dishes/:slug" element={<DishFamily />} />
              <Route path="/products/:slug" element={<Product />} />
              <Route path="/ingredients/:slug" element={<Ingredient />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/techniques" element={<Techniques />} />
              <Route path="/techniques/:slug" element={<TechniqueDetail />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/regions/:id" element={<RegionDetail />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/festivals/:id" element={<FestivalDetail />} />
              <Route path="/guided/:slug" element={<GuidedCooking />} />
              <Route path="/cook" element={<CookHub />} />
              <Route path="/kitchen" element={<Kitchen />} />
              <Route path="/kitchen/equipment" element={<Equipment />} />
              <Route path="/equipment/:slug" element={<EquipmentDetail />} />
              <Route path="/pantry" element={<Pantry />} />
              <Route path="/shopping" element={<ShoppingList />} />
              <Route path="/meal-planner" element={<MealPlanner />} />
              <Route path="/what-can-i-cook" element={<WhatCanICook />} />
              <Route path="/leftovers" element={<Leftovers />} />
              <Route path="/fix" element={<FixMyDish />} />
              <Route path="/chef" element={<AIChef />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </main>
        </ErrorBoundary>
        <TimerDock />
        {!immersive && <BottomNavigation />}
      </div>
    </ToastProvider>
  );
}
