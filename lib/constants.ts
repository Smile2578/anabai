// lib/constants.ts
export const CATEGORIES = [
    'Restaurant',
    'Hôtel',
    'Visite',
    'Shopping',
    'Café & Bar'
  ] as const;
  
  export type Category = typeof CATEGORIES[number];