import { GooglePlace } from '@/types/google/place';
import { Language } from '@/types/common';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';

type CacheParams = {
  query?: string;
  language?: Language;
  placeId?: string;
};

export class GooglePlacesService {
  public readonly baseUrl = 'https://places.googleapis.com/v1';
  protected readonly apiKey: string;
  private readonly cache: Map<string, { data: unknown; timestamp: number }>;
  private readonly rateLimiter: {
    tokens: number;
    lastRefill: number;
    refillRate: number;
  };

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }
    this.apiKey = apiKey;

    // Initialisation du cache avec Map natif
    this.cache = new Map();

    // Rate limiter simple
    this.rateLimiter = {
      tokens: GOOGLE_MAPS_CONFIG.limits.maxRequestsPerSecond,
      lastRefill: Date.now(),
      refillRate: GOOGLE_MAPS_CONFIG.limits.maxRequestsPerSecond
    };
  }

  private getCacheKey(endpoint: string, params: CacheParams): string {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  private async waitForRateLimit(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      const timeSinceLastRefill = now - this.rateLimiter.lastRefill;
      const tokensToAdd = Math.floor(timeSinceLastRefill * (this.rateLimiter.refillRate / 1000));

      if (tokensToAdd > 0) {
        this.rateLimiter.tokens = Math.min(
          this.rateLimiter.refillRate,
          this.rateLimiter.tokens + tokensToAdd
        );
        this.rateLimiter.lastRefill = now;
      }

      if (this.rateLimiter.tokens > 0) {
        this.rateLimiter.tokens--;
        resolve();
      } else {
        const waitTime = Math.ceil((1 - this.rateLimiter.tokens) * 1000 / this.rateLimiter.refillRate);
        setTimeout(resolve, waitTime);
      }
    });
  }

  public getPhotoUrl(photo: { name: string }): string {
    const photoReference = photo.name.split('/').pop();
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&maxheight=600&photo_reference=${photoReference}&key=${this.apiKey}`;
  }

  private async fetchWithCache(
    endpoint: string,
    options: RequestInit & { 
      cacheKey?: string;
      cacheTTL?: number;
      bypassCache?: boolean;
      retries?: number;
      delay?: number;
    } = {}
  ) {
    const {
      cacheKey,
      cacheTTL = 24 * 60 * 60 * 1000, // 24h par défaut
      bypassCache = false,
      retries = 3,
      delay = 1000,
      ...fetchOptions
    } = options;

    // Vérifier le cache si un cacheKey est fourni
    if (cacheKey && !bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < cacheTTL) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return cached.data;
      }
    }

    // Attendre le rate limiting
    await this.waitForRateLimit();

    let lastError: Error | null = null;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': '*',
            ...fetchOptions.headers
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Google Places API error: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`
          );
        }

        const data = await response.json();

        // Mettre en cache si un cacheKey est fourni
        if (cacheKey) {
          this.cache.set(cacheKey, { 
            data, 
            timestamp: Date.now() 
          });
          console.log(`Cached data for key: ${cacheKey}`);
        }

        return data;

      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        lastError = error as Error;
        
        if (i < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          continue;
        }
        break;
      }
    }

    throw lastError;
  }

  public async searchPlace(
    query: string,
    language: Language = 'ja'
  ): Promise<{ id: string; name: string } | null> {
    const cacheKey = this.getCacheKey('/places:searchText', { query, language });

    try {
      const searchRequest = {
        textQuery: query,
        languageCode: language,
        locationBias: {
          rectangle: {
            low: {
              latitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.south,
              longitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.west
            },
            high: {
              latitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.north,
              longitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.east
            }
          }
        }
      };

      const response = await this.fetchWithCache('/places:searchText', {
        method: 'POST',
        body: JSON.stringify(searchRequest),
        cacheKey,
        cacheTTL: 30 * 60 * 1000 // Cache 30 minutes pour les recherches
      });

      if (response.places?.[0]) {
        return {
          id: response.places[0].id,
          name: response.places[0].displayName.text
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching place:', error);
      throw error;
    }
  }

  public async getPlaceDetails(
    placeId: string, 
    language: Language = 'fr',
    bypassCache: boolean = false
  ): Promise<GooglePlace> {
    const cacheKey = this.getCacheKey(`/places/${placeId}`, { language });

    try {
      return await this.fetchWithCache(`/places/${placeId}`, {
        method: 'GET',
        headers: { 'Accept-Language': language },
        cacheKey,
        bypassCache,
        cacheTTL: 24 * 60 * 60 * 1000 // Cache 24h pour les détails
      });
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      throw error;
    }
  }

  public async searchPlacesInteractive(
    query: string,
    language: Language = 'fr',
    maxResults: number = 5
  ): Promise<GooglePlace[]> {
    try {
      // Construire les paramètres de recherche sans restriction de type
      const searchRequest = {
        textQuery: query,
        languageCode: language,
        locationBias: {
          rectangle: {
            low: {
              latitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.south,
              longitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.west
            },
            high: {
              latitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.north,
              longitude: GOOGLE_MAPS_CONFIG.geocoding.bounds.east
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/places:searchText`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places'
        },
        body: JSON.stringify(searchRequest)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Places API Error Response:', data);
        throw new Error(
          `Failed to search places: ${data.error?.message || response.statusText}`
        );
      }

      if (!data.places || !Array.isArray(data.places)) {
        console.log('No places found in response:', data);
        return [];
      }

      const places = data.places.slice(0, maxResults);

      // Récupérer les détails pour chaque lieu trouvé
      const detailedPlaces = await Promise.all(
        places.map(async (place: GooglePlace) => {
          try {
            return await this.getPlaceDetails(place.id, language);
          } catch (error) {
            console.error(`Error fetching details for ${place.id}:`, error);
            return null;
          }
        })
      );

      return detailedPlaces.filter((place): place is GooglePlace => place !== null);

    } catch (error) {
      console.error('Error in searchPlacesInteractive:', error);
      throw error;
    }
  }
}