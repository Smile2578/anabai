import { GooglePlace } from '@/types/google/place';
import { GoogleSearchResponse } from '@/types/google/responses';

export class GooglePlacesService {
  public readonly baseUrl = 'https://places.googleapis.com/v1/places';
  private apiKey: string;

  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is not configured');
    }
    this.apiKey = apiKey;
  }

  private readonly BASIC_FIELDS = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'types',
    'businessStatus',
    'iconBackgroundColor',
    'iconMaskBaseUri',
    'primaryType',
    'primaryTypeDisplayName'
  ].join(',');

  private readonly DETAIL_FIELDS = [
    ...this.BASIC_FIELDS.split(','),
    'currentOpeningHours',
    'regularOpeningHours',
    'priceLevel',
    'rating',
    'userRatingCount',
    'internationalPhoneNumber',
    'websiteUri',
    'googleMapsUri',
    'photos',
    'editorialSummary',
    'accessibilityOptions',
    'parkingOptions',
    'routingSummaries',
    'delivery',
    'dineIn',
    'reservable',
    'takeout',
    'priceRange',
    'paymentOptions'
  ].join(',');

  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': '*',
      ...options.headers
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('API key unauthorized. Please check your Google Maps API key configuration and ensure Places API is enabled.');
      }
      throw new Error(`Google Places API error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
  }

  public async searchPlaceByTitle(title: string): Promise<{ id: string; name: string } | null> {
    try {
      console.log(`Recherche du lieu: "${title}" au Japon`);
      
      const response = await this.fetchWithAuth(':searchText', {
        method: 'POST',
        body: JSON.stringify({
          textQuery: title,
          languageCode: 'ja',
          locationBias: {
            rectangle: {
              low: { latitude: 24, longitude: 122 },  // Sud-ouest du Japon
              high: { latitude: 46, longitude: 154 }  // Nord-est du Japon
            }
          }
        })
      }) as GoogleSearchResponse;

      if (response.places?.[0]) {
        const place = response.places[0];
        console.log(`Lieu trouvé: ${place.displayName.text} (ID: ${place.id})`);
        return {
          id: place.id,
          name: place.displayName.text
        };
      }

      console.log('Aucun lieu trouvé');
      return null;

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      throw error;
    }
  }

  public async getPlaceDetails(placeId: string, language: string = 'fr'): Promise<GooglePlace> {
    try {
      const response = await this.fetchWithAuth(`/${placeId}`, {
        headers: {
          'X-Goog-FieldMask': this.DETAIL_FIELDS,
          'Accept-Language': language
        }
      });

      console.log('Détails reçus:', response);

      return response as GooglePlace;

    } catch (error) {
      console.error(`Erreur lors de la récupération des détails pour ${placeId}:`, error);
      throw error;
    }
  }
}