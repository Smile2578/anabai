// lib/config/google-maps.ts
export const GOOGLE_MAPS_CONFIG = {
    baseUrl: 'https://places.googleapis.com/v1/places',
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
    
    defaultFields: [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'addressComponents',
      'types',
      'primaryType',
      'primaryTypeDisplayName',
      'editorialSummary',
      'rating',
      'googleMapsUri',
      'userRatingCount',
      'currentOpeningHours',
      'photos',
      'priceLevel',
      'internationalPhoneNumber',
      'websiteUri',
      'businessStatus'
    ].join(','),
  
    languages: ['fr', 'ja', 'en'],
    
    // Options pour les requêtes API
    requestOptions: {
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'fr,ja',
      },
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
    },
  
    // Limites et quotas
    limits: {
      maxPhotosPerPlace: 3,
      maxRequestsPerSecond: 10,
      maxParallelRequests: 5,
    },
  
    // Paramètres de géocodage
    geocoding: {
      region: 'jp',
      bounds: {
        north: 45.7,  // Hokkaido
        south: 24.0,  // Okinawa
        east: 154.0,  // Îles Ogasawara
        west: 122.0   // Îles Yonaguni
      },
    }
  } as const;