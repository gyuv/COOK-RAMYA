// Shared small constants used across pages.
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type Day = (typeof DAYS)[number];

export const MEAL_SLOTS = ['Breakfast', 'Lunch', 'Dinner'] as const;

export const FILTER_TAGS = ['Traditional', 'Home style', 'Hotel style', 'Restaurant style', 'Quick', 'Beginner', 'Healthy', 'Spicy', 'Festive'] as const;

// Budget mode presets (₹). Prices are NOT hard-coded per ingredient — this only
// sets target bands; a future price feed can drive real estimates.
export const BUDGET_BANDS = [100, 250, 500, 1000] as const;
