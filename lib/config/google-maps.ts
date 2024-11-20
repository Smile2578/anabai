// lib/config/google-maps.ts
export const GOOGLE_MAPS_CONFIG = {
  baseUrl: 'https://places.googleapis.com/v1/places',
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  
  fields: {
    basic: [
      'id',
      'displayName',
      'formattedAddress',
      'location',
      'addressComponents',
      'types',
      'primaryType',
      'primaryTypeDisplayName',
      'businessStatus'
    ].join(','),

    details: [
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
      'userRatingCount',
      'currentOpeningHours',
      'regularOpeningHours',
      'photos',
      'priceLevel',
      'priceRange',
      'internationalPhoneNumber',
      'websiteUri',
      'googleMapsUri',
      'businessStatus',
      'accessibilityOptions',
      'parkingOptions',
      'routingSummaries',
      'delivery',
      'dineIn',
      'reservable',
      'takeout',
      'paymentOptions'
    ].join(',')
  },

  languages: ['fr', 'ja'] as const,
  
  requestOptions: {
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': 'fr,ja'
    },
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 10000
  },

  limits: {
    maxPhotosPerPlace: 3,
    maxRequestsPerSecond: 10,
    maxParallelRequests: 5
  },

  geocoding: {
    region: 'jp',
    bounds: {
      north: 45.7,  // Hokkaido
      south: 24.0,  // Okinawa
      east: 154.0,  // Îles Ogasawara
      west: 122.0   // Îles Yonaguni
    }
  }
} as const;

export type Language = typeof GOOGLE_MAPS_CONFIG.languages[number];