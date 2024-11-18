// lib/services/googleMaps.ts

import { PlaceResult } from '@/types/google-places';
import { Place } from '@/types/place';

export class GoogleMapsService {
  private apiKey: string;
  private baseUrl = 'https://places.googleapis.com/v1/places';
  
  private readonly defaultFields = [
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
  ].join(',');
  
  constructor() {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_MAPS_API_KEY is not defined');
    }
    this.apiKey = apiKey;
  }

  private async fetchWithLanguage(url: string, language: string) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': this.apiKey,
      'X-Goog-FieldMask': this.defaultFields,
      'Accept-Language': language
    };

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          `Google Places API error: ${response.statusText}` +
          `\nStatus: ${response.status}` +
          `\nDetails: ${JSON.stringify(errorData)}` +
          `\nURL: ${url}`
        );
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  private determineCategory(types: string[]): Place['category'] {
    const typeMapping = {
      restaurant: ['restaurant', 'food', 'meal_takeaway', 'meal_delivery'],
      hotel: ['lodging', 'hotel'],
      shopping: ['shopping_mall', 'store', 'department_store', 'supermarket'],
      cafe_bar: ['bar', 'cafe', 'night_club', 'bakery'],
      visite: ['tourist_attraction', 'point_of_interest', 'museum', 'park', 'place_of_worship', 'temple']
    };

    for (const [category, mappedTypes] of Object.entries(typeMapping)) {
      if (types.some(type => mappedTypes.includes(type.toLowerCase()))) {
        switch (category) {
          case 'restaurant': return 'Restaurant';
          case 'hotel': return 'Hôtel';
          case 'shopping': return 'Shopping';
          case 'cafe_bar': return 'Café & Bar';
          case 'visite': return 'Visite';
        }
      }
    }

    return 'Restaurant'; // Catégorie par défaut
  }

  private extractSubcategories(place: PlaceResult): string[] {
    const subcategories: string[] = [];
    
    if (place.primaryTypeDisplayName?.text) {
      subcategories.push(place.primaryTypeDisplayName.text);
    }

    if (place.types) {
      const typeMapping: Record<string, string> = {
        restaurant: 'Restaurant',
        cafe: 'Café',
        bar: 'Bar',
        night_club: 'Boîte de nuit',
        food: 'Restauration',
        bakery: 'Boulangerie',
        meal_takeaway: 'À emporter',
        meal_delivery: 'Livraison',
        lodging: 'Hébergement',
        shopping_mall: 'Centre commercial',
        store: 'Magasin',
        tourist_attraction: 'Attraction touristique',
        museum: 'Musée',
        park: 'Parc',
        place_of_worship: 'Lieu de culte',
        temple: 'Temple'
      };

      for (const type of place.types) {
        if (typeMapping[type]) {
          subcategories.push(typeMapping[type]);
        }
      }
    }

    return [...new Set(subcategories)];
  }

  private getPriceRange(priceLevel?: string): number | undefined {
    switch (priceLevel) {
      case 'PRICE_LEVEL_FREE': return 1;
      case 'PRICE_LEVEL_INEXPENSIVE': return 2;
      case 'PRICE_LEVEL_MODERATE': return 3;
      case 'PRICE_LEVEL_EXPENSIVE': return 4;
      case 'PRICE_LEVEL_VERY_EXPENSIVE': return 5;
      default: return undefined;
    }
  }

  private transformOpeningHours(placeDetails: PlaceResult): Place['openingHours'] | undefined {
    if (!placeDetails.currentOpeningHours?.periods) {
      return undefined;
    }

    return {
      periods: placeDetails.currentOpeningHours.periods.map(period => ({
        day: period.open.day,
        open: `${String(period.open.hour).padStart(2, '0')}${String(period.open.minute).padStart(2, '0')}`,
        close: period.close 
          ? `${String(period.close.hour).padStart(2, '0')}${String(period.close.minute).padStart(2, '0')}`
          : '2359'
      })),
      weekdayText: {
        fr: placeDetails.currentOpeningHours.weekdayDescriptions,
        ja: placeDetails.currentOpeningHours.weekdayDescriptions
      }
    };
  }

  async getPlaceDetails(placeId: string): Promise<Place> {
    try {
      console.log('Getting place details for ID:', placeId);
  
      if (!placeId || typeof placeId !== 'string') {
        throw new Error(`Invalid Place ID: ${placeId}`);
      }
  
      const url = `${this.baseUrl}/${placeId}`;
      console.log('Requesting URL:', url);
  
      const [placeDetailsFr, placeDetailsJa] = await Promise.all([
        this.fetchWithLanguage(url, 'fr'),
        this.fetchWithLanguage(url, 'ja')
      ]);
  
      console.log('Received response:', {
        fr: !!placeDetailsFr,
        ja: !!placeDetailsJa
      });
  

      // Extraction des composants d'adresse
      const prefecture = placeDetailsFr.addressComponents?.find(
        (        component: { types: string | string[]; }) => component.types.includes('administrative_area_level_1')
      )?.longText;

      const city = placeDetailsFr.addressComponents?.find(
        (        component: { types: string | string[]; }) => component.types.includes('locality')
      )?.longText;

      const postalCode = placeDetailsFr.addressComponents?.find(
        (        component: { types: string | string[]; }) => component.types.includes('postal_code')
      )?.longText;

      // Construction des images
      const images = (placeDetailsFr.photos || []).slice(0, 3).map((photo: { name: any; authorAttributions: { displayName: any; }[]; }) => ({
        url: `https://places.googleapis.com/v1/${photo.name}/media?key=${this.apiKey}&maxHeightPx=800`,
        source: 'Google Places',
        isCover: false,
        caption: photo.authorAttributions?.[0]?.displayName ? {
          fr: photo.authorAttributions[0].displayName,
          ja: photo.authorAttributions[0].displayName
        } : undefined
      }));

      if (images.length > 0) {
        images[0].isCover = true;
      }

      const enrichedPlace: Place = {
        _id: '', // Sera généré par MongoDB
        originalData: {},
        name: {
          fr: placeDetailsFr.displayName.text,
          ja: placeDetailsJa.displayName.text
        },
        location: {
          type: 'Point',
          coordinates: [
            placeDetailsFr.location.longitude,
            placeDetailsFr.location.latitude
          ],
          address: {
            fr: placeDetailsFr.formattedAddress,
            ja: placeDetailsJa.formattedAddress,
            prefecture,
            city,
            postalCode
          }
        },
        category: this.determineCategory(placeDetailsFr.types),
        subcategories: this.extractSubcategories(placeDetailsFr),
        description: {
          fr: placeDetailsFr.editorialSummary?.text || '',
          ja: placeDetailsJa.editorialSummary?.text || ''
        },
        images,
        openingHours: this.transformOpeningHours(placeDetailsFr),
        pricing: placeDetailsFr.priceLevel ? {
          priceRange: this.getPriceRange(placeDetailsFr.priceLevel) as 1 | 2 | 3 | 4 | 5,
          currency: 'JPY'
        } : undefined,
        contact: {
          phone: placeDetailsFr.internationalPhoneNumber,
          website: placeDetailsFr.websiteUri,
          googleMaps: placeDetailsFr.googleMapsUri
        },
        metadata: {
          source: 'Google Places',
          placeId,
          status: 'brouillon',
          rating: placeDetailsFr.rating,
          userRatingsTotal: placeDetailsFr.userRatingCount,
          businessStatus: placeDetailsFr.businessStatus,
          verifiedBy: 'Google Places'
        },
        rating: {
          googleRating: placeDetailsFr.rating,
          googleReviewsCount: placeDetailsFr.userRatingCount,
          internalRating: 0,
          internalReviewsCount: 0
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return enrichedPlace;
      
    } catch (error) {
      console.error('Error in getPlaceDetails:', error);
      throw error;
    }
  }
}