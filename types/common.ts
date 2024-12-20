// types/common.ts
export type Language = 'fr' | 'ja' | 'en';

export interface LocalizedString {
  fr: string;
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
  | 'Japonais traditionnel'
  | 'Viande'
  | 'Poisson'
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
  | 'Hotel de luxe'
  | 'Boite de nuit'
  | 'Cave à cigares'
  | 'Brunch'
  | 'Ville historique'
  | 'Ville traditionnelle'
  | 'Salon de thé'
  | 'Boulangerie'
  | 'Cave à vin'
  | 'Café à thême - Chien'
  | 'Café à thême - Chat'
  | 'Café à thême - Autre'
  ;

export const SUBCATEGORIES: SubcategoriesByCategory = {
  Restaurant: [
    'Ramen',
    'Sushi',
    'Izakaya', 
    'Italien', 
    'Pizza', 
    'Soba', 
    'Okonomiyaki', 
    'Tempura', 
    'Teppanyaki', 
    'Yakitori', 
    'Japonais traditionnel', 
    'Viande', 
    'Poisson',
    'Boulangerie'
  ],
  Hôtel: [
    'Hôtel traditionnel', 
    'Ryokan', 
    'Business Hotel', 
    'Love Hotel', 
    'Hotel de luxe'],
  Visite: [
    'Temple', 
    'Sanctuaire', 
    'Musée', 
    'Parc', 
    'Point de vue', 
    'Jardin', 
    'Château', 
    'Monument',
    'Ville historique',
    'Ville traditionnelle'
  ],
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
    'Cave à cigares',
    'Cave à vin'
  ],
  'Café & Bar': [
    'Café', 
    'Bar', 
    'Kaitai', 
    'Karaoké', 
    'Bar à cocktails', 
    'Bar à vin', 
    'Bar de Jazz', 
    'Bar à saké',
    'Boite de nuit',
    'Brunch',
    'Salon de thé',
    'Café à thême - Chien',
    'Café à thême - Chat',
    'Café à thême - Autre'
  ],
};

export type Status = 'brouillon' | 'publié' | 'archivé';

export type PriceLevel = 1 | 2 | 3 | 4;

export interface PriceRange {
  min?: number;
  max?: number;
  currency?: string;
}

export interface PriceDetails {
  level: PriceLevel;
  range?: PriceRange;
  details?: LocalizedStringRequired;
}

export type FoodAndDrinkOption = 'servesBreakfast' | 'servesBeer' | 'servesBrunch' | 'servesDinner' | 'servesLunch' | 'servesVegetarianFood' | 'servesWine';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: string;
  order: SortOrder;
}

export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface SearchFilters extends DateRange {
  search?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
