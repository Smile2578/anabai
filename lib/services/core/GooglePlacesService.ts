// lib/services/core/GooglePlacesService.ts
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';
import { getCategoryFromGoogleType } from '@/lib/config/categories';
import { GooglePlace } from '@/types/google/place';
import { GoogleOpeningHours } from '@/types/google/details';
import { Place } from '@/types/places/main';

export class GooglePlacesService {
  private async fetchWithRetry(
    url: string, 
    options: RequestInit & { retries?: number } = {}
  ) {
    const { retries = GOOGLE_MAPS_CONFIG.requestOptions.maxRetries, ...fetchOptions } = options;
    let lastError: Error;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...GOOGLE_MAPS_CONFIG.requestOptions,
          ...fetchOptions,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (i < retries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, GOOGLE_MAPS_CONFIG.requestOptions.retryDelay * (i + 1))
          );
        }
      }
    }

    throw lastError!;
  }

  private transformOpeningHours(hours: GoogleOpeningHours | undefined): Place['openingHours'] | undefined {
    if (!hours?.periods) return undefined;
    return {
      periods: hours.periods.map((period: { open: { day: number; hour: number; minute: number }; close?: { hour: number; minute: number } }) => ({
        day: period.open.day,
        open: `${String(period.open.hour).padStart(2, '0')}:${String(period.open.minute).padStart(2, '0')}`,
        close: period.close 
          ? `${String(period.close.hour).padStart(2, '0')}:${String(period.close.minute).padStart(2, '0')}`
          : '23:59'
      })),
      weekdayTexts: {
        fr: hours.weekdayDescriptions.join('\n'),
        ja: hours.weekdayDescriptions.join('\n'), 
        en: hours.weekdayDescriptions.join('\n')
      }
    };
  }

  private transformToInternalPlace(placeData: GooglePlace): Place {
    // Déterminer la catégorie
    const category = getCategoryFromGoogleType(placeData.types);
    if (!category) {
      throw new Error('Unable to determine place category');
    }

    // Construire le lieu
    const place: Place = {
      name: {
        fr: placeData.displayName.text,
        ja: placeData.displayName.text, // Sera mis à jour avec la version japonaise
      },
      location: {
        point: {
          type: 'Point',
          coordinates: {
            lng: placeData.location.longitude,
            lat: placeData.location.latitude
          }
        },
        address: {
          full: {
            fr: placeData.formattedAddress,
            ja: placeData.formattedAddress, // Sera mis à jour
          },
          prefecture: placeData.addressComponents.find(
            c => c.types.includes('administrative_area_level_1')
          )?.longText,
          city: placeData.addressComponents.find(
            c => c.types.includes('locality')
          )?.longText,
        }
      },
      category,
      subcategories: [],  // Sera rempli en fonction des types Google
      images: this.transformPhotos(placeData.photos || []),
      openingHours: this.transformOpeningHours(placeData.currentOpeningHours),
      contact: {
        phone: placeData.internationalPhoneNumber,
        website: placeData.websiteUri,
        googleMapsUrl: placeData.googleMapsUri,
      },
      metadata: {
        source: 'Google Places',
        placeId: placeData.id,
        status: 'brouillon',
        rating: placeData.userRatingCount,
        businessStatus: placeData.businessStatus,
      },
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      _id: placeData.id
    };

    return place;
  }
  private transformPhotos(photos: GooglePlace['photos']): Place['images'] {
    return (photos || [])
      .slice(0, GOOGLE_MAPS_CONFIG.limits.maxPhotosPerPlace)
      .map((photo, index) => ({
        url: `${GOOGLE_MAPS_CONFIG.baseUrl}/${photo.name}/media`,
        source: 'Google Places',
        isCover: index === 0,
        caption: photo.authorAttributions?.[0]?.displayName ? {
          fr: photo.authorAttributions[0].displayName
        } : undefined
      }));
  }

  async getPlaceDetails(placeId: string): Promise<Place> {
    console.log('Fetching place details for:', placeId);

    // Récupérer en parallèle les versions FR et JA
    const [placeDetailsFr, placeDetailsJa] = await Promise.all([
      this.fetchWithRetry(
        `${GOOGLE_MAPS_CONFIG.baseUrl}/${placeId}?fields=${GOOGLE_MAPS_CONFIG.defaultFields}&languageCode=fr`
      ),
      this.fetchWithRetry(
        `${GOOGLE_MAPS_CONFIG.baseUrl}/${placeId}?fields=${GOOGLE_MAPS_CONFIG.defaultFields}&languageCode=ja`
      )
    ]);

    // Transformer en format interne
    const place = this.transformToInternalPlace(placeDetailsFr);
    
    // Ajouter les traductions japonaises
    place.name.ja = placeDetailsJa.displayName.text;
    place.location.address.full.ja = placeDetailsJa.formattedAddress;

    if (placeDetailsJa.editorialSummary?.text) {
      place.description = {
        ...place.description,
        ja: placeDetailsJa.editorialSummary.text
      };
    }

    return place;
  }

  async searchNearby(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    type?: string;
    keyword?: string;
  }): Promise<Place[]> {
    const searchParams = new URLSearchParams({
      location: `${params.latitude},${params.longitude}`,
      radius: String(params.radius || 1000),
      ...(params.type && { type: params.type }),
      ...(params.keyword && { keyword: params.keyword })
    });

    const response = await this.fetchWithRetry(
      `${GOOGLE_MAPS_CONFIG.baseUrl}/nearbysearch?${searchParams}`
    );

    return Promise.all(
      response.results.map((result: { place_id: string }) => 
        this.getPlaceDetails(result.place_id)
      )
    );
  }
}