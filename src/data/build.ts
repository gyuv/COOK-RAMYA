import type { Recipe, Step } from './types';

const REGION_BY_STATE: Record<string, string> = {
  'Tamil Nadu': 'South India', Kerala: 'South India', Karnataka: 'South India',
  'Andhra Pradesh': 'South India', Telangana: 'South India', Puducherry: 'South India',
  Punjab: 'North India', Rajasthan: 'North India', Delhi: 'North India',
  'Uttar Pradesh': 'North India', Haryana: 'North India', Kashmir: 'North India',
  'Himachal Pradesh': 'North India', Maharashtra: 'West India', Goa: 'West India',
  Gujarat: 'West India', Konkan: 'West India', 'West Bengal': 'East India',
  Odisha: 'East India', Bihar: 'East India', Assam: 'East India',
  'Pan-India': 'Pan-India',
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

type StepInput = Omit<Step, 'n'>;

// Compact recipe builder — fills sensible defaults so catalog entries stay
// readable while every Recipe still satisfies the full type.
export function mk(
  input: Pick<Recipe,
    'id' | 'name' | 'description' | 'state' | 'cuisine' | 'category' | 'dishType' | 'diet' | 'difficulty' | 'prepMin' | 'cookMin' | 'art'> &
    Omit<Partial<Recipe>, 'steps'> & { steps: StepInput[] }
): Recipe {
  const region = input.region ?? REGION_BY_STATE[input.state] ?? 'India';
  return {
    country: 'India',
    slug: slugify(input.id),
    region,
    baseServings: 4,
    popularity: 70,
    tags: [],
    equipment: [],
    ingredients: [],
    season: ['All'],
    ...input,
    steps: input.steps.map((s, i) => ({ n: i + 1, ...s })),
  } as Recipe;
}
