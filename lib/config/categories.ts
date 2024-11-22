// lib/config/categories.ts
export const PLACE_CATEGORIES = {
  'Restaurant': {
    icon: 'restaurant',
    subcategories: [
      'Japonais traditionnel',
      'Ramen',
      'Sushi',
      'Izakaya',
      'Italien',
      'Teppanyaki',
      'Pizza',
      'Soba',
      'Yakitori',
      'Okonomiyaki',
      'Tempura',
      'Yakiniku',
      'Yakitori',
      'Kaitai',
    ]
  },
  'Hôtel': {
    icon: 'hotel',
    subcategories: [
      'Hôtel traditionnel',
      'Ryokan',
      'Business Hotel',
      'Resort',
      'Love Hotel',
      'Auberge de jeunesse'
    ]
  },
  'Visite': {
    icon: 'landmark',
    subcategories: [
      'Temple',
      'Sanctuaire',
      'Musée',
      'Parc',
      'Point de vue',
      'Jardin',
      'Ville',
      'Château',
      'Monument'
    ]
  },
  'Shopping': {
    icon: 'shopping-bag',
    subcategories: [
      'Centre commercial',
      'Marché',
      'Boutique traditionnelle',
      'Magasin spécialisé',
      'Boutique de mode',
      'Boutique de souvenirs',
      'Boutique de cuisine',
      'Boutique de bien-être',
      'Friperie',
      'Magasin de collection',
      'Magasin de jeux-vidéos',
      'Librairie',
      'Magasin de TCG',
    ]
  },
  'Café & Bar': {
    icon: 'coffee',
    subcategories: [
      'Café',
      'Bar',
      'Bar à cocktails',
      'Bar à vin',
      'Bar de Jazz',
      'Salon de thé',
      'Bar à saké',
      'Karaoké',
      'Discothèque',
    ]
  }
} as const;

export type Category = keyof typeof PLACE_CATEGORIES;
export type Subcategory = typeof PLACE_CATEGORIES[Category]['subcategories'][number];