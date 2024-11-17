// lib/services/googleMaps.ts

export class GoogleMapsService {
    private apiKey: string;
    // Définition des limites géographiques du Japon
    private readonly JAPAN_BOUNDS = {
        southwest: { lat: 24.0, lng: 122.0 }, // Okinawa
        northeast: { lat: 45.7, lng: 154.0 }  // Hokkaido
    };
    
    constructor() {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error('GOOGLE_MAPS_API_KEY is not defined');
      }
      this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
    }
  
    async getPlaceDetails(placeId: string, placeName: string) {
      try {
        console.log('Searching for place in Japan:', placeName);
  
        // D'abord, essayons de trouver le lieu par une recherche textuelle
        const searchResponse = await fetch(
            'https://places.googleapis.com/v1/places:searchText',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location'
              },
              body: JSON.stringify({
                textQuery: `${placeName} Japan`, // Ajout explicite de "Japan"
                locationBias: {
                  rectangle: {
                    low: {
                      latitude: this.JAPAN_BOUNDS.southwest.lat,
                      longitude: this.JAPAN_BOUNDS.southwest.lng
                    },
                    high: {
                      latitude: this.JAPAN_BOUNDS.northeast.lat,
                      longitude: this.JAPAN_BOUNDS.northeast.lng
                    }
                  }
                },
                languageCode: 'ja' // Utilisation du japonais pour la recherche initiale
              })
            }
          );
  
        const searchData = await searchResponse.json();
        console.log('Search results:', searchData);
  
        if (!searchData.places || searchData.places.length === 0) {
          throw new Error('Place not found');
        }
  
        // Utiliser le premier résultat
        const place = searchData.places[0];
        const newPlaceId = place.id;
  
        // Maintenant obtenir les détails avec le nouvel ID
        const detailsResponse = await fetch(
          `https://places.googleapis.com/v1/places/${newPlaceId}`,
          {
            headers: {
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': [
                'id',
                'displayName',
                'formattedAddress',
                'location',
                'types',
                'primaryType',
                'editorialSummary',
                'photos',
                'regularOpeningHours',
                'priceLevel',
                'rating',
                'userRatingCount',
                'internationalPhoneNumber',
                'websiteUri',
                'addressComponents'
              ].join(',')
            }
          }
        );
  
        const detailsData = await detailsResponse.json();
  
        // Requête pour la version japonaise
        const jaResponse = await fetch(
          `https://places.googleapis.com/v1/places/${newPlaceId}`,
          {
            headers: {
              'X-Goog-Api-Key': this.apiKey,
              'X-Goog-FieldMask': 'displayName,formattedAddress',
              'Accept-Language': 'ja'
            }
          }
        );
  
        const jaData = await jaResponse.json();
  
        // Construction de l'objet de retour
        return {
          name: {
            fr: detailsData.displayName?.text || '',
            ja: jaData.displayName?.text || ''
          },
          location: {
            type: 'Point' as const,
            coordinates: [
                detailsData.location?.longitude || 0, // Longitude en premier
                detailsData.location?.latitude || 0   // Latitude en second
              ],
            address: {
              fr: detailsData.formattedAddress || '',
              ja: jaData.formattedAddress || '',
              prefecture: this.extractFromComponents(detailsData.addressComponents, 'administrative_area_level_1'),
              city: this.extractFromComponents(detailsData.addressComponents, 'locality'),
              postalCode: this.extractFromComponents(detailsData.addressComponents, 'postal_code')
            }
          },
          category: this.determineCategory(detailsData.types || []),
          subcategories: detailsData.types || [],
          description: {
            fr: detailsData.editorialSummary?.text || '',
            ja: ''
          },
          images: (detailsData.photos || []).map((photo: { name: any; }) => ({
            url: `https://places.googleapis.com/v1/${photo.name}/media?key=${this.apiKey}&maxHeightPx=1600`,
            source: 'Google Maps',
            isCover: false
          })),
          metadata: {
            source: 'Google Maps',
            placeId: newPlaceId,
            status: 'brouillon',
            lastEnriched: new Date(),
            rating: detailsData.rating,
            userRatingsTotal: detailsData.userRatingCount,
            priceLevel: detailsData.priceLevel,
          },
          contact: {
            phone: detailsData.internationalPhoneNumber || '',
            website: detailsData.websiteUri || '',
          },
          isActive: true
        };
  
      } catch (error) {
        console.error('Google Places API Error:', error);
        throw error;
      }
    }

  private extractFromComponents(components: any[] = [], type: string): string {
    const component = components?.find(c => c.types.includes(type));
    return component?.long_name || '';
  }

  private formatOpeningHours(periods: any[] = []) {
    if (!periods) return [];
    return periods.map(period => ({
      day: period.open?.day || 0,
      open: period.open?.time || '0000',
      close: period.close?.time || '2359'
    }));
  }

  private determineCategory(types: string[]): 'Restaurant' | 'Hôtel' | 'Visite' | 'Shopping' | 'Café & Bar' {
    const typeMapping = {
      restaurant: ['restaurant', 'food'],
      hotel: ['lodging', 'hotel'],
      shopping: ['shopping_mall', 'store', 'clothing_store', 'department_store'],
      cafe_bar: ['bar', 'cafe', 'night_club'],
      visite: ['tourist_attraction', 'point_of_interest', 'museum', 'park']
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

    return 'Visite';
  }
}