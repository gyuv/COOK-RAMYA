import type { Recipe } from '../data/types';
import { RESCUES } from '../data/regions';
import { ingredientByName } from '../data/ingredients';

// RAMYA AI Chef — a LOCAL, rule-based assistant (sections 27 / 40). It is
// deliberately on-device: no API keys in the browser, nothing sent anywhere.
// The AiChef interface is written so a future secure server endpoint
// (Browser → /api/chef → provider) can replace `askLocal` without UI changes.

export interface ChefContext {
  recipe?: Recipe;
  stepIndex?: number;
  servings?: number;
}

export interface ChefReply {
  text: string;
  bullets?: string[];
  source: 'local';
  topic: string;
}

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export function askLocal(question: string, ctx: ChefContext = {}): ChefReply {
  const q = question.toLowerCase().trim();
  const r = ctx.recipe;

  // ---- Substitutions ("can I use X instead of Y", "no coconut") ----
  if (has(q, 'instead of', 'substitute', 'replace', 'no ', "don't have", 'without ', 'missing')) {
    // ghee/oil is a very common one
    if (has(q, 'ghee', 'oil', 'butter')) {
      return {
        topic: 'substitution', source: 'local',
        text: 'Ghee, oil and butter can often stand in for each other, with trade-offs:',
        bullets: [
          'Ghee → oil: works fine, but you lose the nutty aroma. Use the same amount.',
          'Oil → ghee: adds richness and helps crisping (e.g. dosa). Not dairy-free.',
          'Butter → ghee/oil: butter can burn on high heat; ghee has a higher smoke point.',
        ],
      };
    }
    if (has(q, 'coconut')) {
      return {
        topic: 'substitution', source: 'local',
        text: 'No fresh coconut? Reasonable swaps (not identical):',
        bullets: [
          'Frozen grated coconut — closest match.',
          'Coconut milk or powder — creamier, softer texture.',
          'Cashew paste — for body in gravies, milder and sweeter.',
        ],
      };
    }
    if (has(q, 'onion')) {
      return {
        topic: 'no-onion', source: 'local',
        text: 'You can cook most of these without onion (great for Jain cooking):',
        bullets: [
          'Add a pinch of asafoetida (hing) in the tempering for savoury depth.',
          'Lean on tomato, ginger and a ground coconut or cashew paste for body.',
          'Sambar, rasam, kootu and many poriyals are naturally no-onion.',
        ],
      };
    }
    if (has(q, 'tamarind')) {
      return {
        topic: 'substitution', source: 'local',
        text: 'No tamarind? Balance the sourness another way:',
        bullets: ['Lemon juice (add at the end, brighter).', 'Amchur / dry mango powder.', 'Kokum for coastal dishes.'],
      };
    }
    // Recipe-specific declared substitutions
    if (r?.substitutions?.length) {
      const first = r.substitutions[0];
      return {
        topic: 'substitution', source: 'local',
        text: `For ${r.name}, one common swap is ${first.ingredient}:`,
        bullets: first.options.map((o) => `${o.name} (${o.ratio}) — ${o.flavor}; texture: ${o.texture}.`),
      };
    }
    // Generic ingredient lookup
    const words = q.replace(/[?.]/g, '').split(/\s+/);
    for (const w of words) {
      const info = ingredientByName(w);
      if (info && info.substitutes.length) {
        return { topic: 'substitution', source: 'local', text: `Substitutes for ${info.name}:`, bullets: info.substitutes };
      }
    }
    return {
      topic: 'substitution', source: 'local',
      text: 'Tell me the exact ingredient you\'re missing (e.g. "no curry leaves") and I\'ll suggest a swap with its flavour and texture trade-offs.',
    };
  }

  // ---- Rescue ("too sour / salty / sticking / burnt") ----
  if (has(q, 'too ', 'sticking', 'stuck', 'burnt', 'burning', 'bitter', 'watery', 'sour', 'salty', 'spicy', 'bland', 'lumpy', 'curdl', 'split')) {
    // sticking is specific
    if (has(q, 'stick', 'stuck')) {
      return {
        topic: 'rescue', source: 'local',
        text: 'Dosa or food sticking to the pan usually means the tawa wasn\'t ready:',
        bullets: [
          'Heat the tawa fully first — a water drop should sizzle away in a second.',
          'Rub with a halved onion dipped in oil to season the surface.',
          'Lower the heat to pour and spread, then raise it to crisp.',
          'Let the crust set — it releases on its own when ready; don\'t force it early.',
        ],
      };
    }
    const map: [string[], string][] = [
      [['sour'], 'Too sour'], [['salt'], 'Too salty'], [['spicy', 'hot'], 'Too spicy'],
      [['sweet'], 'Too sweet'], [['watery', 'thin'], 'Too watery / thin'], [['thick'], 'Too thick'],
      [['burnt', 'burning'], 'Burnt'], [['bland'], 'Bland'], [['dry'], 'Dry / stuck'],
      [['oily'], 'Too oily'], [['curdl', 'split'], 'Curdled / split'], [['lumpy'], 'Lumpy'], [['sticky'], 'Sticky'],
    ];
    for (const [keys, problem] of map) {
      if (has(q, ...keys)) {
        const fix = RESCUES.find((x) => x.problem === problem);
        if (fix) return { topic: 'rescue', source: 'local', text: `${fix.problem}? Try this:`, bullets: [...fix.fixes, `Next time: ${fix.prevent}`] };
      }
    }
  }

  // ---- Scaling ("how much for 8 people", "double") ----
  if (has(q, 'how much', 'people', 'servings', 'double', 'scale', 'for 8', 'for 6', 'for 10')) {
    const m = q.match(/\b(\d{1,3})\b/);
    if (r && m) {
      const target = parseInt(m[1], 10);
      return {
        topic: 'scaling', source: 'local',
        text: `${r.name} is written for ${r.baseServings}. Use the serving selector on the recipe to scale to ${target} — quantities update automatically.`,
        bullets: [
          'Salt, spice and tamarind don\'t scale linearly — season to taste after scaling.',
          'For large batches, cook in stages so heat stays even.',
        ],
      };
    }
    return { topic: 'scaling', source: 'local', text: 'Open the recipe and pick your serving size (1/2/4/6/10/20 or custom) — ingredients rescale with sensible rounding. Season-to-taste items are nudged, not multiplied.' };
  }

  // ---- Oil hot enough ----
  if (has(q, 'oil hot', 'hot enough', 'ready to fry', 'temperature of oil')) {
    return {
      topic: 'technique', source: 'local',
      text: 'To check if oil is ready for frying:',
      bullets: [
        'Drop a little batter — it should rise steadily with fine bubbles (not sink, not scorch).',
        'For tempering, the oil should shimmer and a mustard seed should pop within a second or two.',
        'Too cool = greasy food; too hot = dark outside, raw inside.',
      ],
    };
  }

  // ---- What next / current step ----
  if (has(q, 'what next', "what's next", 'next step', 'what do i do', 'now what')) {
    if (r && typeof ctx.stepIndex === 'number' && r.steps[ctx.stepIndex]) {
      const s = r.steps[ctx.stepIndex];
      return { topic: 'guidance', source: 'local', text: `Step ${s.n}: ${s.title}. ${s.body}`, bullets: s.why ? [`Why: ${s.why}`] : undefined };
    }
    return { topic: 'guidance', source: 'local', text: 'Start cooking a recipe and I\'ll guide you step by step — ask me "what next?" at any point.' };
  }

  // ---- Parallel tasks ----
  if (has(q, 'while', 'meanwhile', 'in the meantime', 'prepare while', 'rice cooks', 'simmer')) {
    const parallel = r?.steps.flatMap((s) => s.parallel ?? []);
    if (parallel && parallel.length) {
      return { topic: 'parallel', source: 'local', text: 'While that cooks, you could get ahead with:', bullets: parallel };
    }
    return { topic: 'parallel', source: 'local', text: 'Good habits while something simmers: prep the next component, chop garnishes, wash used vessels, and set the table.' };
  }

  // ---- Doneness ----
  if (has(q, 'ready', 'done', 'cooked', 'browned enough')) {
    if (r?.doneness?.length) return { topic: 'doneness', source: 'local', text: `${r.name} is ready when:`, bullets: r.doneness };
    return { topic: 'doneness', source: 'local', text: 'Judge doneness by your senses, not just the timer: look for colour and texture, smell for toasted aromas, and listen for the sizzle to quieten as moisture leaves.' };
  }

  // ---- Fallback ----
  return {
    topic: 'general', source: 'local',
    text: r
      ? `I can help with ${r.name} — ask about substitutions ("can I use ghee instead of oil?"), fixing problems ("it's too sour"), scaling ("how much for 8?"), doneness, or what to do next.`
      : 'Ask me about substitutions, fixing a dish, scaling servings, cooking techniques, or what to prepare while something cooks. Open a recipe for step-specific help.',
  };
}

export const CHEF_SUGGESTIONS = [
  'Can I use ghee instead of oil?',
  'My dosa is sticking.',
  'My sambar is too sour.',
  'Can I make this without onion?',
  'How much should I make for 8 people?',
  'What can I prepare while the rice cooks?',
  'Is my oil hot enough?',
  'How do I know it\'s ready?',
];
