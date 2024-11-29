export const PRICE_LEVELS = [
  { 
    value: 1, 
    label: 'Économique', 
    description: 'Moins de ¥1,000', 
    icon: '¥',
    ja: {
      label: 'お手頃',
      description: '¥1,000以下'
    }
  },
  { 
    value: 2, 
    label: 'Intermédiaire', 
    description: '¥1,000 - ¥3,000', 
    icon: '¥¥',
    ja: {
      label: '適度',
      description: '¥1,000 - ¥3,000'
    }
  },
  { 
    value: 3, 
    label: 'Élevé', 
    description: '¥3,000 - ¥10,000', 
    icon: '¥¥¥',
    ja: {
      label: '高価',
      description: '¥3,000 - ¥10,000'
    }
  },
  { 
    value: 4, 
    label: 'Luxe', 
    description: 'Plus de ¥10,000', 
    icon: '¥¥¥¥',
    ja: {
      label: '高級',
      description: '¥10,000以上'
    }
  },
] as const;

export const GOOGLE_PRICE_LEVEL_MAP = {
  'PRICE_LEVEL_FREE': 1,
  'PRICE_LEVEL_INEXPENSIVE': 1,
  'PRICE_LEVEL_MODERATE': 2,
  'PRICE_LEVEL_EXPENSIVE': 3,
  'PRICE_LEVEL_VERY_EXPENSIVE': 4,
} as const; 