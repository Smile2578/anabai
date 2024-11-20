// lib/services/core/GooglePlacesService.ts
import { Language } from '@/types/common';

export class GooglePlacesService {
  private readonly baseUrl = 'https://places.googleapis.com/v1';
  private readonly apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }
    this.apiKey = apiKey;
  }

  public getPhotoUrl(photo: { name: string }): string {
    return `${this.baseUrl}/media/${photo.name}?key=${this.apiKey}&maxwidth=800&maxheight=600`;
  }

  private async fetchWithRetry(
    endpoint: string,
    options: RequestInit & { 
      retries?: number;
      delay?: number;
    } = {}
  ) {
    const { 
      retries = 3,
      delay = 1000,
      ...fetchOptions 
    } = options;

    let lastError: Error | null = null;
    
    for (let i = 0; i <= retries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': '*',  // On demande tous les champs disponibles
            ...fetchOptions.headers
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Google Places API error: ${response.status} - ${errorData.error?.message || errorData.message || response.statusText}`
          );
        }

        return await response.json();
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
    try {
      const searchRequest = {
        textQuery: query,
        languageCode: language,
        locationBias: {
          rectangle: {
            low: {
              latitude: 24.0,   // Sud du Japon
              longitude: 122.0  // Ouest du Japon
            },
            high: {
              latitude: 45.7,   // Nord du Japon
              longitude: 154.0  // Est du Japon
            }
          }
        }
      };

      const response = await this.fetchWithRetry('/places:searchText', {
        method: 'POST',
        body: JSON.stringify(searchRequest)
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
    language: Language = 'fr'
  ) {
    try {
      // Le format de l'URL a changé
      return await this.fetchWithRetry(`/places/${placeId}`, {
        method: 'GET',
        headers: {
          'Accept-Language': language
        }
      });
    } catch (error) {
      console.error(`Error fetching place details for ${placeId}:`, error);
      throw error;
    }
  }
}