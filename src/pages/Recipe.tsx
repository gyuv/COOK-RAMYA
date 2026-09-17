import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeBySlug, familyFor } from '../data/recipes';
import { equipmentById } from '../data/equipment';
import { techniqueById } from '../data/techniques';
import { scaleIngredients, SERVING_PRESETS } from '../lib/scaling';
import { relatedTo, completeMeal } from '../lib/recommend';
import { useStore } from '../store/useStore';
import { useSeo, useRecipeJsonLd } from '../hooks/useSeo';
import { FoodArt } from '../components/FoodArt';
import { DishImage } from '../components/DishImage';
import { RecipeCard, SaveButton, Scroller } from '../components/cards';
import { DietDot, Modal, SectionHead, EmptyState, useToast } from '../components/ui';
import { IngredientPanel } from '../components/IngredientPanel';
import { formatMinutes } from '../hooks/useTick';
import { DAYS } from '../lib/constants';

export default function Recipe() {
  const { slug } = useParams();
  const nav = useNavigate();
  const recipe = slug ? recipeBySlug(slug) : undefined;
  const toast = useToast();
  const familySize = useStore((s) => s.prefs.familySize);
  const addRecipeToShopping = useStore((s) => s.addRecipeToShopping);
  const setMeal = useStore((s) => s.setMeal);

  const [servings, setServings] = useState(() => recipe?.baseServings ?? 4);
  const [ingModal, setIngModal] = useState<string | null>(null);
  const [mealModal, setMealModal] = useState(false);

  useSeo(recipe ? recipe.name : 'Recipe', recipe?.description);
  useRecipeJsonLd(recipe);

  const scaled = useMemo(
    () => (recipe ? scaleIngredients(recipe.ingredients, recipe.baseServings, servings) : []),
    [recipe, servings]
  );

  if (!recipe) {
    return <div className="container" style={{ paddingTop: 40 }}><EmptyState emoji="🍽" title="Recipe not found" body="This recipe may have moved." action="Back home" onAction={() => nav('/')} /></div>;
  }

  const groups = new Map<string, typeof scaled>();
  for (const ing of scaled) {
    const g = ing.group ?? 'Ingredients';
    groups.set(g, [...(groups.get(g) ?? []), ing]);
  }
  const family = familyFor(recipe.dishType).filter((r) => r.id !== recipe.id);
  const related = relatedTo(recipe);
  const meal = completeMeal(recipe);

  return (
    <div className="fade-up">
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <div style={{ aspectRatio: '16 / 9', maxHeight: 340, overflow: 'hidden' }}><DishImage id={recipe.id} art={recipe.art} seed={recipe.id} alt={recipe.name} name={recipe.name} showCredit eager /></div>
        <div style={{ position: 'absolute', top: 12, left: 12 }}><button onClick={() => nav(-1)} className="btn btn-ghost" style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.9)' }}>← Back</button></div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}><SaveButton id={recipe.id} name={recipe.name} /></div>
      </div>

      <div className="container" style={{ marginTop: -28, position: 'relative' }}>
        <div className="card card-pad">
          <div className="row wrap gap8" style={{ marginBottom: 8 }}>
            <span className="eyebrow">{recipe.region} · {recipe.state}</span>
            {recipe.styleLabel && <span className="pill pill-terra">{recipe.styleLabel}</span>}
          </div>
          <h1 style={{ fontSize: 'clamp(1.7rem,5vw,2.5rem)' }}>{recipe.name}</h1>
          {recipe.tagline && <p style={{ color: 'var(--ink-2)', marginTop: 6, fontSize: '1.02rem' }}>{recipe.tagline}</p>}
          <p className="muted" style={{ marginTop: 10, lineHeight: 1.55 }}>{recipe.description}</p>

          {/* Meta strip */}
          <div className="row wrap" style={{ gap: '10px 20px', marginTop: 16, fontSize: '0.9rem' }}>
            <span className="row gap6"><DietDot diet={recipe.diet} showLabel /></span>
            <span>🍳 Prep {formatMinutes(recipe.prepMin)}</span>
            <span>🔥 Cook {formatMinutes(recipe.cookMin)}</span>
            <span>⏱ Total {formatMinutes(recipe.prepMin + recipe.cookMin)}</span>
            <span>📊 {recipe.difficulty}</span>
            <span>🍽 {recipe.baseServings} base servings</span>
          </div>
          <div className="row wrap gap6" style={{ marginTop: 12 }}>
            {recipe.tags.map((t) => <span key={t} className="pill">{t}</span>)}
            {recipe.glutenFree && <span className="pill pill-veg">Gluten-free</span>}
            {recipe.vegan && <span className="pill pill-veg">Vegan</span>}
          </div>

          {/* CTAs */}
          <div className="row wrap gap8" style={{ marginTop: 18 }}>
            <Link to={`/guided/${recipe.slug}`} className="btn btn-primary btn-lg btn-glow" onClick={() => useStore.getState().startSession(recipe.id, servings)}>▶ Start Cooking</Link>
            <button className="btn btn-ghost" onClick={() => { addRecipeToShopping(recipe.id, servings); toast('Ingredients added to shopping list'); }}>🛒 Shopping list</button>
            <button className="btn btn-ghost" onClick={() => setMealModal(true)}>📅 Add to meal plan</button>
            <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(location.href).then(() => toast('Link copied'), () => toast('Copy not available')); }}>↗ Share</button>
          </div>
        </div>

        {/* Serving calculator */}
        <section className="section">
          <div className="card card-pad">
            <SectionHead title="Servings" />
            <div className="row wrap gap8">
              {SERVING_PRESETS.map((n) => (
                <button key={n} className={`chip ${servings === n ? 'active' : ''}`} aria-pressed={servings === n} onClick={() => setServings(n)}>{n}</button>
              ))}
              <button className={`chip ${servings === familySize && !SERVING_PRESETS.includes(familySize) ? 'active' : ''}`} onClick={() => setServings(familySize)}>My family ({familySize})</button>
              <label className="row gap6" style={{ fontSize: '0.85rem' }}>
                Custom
                <input type="number" min={1} max={100} value={servings} onChange={(e) => setServings(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} className="input" style={{ width: 76, padding: '6px 10px' }} />
              </label>
            </div>
            <p className="muted" style={{ fontSize: '0.8rem', marginTop: 10 }}>Quantities rescale with sensible rounding. Salt, spice and tamarind are marked “to taste” — season as you go.</p>
          </div>
        </section>

        {/* Ingredients */}
        <section className="section">
          <div className="card card-pad">
            <div className="section-head"><h2>Ingredients</h2><button className="link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--terra)', fontWeight: 600 }} onClick={() => { addRecipeToShopping(recipe.id, servings); toast('All ingredients added to shopping list'); }}>+ Add all</button></div>
            {[...groups.entries()].map(([group, items]) => (
              <div key={group} style={{ marginTop: 14 }}>
                {groups.size > 1 && <div className="eyebrow" style={{ marginBottom: 6 }}>{group}</div>}
                <ul style={{ display: 'grid', gap: 2 }}>
                  {items.map((ing, i) => (
                    <li key={group + i}>
                      <button onClick={() => setIngModal(ing.item)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '10px 8px', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                        <span className="row gap8"><span style={{ width: 30, height: 30, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}><FoodArt art="other" seed={ing.item} /></span><span style={{ fontSize: '0.95rem' }}>{ing.item}{ing.note ? <span className="muted"> · {ing.note}</span> : null}</span></span>
                        <span key={`${servings}-${ing.displayQty}`} className="qty-flash" style={{ fontWeight: 600, whiteSpace: 'nowrap', padding: '2px 6px', color: ing.looselyScaled ? 'var(--ink-3)' : 'var(--ink)' }}>{ing.displayQty} {ing.unit}{ing.qty == null ? 'to taste' : ''}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>Tap any ingredient to learn what it is, how to use it, and its substitutes.</p>
          </div>
        </section>

        {/* Equipment */}
        {recipe.equipment.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Equipment" />
            <div className="row wrap gap8">
              {recipe.equipment.map((id) => { const e = equipmentById(id); return e ? <Link key={id} to={`/equipment/${e.slug}`} className="chip"><span style={{ width: 22, height: 22, borderRadius: 6, overflow: 'hidden', display: 'inline-block' }}><FoodArt art={e.art} seed={e.id} /></span> {e.name}</Link> : null; })}
            </div>
          </div></section>
        )}

        {/* Doneness */}
        {recipe.doneness && recipe.doneness.length > 0 && (
          <section className="section"><div className="card card-pad" style={{ background: 'var(--green-soft)', borderColor: '#cfe6da' }}>
            <SectionHead title="How to know it's ready" />
            <ul style={{ display: 'grid', gap: 8 }}>{recipe.doneness.map((d) => <li key={d} className="row gap8"><span aria-hidden="true" style={{ color: 'var(--green)' }}>✓</span><span>{d}</span></li>)}</ul>
          </div></section>
        )}

        {/* Nutrition */}
        {recipe.nutrition && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Nutrition" />
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {([['Calories', `${recipe.nutrition.calories}`], ['Protein', `${recipe.nutrition.protein} g`], ['Carbs', `${recipe.nutrition.carbs} g`], ['Fat', `${recipe.nutrition.fat} g`], ['Fiber', `${recipe.nutrition.fiber} g`], ['Sodium', `${recipe.nutrition.sodium} mg`]] as const).map(([k, v]) => (
                <div key={k} className="center" style={{ background: 'var(--ivory-2)', borderRadius: 12, padding: '12px 6px' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{v}</div>
                  <div className="muted" style={{ fontSize: '0.75rem' }}>{k}</div>
                </div>
              ))}
            </div>
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: 10 }}>Per serving · estimated values, not laboratory-tested.</p>
          </div></section>
        )}

        {/* Substitutions */}
        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Smart substitutions" />
            {recipe.substitutions.map((sub) => (
              <div key={sub.ingredient} style={{ marginTop: 10 }}>
                <strong>{sub.ingredient}</strong>
                <ul style={{ marginTop: 4, display: 'grid', gap: 6 }}>
                  {sub.options.map((o) => <li key={o.name} className="muted" style={{ fontSize: '0.88rem' }}><strong style={{ color: 'var(--ink)' }}>{o.name}</strong> ({o.ratio}) — {o.flavor}; texture: {o.texture}.{o.note ? ` ${o.note}` : ''}</li>)}
                </ul>
              </div>
            ))}
          </div></section>
        )}

        {/* Story */}
        {recipe.story && (
          <section className="section"><div className="card card-pad" style={{ background: 'var(--surface-2)' }}>
            <SectionHead title="The story" />
            <p style={{ lineHeight: 1.6 }}><strong>Origin.</strong> {recipe.story.origin}</p>
            <p style={{ lineHeight: 1.6, marginTop: 8 }}><strong>Culture.</strong> {recipe.story.culture}</p>
            <p className="muted" style={{ fontSize: '0.78rem', marginTop: 8 }}>Cultural background is general context; the recipe above is a modern home adaptation.</p>
          </div></section>
        )}

        {/* Techniques used */}
        {recipe.techniques && recipe.techniques.length > 0 && (
          <section className="section"><div className="card card-pad">
            <SectionHead title="Techniques you'll use" action="All techniques" onAction={() => nav('/techniques')} />
            <div className="row wrap gap8">{recipe.techniques.map((id) => { const t = techniqueById(id); return t ? <Link key={id} to={`/techniques/${t.slug}`} className="chip">{t.name}</Link> : null; })}</div>
          </div></section>
        )}

        {/* Choose your version (family) */}
        {family.length > 0 && (
          <section className="section">
            <SectionHead title={`More ${recipe.dishType} variations`} action="See all" onAction={() => nav(`/dishes/${recipe.dishType.toLowerCase().replace(/\s+/g, '-')}`)} />
            <Scroller>{family.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
          </section>
        )}

        {/* Complete your meal */}
        {meal && meal.recipes.length > 1 && (
          <section className="section">
            <SectionHead title={meal.title} />
            <Scroller>{meal.recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
          </section>
        )}

        {/* You might also like */}
        {related.length > 0 && (
          <section className="section">
            <SectionHead title="You might also like" />
            <Scroller>{related.map((r) => <RecipeCard key={r.id} recipe={r} />)}</Scroller>
          </section>
        )}

        <div style={{ height: 20 }} />
      </div>

      {/* Ingredient modal */}
      <Modal open={Boolean(ingModal)} onClose={() => setIngModal(null)} title="Ingredient">
        {ingModal && <IngredientPanel name={ingModal} />}
        {ingModal && <button className="btn btn-primary btn-block mt16" onClick={() => { addRecipeToShopping(recipe.id, servings); toast('Added recipe ingredients to shopping list'); setIngModal(null); }}>Add recipe to shopping list</button>}
      </Modal>

      {/* Meal plan modal */}
      <Modal open={mealModal} onClose={() => setMealModal(false)} title={`Add ${recipe.name} to meal plan`}>
        <div style={{ display: 'grid', gap: 10 }}>
          {DAYS.map((day) => (
            <div key={day} className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <strong style={{ width: 90 }}>{day}</strong>
              <div className="row gap6">
                {(['Breakfast', 'Lunch', 'Dinner'] as const).map((slot) => (
                  <button key={slot} className="chip" onClick={() => { setMeal(day, slot, recipe.id); toast(`Added to ${day} ${slot}`); setMealModal(false); }}>{slot[0]}</button>
                ))}
              </div>
            </div>
          ))}
          <p className="muted" style={{ fontSize: '0.8rem' }}>B = Breakfast · L = Lunch · D = Dinner</p>
        </div>
      </Modal>
    </div>
  );
}
