// Shopping intelligence (sections 17 / 21 / 60). Categorise ingredients into
// aisles and merge duplicates across recipes.

export type Aisle =
  | 'Vegetables' | 'Fruits' | 'Dairy' | 'Meat' | 'Seafood'
  | 'Rice & Grains' | 'Dal & Pulses' | 'Spices' | 'Oils & Ghee'
  | 'Bakery' | 'Pantry' | 'Herbs';

const RULES: [Aisle, string[]][] = [
  ['Seafood', ['fish', 'prawn', 'meen', 'ilish', 'katla', 'rohu']],
  ['Meat', ['chicken', 'mutton', 'lamb', 'egg']],
  ['Dairy', ['curd', 'yoghurt', 'milk', 'paneer', 'cheese', 'butter', 'cream']],
  ['Oils & Ghee', ['oil', 'ghee']],
  ['Rice & Grains', ['rice', 'rava', 'semolina', 'poha', 'flour', 'maida', 'wheat', 'ragi', 'millet', 'oats', 'ada', 'noodle', 'bread', 'pav', 'parotta', 'sattu', 'sev', 'basmati', 'ponni', 'samba']],
  ['Dal & Pulses', ['dal', 'gram', 'chana', 'urad', 'toor', 'moong', 'rajma', 'chickpea', 'kadala', 'sprout', 'besan', 'lentil', 'peas']],
  ['Herbs', ['curry leaves', 'coriander', 'mint', 'dill', 'methi leaves', 'gongura', 'keerai', 'spinach']],
  ['Spices', ['mustard', 'cumin', 'turmeric', 'chilli', 'pepper', 'fenugreek', 'asafoetida', 'hing', 'masala', 'coriander seeds', 'fennel', 'cardamom', 'clove', 'cinnamon', 'garam', 'nigella', 'panch phoron', 'ajwain', 'sambar powder', 'rasam powder', 'saffron', 'kokum', 'vathal', 'podi', 'sesame', 'poppy', 'chaat', 'peri peri', 'schezwan', 'soy']],
  ['Fruits', ['lemon', 'lime', 'banana', 'tamarind', 'mango', 'coconut', 'jaggery']],
  ['Vegetables', ['onion', 'tomato', 'potato', 'brinjal', 'drumstick', 'pumpkin', 'carrot', 'beans', 'capsicum', 'cucumber', 'cabbage', 'garlic', 'ginger', 'green chilli', 'gourd', 'chow', 'yam', 'cauliflower', 'spring onion', 'vegetable']],
  ['Bakery', ['bun', 'sandwich bread']],
];

export function aisleFor(name: string): Aisle {
  const n = name.toLowerCase();
  for (const [aisle, keys] of RULES) {
    if (keys.some((k) => n.includes(k))) return aisle;
  }
  return 'Pantry';
}

export const AISLE_ORDER: Aisle[] = [
  'Vegetables', 'Fruits', 'Herbs', 'Dairy', 'Meat', 'Seafood',
  'Rice & Grains', 'Dal & Pulses', 'Spices', 'Oils & Ghee', 'Bakery', 'Pantry',
];

// Normalise an ingredient name for merging ("Sambar onions" & "onion" won't
// merge, but exact repeats will). Keep it conservative to avoid wrong merges.
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
