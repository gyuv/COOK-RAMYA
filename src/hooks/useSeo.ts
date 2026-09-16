import { useEffect } from 'react';
import type { Recipe } from '../data/types';

// Client-side SEO helper (sections 72 / 73). A Vite SPA can't server-render
// meta, but we still set a descriptive <title>, meta description, canonical
// and, for recipes, Recipe JSON-LD structured data on navigation.

const SITE = 'RAMYA-COOK';

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(path: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = `${location.origin}${path}`;
}

export function useSeo(title: string, description?: string) {
  useEffect(() => {
    document.title = title === SITE ? `${SITE} · Your kitchen, guided.` : `${title} · ${SITE}`;
    if (description) {
      setMeta('description', description);
      setMeta('og:title', title, 'property');
      setMeta('og:description', description, 'property');
    }
    setCanonical(location.pathname);
  }, [title, description]);
}

const LD_ID = 'ramya-recipe-jsonld';

export function useRecipeJsonLd(recipe: Recipe | undefined) {
  useEffect(() => {
    const existing = document.getElementById(LD_ID);
    if (existing) existing.remove();
    if (!recipe) return;

    const data = {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      recipeCuisine: `${recipe.cuisine} (${recipe.region})`,
      recipeCategory: recipe.category,
      keywords: recipe.tags.join(', '),
      prepTime: `PT${recipe.prepMin}M`,
      cookTime: `PT${recipe.cookMin}M`,
      totalTime: `PT${recipe.prepMin + recipe.cookMin}M`,
      recipeYield: `${recipe.baseServings} servings`,
      recipeIngredient: recipe.ingredients.map((i) => [i.qty ?? '', i.unit, i.item, i.note ? `(${i.note})` : ''].filter(Boolean).join(' ').trim()),
      recipeInstructions: recipe.steps.map((s) => ({ '@type': 'HowToStep', name: s.title, text: s.body })),
      ...(recipe.nutrition
        ? { nutrition: { '@type': 'NutritionInformation', calories: `${recipe.nutrition.calories} kcal`, proteinContent: `${recipe.nutrition.protein} g`, carbohydrateContent: `${recipe.nutrition.carbs} g`, fatContent: `${recipe.nutrition.fat} g` } }
        : {}),
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = LD_ID;
    script.text = JSON.stringify(data);
    document.head.appendChild(script);

    return () => { document.getElementById(LD_ID)?.remove(); };
  }, [recipe]);
}
