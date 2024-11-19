// lib/config/categories.ts
export const PLACE_CATEGORIES = {
    Restaurant: {
      label: 'Restaurant',
      googleTypes: [
        'restaurant', 
        'food', 
        'meal_takeaway', 
        'meal_delivery'
      ],
      subcategories: {
        japanese: {
          label: 'Cuisine japonaise',
          types: [
            'washoku',
            'sushi',
            'ramen',
            'udon',
            'soba',
            'tempura',
            'yakiniku',
            'yakitori',
            'izakaya',
            'kaiseki'
          ]
        },
        asian: {
          label: 'Cuisine asiatique',
          types: [
            'chinese',
            'korean',
            'thai',
            'vietnamese',
            'indian'
          ]
        },
        western: {
          label: 'Cuisine occidentale',
          types: [
            'italian',
            'french',
            'american',
            'steakhouse',
            'burger',
            'pizza'
          ]
        },
        other: {
          label: 'Autres',
          types: [
            'fusion',
            'seafood',
            'vegetarian',
            'vegan',
            'buffet'
          ]
        }
      }
    },
  
    'Café & Bar': {
      label: 'Café & Bar',
      googleTypes: [
        'cafe', 
        'bar', 
        'night_club', 
        'bakery'
      ],
      subcategories: {
        cafe: {
          label: 'Café',
          types: [
            'coffee_shop',
            'tea_house',
            'dessert_cafe',
            'cat_cafe'
          ]
        },
        bar: {
          label: 'Bar',
          types: [
            'izakaya',
            'sake_bar',
            'beer_bar',
            'cocktail_bar',
            'wine_bar'
          ]
        },
        nightlife: {
          label: 'Vie nocturne',
          types: [
            'night_club',
            'karaoke',
            'lounge'
          ]
        }
      }
    },
  
    'Hôtel': {
      label: 'Hôtel',
      googleTypes: [
        'lodging', 
        'hotel'
      ],
      subcategories: {
        traditional: {
          label: 'Hébergement traditionnel',
          types: [
            'ryokan',
            'minshuku',
            'onsen_hotel'
          ]
        },
        modern: {
          label: 'Hôtel moderne',
          types: [
            'business_hotel',
            'resort_hotel',
            'city_hotel'
          ]
        },
        budget: {
          label: 'Budget',
          types: [
            'hostel',
            'capsule_hotel',
            'guesthouse'
          ]
        }
      }
    },
  
    'Shopping': {
      label: 'Shopping',
      googleTypes: [
        'shopping_mall', 
        'store', 
        'department_store', 
        'supermarket'
      ],
      subcategories: {
        centers: {
          label: 'Centres commerciaux',
          types: [
            'shopping_mall',
            'department_store',
            'outlet_mall'
          ]
        },
        speciality: {
          label: 'Boutiques spécialisées',
          types: [
            'anime_manga',
            'electronics',
            'fashion',
            'handicrafts',
            'souvenirs'
          ]
        },
        markets: {
          label: 'Marchés',
          types: [
            'food_market',
            'flea_market',
            'street_market'
          ]
        }
      }
    },
  
    'Visite': {
      label: 'Visite',
      googleTypes: [
        'tourist_attraction', 
        'point_of_interest', 
        'museum', 
        'park', 
        'place_of_worship'
      ],
      subcategories: {
        cultural: {
          label: 'Sites culturels',
          types: [
            'temple',
            'shrine',
            'castle',
            'museum',
            'art_gallery'
          ]
        },
        nature: {
          label: 'Nature',
          types: [
            'park',
            'garden',
            'mountain',
            'beach',
            'forest'
          ]
        },
        entertainment: {
          label: 'Divertissement',
          types: [
            'amusement_park',
            'aquarium',
            'zoo',
            'theater',
            'stadium'
          ]
        }
      }
    }
  } as const;
  
  // Utilitaires d'accès aux catégories
  export const getMainCategories = () => Object.keys(PLACE_CATEGORIES) as Array<keyof typeof PLACE_CATEGORIES>;
  
  export const getSubcategories = (category: keyof typeof PLACE_CATEGORIES) => {
    const categoryConfig = PLACE_CATEGORIES[category];
    return Object.values(categoryConfig.subcategories).flatMap(subcat => subcat.types);
  };
  
  export const getCategoryFromGoogleType = (googleTypes: string[]): keyof typeof PLACE_CATEGORIES | null => {
    for (const [category, config] of Object.entries(PLACE_CATEGORIES)) {
        const typedConfig = config as { googleTypes: readonly string[] };
        if (googleTypes.some((type) => typedConfig.googleTypes.includes(type))) {
          return category as keyof typeof PLACE_CATEGORIES;
        }
    }
    return null;
  };
  