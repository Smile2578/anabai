// types/common.ts
export type Language = 'fr' | 'ja' | 'en';

export interface LocalizedString {
  fr?: string;
  ja?: string;
  en?: string;
}

export interface LocalizedStringRequired {
  fr: string;  // Français toujours requis
  ja?: string;
  en?: string;
}

export type GeographicPoint = {
  type: 'Point';
  coordinates: {
    lng: number;
    lat: number;
  };
};

export type Category = 'Restaurant' | 'Hôtel' | 'Visite' | 'Shopping' | 'Café & Bar';

export type SubcategoriesByCategory = {
  [key in Category]: Subcategory[];
};

export type Subcategory =
  | 'Ramen'
  | 'Sushi'
  | 'Izakaya'
  | 'Hôtel traditionnel'
  | 'Ryokan'
  | 'Business Hotel'
  | 'Temple'
  | 'Sanctuaire'
  | 'Musée'
  | 'Parc'
  | 'Centre commercial'
  | 'Marché'
  | 'Café'
  | 'Bar'
  | 'Kaitai'
  | 'Karaoké'
  | 'Italien'
  | 'Pizza'
  | 'Soba'
  | 'Yakitori'
  | 'Okonomiyaki'
  | 'Tempura'
  | 'Teppanyaki'
  | 'Love Hotel'
  | 'Boutique de mode'
  | 'Boutique de souvenirs'
  | 'Boutique de cuisine'
  | 'Boutique de bien-être'
  | 'Friperie'
  | 'Magasin de collection'
  | 'Magasin de jeux-vidéos'
  | 'Librairie'
  | 'Magasin de TCG'
  | 'Point de vue'
  | 'Jardin'
  | 'Château'
  | 'Monument'
  | 'Bar à cocktails'
  | 'Bar à vin'
  | 'Bar de Jazz'
  | 'Bar à saké'
  | 'Hotel de luxe';

export const SUBCATEGORIES: SubcategoriesByCategory = {
  Restaurant: ['Ramen', 'Sushi', 'Izakaya', 'Italien', 'Pizza', 'Soba', 'Yakitori', 'Okonomiyaki', 'Tempura', 'Teppanyaki'],
  Hôtel: ['Hôtel traditionnel', 'Ryokan', 'Business Hotel', 'Love Hotel', 'Hotel de luxe'],
  Visite: ['Temple', 'Sanctuaire', 'Musée', 'Parc', 'Point de vue', 'Jardin', 'Château', 'Monument'],
  Shopping: [
    'Centre commercial',
    'Marché',
    'Boutique de mode',
    'Boutique de souvenirs',
    'Boutique de cuisine',
    'Boutique de bien-être',
    'Friperie',
    'Magasin de collection',
    'Magasin de jeux-vidéos',
    'Librairie',
    'Magasin de TCG',
  ],
  'Café & Bar': ['Café', 'Bar', 'Kaitai', 'Karaoké', 'Bar à cocktails', 'Bar à vin', 'Bar de Jazz', 'Bar à saké'],
};

export type Status = 'brouillon' | 'publié' | 'archivé';

export type PriceLevel = 1 | 2 | 3 | 4;

