import type { Recipe, Step } from './types';

// The Maggi family — demonstrates RAMYA-COOK's recipe-family system:
// one product, dozens of variations, organised into categories (section 79).
// The architecture scales to hundreds of variations for any dish or product.

interface MaggiSpec {
  id: string; name: string; tagline: string; description: string;
  tags: string[]; diet?: Recipe['diet']; difficulty?: Recipe['difficulty'];
  cookMin?: number; extras: string[]; steps: Omit<Step, 'n'>[];
  popularity?: number; doneness?: string[];
}

function maggi(s: MaggiSpec): Recipe {
  return {
    id: s.id, slug: s.id, name: s.name, tagline: s.tagline, description: s.description,
    country: 'India', region: 'Pan-India', state: 'Pan-India', cuisine: 'Indo-Chinese',
    category: 'Snack', dishType: 'Maggi', diet: s.diet ?? 'veg', nutFree: true,
    difficulty: s.difficulty ?? 'Beginner', prepMin: 3, cookMin: s.cookMin ?? 6,
    baseServings: 1, popularity: s.popularity ?? 72, tags: s.tags,
    styleLabel: s.tags[0], equipment: ['kadai'],
    ingredients: [
      { item: 'Maggi noodle cake', qty: 1, unit: 'pack' },
      { item: 'Maggi masala tastemaker', qty: 1, unit: 'sachet' },
      { item: 'Water', qty: 1.25, unit: 'cup' },
      ...s.extras.map((e) => ({ item: e, qty: null, unit: '' })),
    ],
    steps: s.steps.map((st, i) => ({ n: i + 1, ...st })),
    doneness: s.doneness ?? ['Noodles soft with a slight bite', 'Sauce reduced to the texture you like', 'Masala evenly coating the noodles'],
    nutrition: { calories: 360, protein: 9, carbs: 54, fat: 13, fiber: 3, sodium: 880, estimate: true },
    relatedRecipeIds: ['maggi-classic', 'maggi-veg', 'maggi-egg', 'maggi-south-masala'],
    products: ['maggi'], season: ['Monsoon', 'All'], art: 'noodles',
  };
}

export const MAGGI_RECIPES: Recipe[] = [
  maggi({
    id: 'maggi-butter', name: 'Butter Maggi', tagline: 'Rich, glossy buttered noodles', popularity: 84,
    description: 'Classic masala Maggi finished with a knob of butter for a rich, glossy, comforting bowl.',
    tags: ['Classic', 'Quick', 'Comfort'], extras: ['Butter', 'coriander'],
    steps: [
      { title: 'Boil & cook', body: 'Boil water, add noodles and tastemaker, cook 2 minutes.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Finish with butter', body: 'Turn off the heat and stir in a knob of butter until glossy.', see: 'Glossy, buttery coating' },
    ],
  }),
  maggi({
    id: 'maggi-cheese', name: 'Cheese Maggi', tagline: 'Molten cheesy Maggi', popularity: 86,
    description: 'Masala Maggi made creamy and gooey with grated cheese melted through — a kids\' favourite.',
    tags: ['Classic', 'Kids favourite', 'Quick'], extras: ['Cheese', 'Black pepper'],
    steps: [
      { title: 'Cook the noodles', body: 'Boil water, add noodles and tastemaker, cook 2 minutes.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Melt the cheese', body: 'Lower the heat, add grated cheese and stir until melted and creamy.', heat: 'Low', see: 'Cheese melted and coating', feel: 'Creamy, gooey' },
    ],
  }),
  maggi({
    id: 'maggi-egg', name: 'Egg Maggi', tagline: 'Protein-boosted egg Maggi', diet: 'egg', popularity: 85,
    description: 'Masala Maggi with a scrambled or poached egg stirred through for a filling, protein-rich bowl.',
    tags: ['Egg', 'Quick', 'High protein'], extras: ['Egg', 'onion', 'Black pepper'],
    steps: [
      { title: 'Scramble the egg', body: 'Sauté onion, crack in the egg and scramble lightly.', heat: 'Medium', see: 'Egg just set' },
      { title: 'Add noodles', body: 'Add water, noodles and tastemaker; cook 2 minutes and combine.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
    ],
    doneness: ['Egg set and distributed', 'Noodles soft with a slight bite'],
  }),
  maggi({
    id: 'maggi-veg', name: 'Vegetable Maggi', tagline: 'Wholesome veggie-loaded Maggi', popularity: 82,
    description: 'Masala Maggi cooked with peas, carrot, capsicum and beans for a more balanced, colourful bowl.',
    tags: ['Healthy', 'Vegetarian', 'Kids favourite'], extras: ['Mixed vegetables', 'coriander'],
    steps: [
      { title: 'Soften vegetables', body: 'Sauté the diced vegetables briefly, then add water.', heat: 'Medium', see: 'Vegetables bright, just softened' },
      { title: 'Cook noodles', body: 'Add noodles and tastemaker; cook 2 minutes until vegetables are tender-crisp.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 150 }, feel: 'Veg tender-crisp' },
    ],
    doneness: ['Vegetables tender-crisp and bright', 'Noodles soft with a slight bite'],
  }),
  maggi({
    id: 'maggi-egg-veg', name: 'Egg & Vegetable Maggi', tagline: 'The complete protein bowl', diet: 'egg', popularity: 80,
    description: 'A hearty bowl combining scrambled egg and mixed vegetables — the most balanced way to eat Maggi.',
    tags: ['Healthy', 'Egg', 'High protein'], extras: ['Egg', 'Mixed vegetables', 'onion'],
    steps: [
      { title: 'Cook egg & veg', body: 'Sauté onion and vegetables, push aside and scramble the egg.', heat: 'Medium', see: 'Egg set, veg softened' },
      { title: 'Add noodles', body: 'Add water, noodles and tastemaker; cook and combine.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 150 } },
    ],
  }),
  maggi({
    id: 'maggi-south-masala', name: 'South Indian Masala Maggi', tagline: 'Maggi with a curry-leaf tadka', popularity: 88,
    description: 'Maggi given the South Indian treatment — a mustard, curry-leaf and onion tempering with a hint of sambar powder before the noodles go in.',
    tags: ['South Indian', 'Spicy', 'Home style'], extras: ['mustard-seeds', 'curry-leaves', 'onion', 'Sambar powder'],
    steps: [
      { title: 'Make the tadka', body: 'Splutter mustard in oil, add curry leaves, onion and a little sambar powder; sauté.', heat: 'Medium', technique: 'tadka', hear: 'Mustard popping', smell: 'Curry leaves crackling' },
      { title: 'Cook noodles', body: 'Add water, noodles and tastemaker; cook 2 minutes and toss through the tadka.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
    ],
    doneness: ['Curry-leaf tadka fragrant', 'Noodles coated in spiced masala'],
  }),
  maggi({
    id: 'maggi-sambar', name: 'Sambar Maggi', tagline: 'Maggi cooked in sambar', popularity: 78,
    description: 'A South Indian fusion where Maggi is simmered in hot sambar instead of plain water — tangy, spicy and surprisingly good.',
    tags: ['South Indian', 'Fusion', 'Spicy'], extras: ['Sambar', 'coriander'],
    steps: [
      { title: 'Heat sambar', body: 'Bring a bowl of sambar to a simmer, thinning with a little water.', heat: 'Medium', see: 'Gently simmering' },
      { title: 'Cook noodles in sambar', body: 'Add the noodles (use half the tastemaker) and cook until soft.', heat: 'Medium', timer: { label: 'Cook', seconds: 150 }, feel: 'Noodles soft, saucy' },
    ],
    doneness: ['Noodles soft in a tangy sambar sauce'],
  }),
  maggi({
    id: 'maggi-curry-leaf', name: 'Curry Leaf Maggi', tagline: 'Aromatic curry-leaf & pepper Maggi', popularity: 74,
    description: 'Fragrant Maggi tossed with a generous curry-leaf, garlic and crushed-pepper tempering — simple and deeply aromatic.',
    tags: ['South Indian', 'Home style', 'Quick'], extras: ['curry-leaves', 'Garlic', 'Black pepper'],
    steps: [
      { title: 'Temper', body: 'Fry curry leaves, garlic and crushed pepper in a little oil until fragrant.', heat: 'Medium', technique: 'tadka', smell: 'Curry leaves and pepper' },
      { title: 'Cook & toss', body: 'Cook the noodles, drain most water, and toss through the tempering.', heat: 'Medium', timer: { label: 'Cook', seconds: 120 } },
    ],
  }),
  maggi({
    id: 'maggi-tomato-rasam', name: 'Tomato Rasam Maggi', tagline: 'Tangy rasam-spiced Maggi', popularity: 72,
    description: 'Maggi cooked in a quick tomato-rasam base with garlic and pepper — a soupy, tangy, comforting monsoon bowl.',
    tags: ['South Indian', 'Fusion', 'Comfort'], extras: ['Tomato', 'Rasam powder', 'Garlic'],
    steps: [
      { title: 'Make rasam base', body: 'Simmer crushed tomato, rasam powder and garlic with water.', heat: 'Medium', technique: 'simmering', smell: 'Tangy rasam' },
      { title: 'Cook noodles', body: 'Add noodles (half tastemaker) and cook soupy.', heat: 'Medium', timer: { label: 'Cook', seconds: 150 }, feel: 'Soupy and tangy' },
    ],
    doneness: ['Soupy, tangy and aromatic'],
  }),
  maggi({
    id: 'maggi-idli-fusion', name: 'Idli-Style Maggi Fusion', tagline: 'Maggi tossed in idli podi', popularity: 70,
    description: 'Cooked Maggi tossed with gunpowder (idli podi) and a sesame-oil drizzle — nutty, spicy and a fun South Indian twist.',
    tags: ['South Indian', 'Fusion', 'Quick'], extras: ['Idli podi', 'Sesame oil'],
    steps: [
      { title: 'Cook noodles', body: 'Cook the noodles and drain almost all the water.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Toss with podi', body: 'Toss with idli podi and a drizzle of sesame oil.', smell: 'Toasty podi' },
    ],
  }),
  maggi({
    id: 'maggi-peri-peri', name: 'Peri Peri Maggi', tagline: 'Smoky, fiery peri peri Maggi', difficulty: 'Beginner', popularity: 81,
    description: 'Masala Maggi tossed with peri peri seasoning for a smoky, tangy heat — the café-style favourite.',
    tags: ['Spicy', 'Street Style', 'Quick'], extras: ['Peri peri seasoning', 'onion', 'Lemon'],
    steps: [
      { title: 'Cook noodles', body: 'Cook the noodles with the tastemaker, keeping them slightly dry.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Toss with peri peri', body: 'Off the heat, toss with peri peri seasoning, onion and a squeeze of lemon.', see: 'Evenly dusted, fiery red' },
    ],
    doneness: ['Slightly dry, evenly coated in peri peri', 'Bright with lemon'],
  }),
  maggi({
    id: 'maggi-schezwan', name: 'Schezwan Maggi', tagline: 'Fiery Indo-Chinese Schezwan Maggi', popularity: 83,
    description: 'Maggi stir-fried with garlicky Schezwan sauce, onion and capsicum — spicy, saucy and street-style.',
    tags: ['Spicy', 'Fusion', 'Street Style'], extras: ['Schezwan sauce', 'Garlic', 'Spring onion', 'Capsicum'],
    steps: [
      { title: 'Cook noodles', body: 'Cook and drain the noodles to al dente.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 }, feel: 'Al dente' },
      { title: 'Stir-fry', body: 'On high heat, fry garlic and vegetables, add Schezwan sauce, then toss the noodles through.', heat: 'High', see: 'Saucy, glossy, red', why: 'High heat gives the noodles a smoky, stir-fried edge.' },
    ],
    doneness: ['Noodles coated in glossy red sauce', 'Vegetables crisp-tender'],
  }),
  maggi({
    id: 'maggi-andhra', name: 'Andhra Spicy Maggi', tagline: 'Extra-hot Andhra-style Maggi', popularity: 76,
    description: 'Maggi turned up to eleven with a fiery Andhra tempering of red chilli, garlic and curry leaves.',
    tags: ['Spicy', 'South Indian'], extras: ['Dried red chilli', 'Garlic', 'curry-leaves', 'Chilli powder'],
    steps: [
      { title: 'Fiery tadka', body: 'Fry dried red chilli, garlic and curry leaves; add chilli powder off heat.', heat: 'Medium', technique: 'tadka', smell: 'Toasted chilli' },
      { title: 'Cook & toss', body: 'Cook the noodles and toss through the fiery tempering.', heat: 'Medium', timer: { label: 'Cook', seconds: 120 } },
    ],
  }),
  maggi({
    id: 'maggi-chilli-garlic', name: 'Chilli Garlic Maggi', tagline: 'Punchy garlic-forward Maggi', popularity: 79,
    description: 'Maggi stir-fried with a heap of garlic, dried chilli flakes and soy for a punchy, addictive bowl.',
    tags: ['Spicy', 'Fusion', 'Quick'], extras: ['Garlic', 'Chilli flakes', 'Soy sauce'],
    steps: [
      { title: 'Cook noodles', body: 'Cook and drain the noodles to al dente.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Fry garlic & toss', body: 'Fry lots of garlic and chilli flakes, add a splash of soy, and toss the noodles.', heat: 'High', smell: 'Garlic sizzling' },
    ],
  }),
  maggi({
    id: 'maggi-street', name: 'Street Style Maggi', tagline: 'Roadside masala Maggi', popularity: 84,
    description: 'The loaded roadside Maggi — extra masala, onion, tomato, capsicum and a mix of everyday spices, cooked saucy on a tawa.',
    tags: ['Street Style', 'Spicy', 'Comfort'], extras: ['onion', 'Tomato', 'Capsicum', 'Chaat masala'],
    steps: [
      { title: 'Sauté the base', body: 'Fry onion, tomato and capsicum with a pinch of extra masala.', heat: 'Medium', see: 'Vegetables softened' },
      { title: 'Cook noodles', body: 'Add water, noodles and tastemaker; cook saucy and finish with chaat masala.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 150 }, feel: 'Saucy, loaded' },
    ],
    doneness: ['Saucy and loaded with vegetables', 'Tangy chaat-masala finish'],
  }),
  maggi({
    id: 'maggi-mumbai', name: 'Mumbai Masala Maggi', tagline: 'Pav-bhaji-spiced Maggi', popularity: 77,
    description: 'A Mumbai twist — Maggi cooked with pav bhaji masala, butter and vegetables, finished with lemon and onion like the beachside stalls.',
    tags: ['Street Style', 'Fusion', 'Spicy'], extras: ['Pav bhaji masala', 'Butter', 'Mixed vegetables', 'Lemon'],
    steps: [
      { title: 'Cook veg base', body: 'Sauté vegetables in butter with pav bhaji masala.', heat: 'Medium', smell: 'Pav bhaji masala' },
      { title: 'Cook noodles', body: 'Add water, noodles and tastemaker; cook and finish with lemon and onion.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 150 } },
    ],
  }),
  maggi({
    id: 'maggi-delhi', name: 'Delhi Street Maggi', tagline: 'Tangy chaat-style Maggi', popularity: 75,
    description: 'Delhi-style Maggi finished with chaat masala, sev, onion, tomato and coriander — tangy, crunchy and moreish.',
    tags: ['Street Style', 'Quick', 'Fusion'], extras: ['Chaat masala', 'Sev', 'onion', 'Tomato'],
    steps: [
      { title: 'Cook noodles', body: 'Cook Maggi with the tastemaker, slightly dry.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Load toppings', body: 'Top with chaat masala, onion, tomato, coriander and sev.', see: 'Loaded and crunchy' },
    ],
  }),
  maggi({
    id: 'maggi-millet', name: 'Millet Maggi', tagline: 'Wholesome millet-noodle bowl', popularity: 71,
    description: 'A healthier bowl using millet-based atta noodles cooked with vegetables and a light masala — more fibre, same comfort.',
    tags: ['Healthy', 'Vegetarian', 'Millet'], extras: ['Mixed vegetables', 'Millet/atta noodles'],
    steps: [
      { title: 'Soften veg', body: 'Sauté vegetables briefly, add water.', heat: 'Medium' },
      { title: 'Cook noodles', body: 'Add millet noodles and a light masala; cook until soft.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 180 } },
    ],
  }),
  maggi({
    id: 'maggi-high-protein', name: 'High Protein Maggi', tagline: 'Egg, sprouts & veg protein bowl', diet: 'egg', popularity: 73,
    description: 'A protein-packed Maggi with egg, sprouts, paneer and vegetables — filling enough to be a proper meal.',
    tags: ['Healthy', 'High protein', 'Egg'], extras: ['Egg', 'Sprouts', 'Paneer', 'Mixed vegetables'],
    steps: [
      { title: 'Cook protein & veg', body: 'Sauté sprouts, paneer and vegetables; scramble in the egg.', heat: 'Medium', see: 'Egg set, veg softened' },
      { title: 'Add noodles', body: 'Add water, noodles and tastemaker; cook and combine.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 150 } },
    ],
  }),
  maggi({
    id: 'maggi-biryani', name: 'Maggi Biryani', tagline: 'Fusion biryani-spiced Maggi', difficulty: 'Intermediate', cookMin: 12, popularity: 78,
    description: 'A playful fusion — Maggi cooked with biryani masala, fried onion, mint and vegetables, layered and briefly dum-steamed for aroma.',
    tags: ['Fusion', 'Spicy', 'Street Style'], extras: ['Biryani masala', 'Fried onion', 'Mint', 'Mixed vegetables'],
    steps: [
      { title: 'Cook masala', body: 'Sauté vegetables with biryani masala and mint.', heat: 'Medium', smell: 'Biryani spices' },
      { title: 'Cook noodles', body: 'Add water and noodles; cook until just done.', heat: 'Medium-High', timer: { label: 'Cook', seconds: 120 } },
      { title: 'Quick dum', body: 'Top with fried onion, cover and steam on low a couple of minutes for aroma.', heat: 'Low', technique: 'dum', timer: { label: 'Dum', seconds: 120 } },
    ],
    doneness: ['Aromatic with biryani spices', 'Noodles soft, not mushy'],
  }),
  maggi({
    id: 'maggi-pizza', name: 'Maggi Pizza', tagline: 'Cheesy pan-fried Maggi pizza', difficulty: 'Intermediate', cookMin: 15, popularity: 80,
    description: 'Cooked Maggi pressed into a pan with egg or cheese, topped like a pizza with veg and cheese, and pan-fried until the base is crisp.',
    tags: ['Fusion', 'Kids favourite', 'Street Style'], extras: ['Cheese', 'Capsicum', 'Tomato', 'onion'],
    steps: [
      { title: 'Cook & set base', body: 'Cook the noodles, mix with a little cheese, and press into a hot oiled pan to form a base.', heat: 'Medium', see: 'Base holding together' },
      { title: 'Top & crisp', body: 'Add toppings and cheese, cover to melt, and crisp the base.', heat: 'Low', timer: { label: 'Crisp', seconds: 300 }, see: 'Cheese melted, base golden' },
    ],
    doneness: ['Base crisp and holding', 'Cheese fully melted'],
  }),
  maggi({
    id: 'maggi-cutlet', name: 'Maggi Cutlet', tagline: 'Crispy fried Maggi patties', difficulty: 'Intermediate', cookMin: 18, popularity: 74,
    description: 'Leftover Maggi bound with potato and spices, shaped into patties, crumb-coated and shallow-fried until crisp — a great snack.',
    tags: ['Fusion', 'Snack', 'Kids favourite'], extras: ['potato', 'Breadcrumbs', 'Mixed vegetables'],
    steps: [
      { title: 'Make mix', body: 'Mash cooked Maggi with boiled potato, vegetables and spices; shape into patties.', feel: 'Binds into patties' },
      { title: 'Coat & fry', body: 'Coat in breadcrumbs and shallow-fry until golden and crisp.', heat: 'Medium', technique: 'shallow-frying', timer: { label: 'Fry', seconds: 300 }, see: 'Golden, crisp crust' },
    ],
    doneness: ['Golden and crisp outside', 'Hot through'],
  }),
  maggi({
    id: 'maggi-sandwich', name: 'Maggi Sandwich', tagline: 'Grilled Maggi-stuffed sandwich', cookMin: 10, popularity: 76,
    description: 'Masala Maggi with cheese and vegetables stuffed between buttered bread and grilled crisp — the ultimate comfort snack.',
    tags: ['Fusion', 'Snack', 'Kids favourite'], extras: ['Bread', 'Cheese', 'Butter', 'onion'],
    steps: [
      { title: 'Cook filling', body: 'Cook a slightly dry masala Maggi with vegetables and cheese.', heat: 'Medium', timer: { label: 'Cook', seconds: 150 }, feel: 'Dry enough to stuff' },
      { title: 'Grill', body: 'Fill buttered bread with the Maggi and grill until golden and crisp.', heat: 'Medium', see: 'Golden, crisp, melty' },
    ],
    doneness: ['Bread golden and crisp', 'Filling hot and melty'],
  }),
  maggi({
    id: 'maggi-bowl', name: 'Maggi Noodles Bowl', tagline: 'Soupy loaded Maggi bowl', popularity: 79,
    description: 'A brothy, loaded Maggi bowl with extra water, vegetables, egg and a chilli-soy-garlic finish — like a quick ramen.',
    tags: ['Fusion', 'Comfort', 'Healthy'], diet: 'egg', extras: ['Egg', 'Mixed vegetables', 'Spring onion', 'Soy sauce'],
    steps: [
      { title: 'Build the broth', body: 'Simmer vegetables in extra water with the tastemaker, garlic and a splash of soy.', heat: 'Medium', technique: 'simmering', see: 'A light, savoury broth' },
      { title: 'Cook noodles & egg', body: 'Add noodles; slide in an egg to poach; finish with spring onion.', heat: 'Medium', timer: { label: 'Cook', seconds: 180 }, feel: 'Soupy, noodles soft, egg set' },
    ],
    doneness: ['Brothy and loaded', 'Egg poached, noodles soft'],
  }),
];
