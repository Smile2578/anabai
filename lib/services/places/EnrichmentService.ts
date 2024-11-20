import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { Category } from '@/types/common';
import { GoogleOpeningHours, GooglePhoto, GoogleOpeningHoursPeriod } from '@/types/google/details';
import { GoogleAddressComponent } from '@/types/google/base';
import { AccessInfo, PracticalInfo } from '@/types/places/base';
import { GooglePlace } from '@/types/google/place';


interface EnrichmentLog {
  placeId: string;
  name: string;
  fieldsExtracted: {
    name: boolean;
    address: boolean;
    coordinates: boolean;
    category: boolean;
    images: boolean;
    openingHours: boolean;
    pricing: boolean;
    contact: boolean;
    access: boolean;
  };
  missingFields: string[];
  errors?: string[];
}

export class EnrichmentService {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private imageService: ImageService
  ) {}

  private determineCategory(types: string[]): Category {
    const typeMapping: Record<string, Category> = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'cafe': 'Café & Bar',
      'bar': 'Café & Bar',
      'lodging': 'Hôtel',
      'store': 'Shopping',
      'shopping_mall': 'Shopping'
    };

    for (const type of types) {
      if (type in typeMapping) {
        return typeMapping[type];
      }
    }

    return 'Visite';
  }

  private transformPriceLevel(priceLevel: string): 1 | 2 | 3 | 4 | null {
    const priceLevelMap: Record<string, 1 | 2 | 3 | 4> = {
      'PRICE_LEVEL_FREE': 1,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };
    return priceLevelMap[priceLevel] || null;
  }
  private findNearestStation(addressComponents: GoogleAddressComponent[]): string | undefined {
    const stationComponent = addressComponents.find(
      c => c.types.includes('transit_station') || c.types.includes('subway_station')
    );
    return stationComponent?.longText;
  }

  private async enrichAccessInfo(details: GooglePlace): Promise<AccessInfo> {
    const access: AccessInfo = {
      nearestStation: this.findNearestStation(details.addressComponents),
      walkingTime: undefined,
      transportOptions: []
    };

    if (details.routingSummaries) {
      const transportInfo = details.routingSummaries
        .filter(summary => summary.transitInfo)
        .map(summary => ({
          mode: summary.transitInfo?.primaryMode,
          duration: summary.duration,
          distance: summary.distanceMeters
        }));

      if (transportInfo.length > 0) {
        access.transportOptions = transportInfo.map(info => 
          `${info.mode} (${Math.round(info.duration / 60)} min)`
        );
        
        const walkingOption = transportInfo.find(info => info.mode === 'WALKING');
        if (walkingOption) {
          access.walkingTime = Math.round(walkingOption.duration / 60);
        }
      }
    }

    return access;
  }

  private extractPracticalInfo(details: GooglePlace): PracticalInfo {
    return {
      bookingRequired: Boolean(details.reservable),
      englishSupport: true,
      paymentMethods: details.paymentOptions?.acceptedPaymentTypes || [],
      delivery: Boolean(details.delivery),         
      dineIn: Boolean(details.dineIn),            
      takeout: Boolean(details.takeout),          
      parkingOptions: details.parkingOptions ? {
        freeParking: Boolean(details.parkingOptions.freeParking),
        paidParking: Boolean(details.parkingOptions.paidParking),
        streetParking: Boolean(details.parkingOptions.streetParking),
        valetParking: Boolean(details.parkingOptions.valetParking),
        parkingAvailable: Boolean(details.parkingOptions.parkingAvailable)
      } : undefined,
      accessibilityOptions: details.accessibilityOptions ? {
        wheelchairAccessibleParking: Boolean(details.accessibilityOptions.wheelchairAccessibleParking),
        wheelchairAccessibleEntrance: Boolean(details.accessibilityOptions.wheelchairAccessibleEntrance),
        wheelchairAccessibleRestroom: Boolean(details.accessibilityOptions.wheelchairAccessibleRestroom),
        wheelchairAccessibleSeating: Boolean(details.accessibilityOptions.wheelchairAccessibleSeating)
      } : undefined
    };
  }

  private async enrichPlaceDetails(placeId: string): Promise<Place> {
    try {
      console.log(`Début de l'enrichissement pour ${placeId}`);

      const [detailsFr, detailsJa] = await Promise.all([
        this.googlePlacesService.getPlaceDetails(placeId, 'fr'),
        this.googlePlacesService.getPlaceDetails(placeId, 'ja')
      ]);

      const openingHours: GoogleOpeningHours | undefined = 
        detailsFr.currentOpeningHours || detailsFr.regularOpeningHours;
      
      const photos: GooglePhoto[] = detailsFr.photos ? [detailsFr.photos[0]] : [];
      
      const access = await this.enrichAccessInfo(detailsFr);

      const enrichedPlace: Place = {
        name: {
          fr: detailsFr.displayName?.text || '',
          ja: detailsJa.displayName?.text || ''
        },
        location: {
          point: {
            type: 'Point',
            coordinates: {
              lng: detailsFr.location.longitude,
              lat: detailsFr.location.latitude
            }
          },
          address: {
            full: {
              fr: detailsFr.formattedAddress,
              ja: detailsJa.formattedAddress
            },
            prefecture: detailsFr.addressComponents.find(
              c => c.types.includes('administrative_area_level_1')
            )?.longText,
            city: detailsFr.addressComponents.find(
              c => c.types.includes('locality')
            )?.longText
          },
          access
        },
        category: this.determineCategory(detailsFr.types),
        subcategories: detailsFr.types || [],
        description: detailsFr.editorialSummary ? {
          fr: detailsFr.editorialSummary.text,
          ja: detailsJa.editorialSummary?.text
        } : undefined,
        images: photos.map((photo, index) => ({
          url: `${this.googlePlacesService.baseUrl}/${photo.name}/media`,
          source: 'Google Places',
          isCover: index === 0,
          caption: photo.authorAttributions?.[0] ? {
            fr: photo.authorAttributions[0].displayName
          } : undefined
        })),
        openingHours: openingHours ? {
          weekdayTexts: {
            fr: openingHours.weekdayDescriptions.join('\n'),
            ja: openingHours.weekdayDescriptions.join('\n')
          },
          periods: openingHours.periods.map((period: GoogleOpeningHoursPeriod) => ({
            day: period.open.day,
            open: `${period.open.hour}:${period.open.minute.toString().padStart(2, '0')}`,
            close: period.close ? 
              `${period.close.hour}:${period.close.minute.toString().padStart(2, '0')}` :
              '23:59'
          }))
        } : undefined,
        pricing: detailsFr.priceLevel ? {
          level: this.transformPriceLevel(detailsFr.priceLevel),
          currency: 'JPY',
          range: detailsFr.priceRange ? {
            min: detailsFr.priceRange.lowerPrice || 0,
            max: detailsFr.priceRange.upperPrice || 0
          } : undefined,
          details: {
            fr: detailsFr.priceRange?.text,
            ja: detailsJa.priceRange?.text
          }
        } : undefined,
        contact: {
          phone: detailsFr.internationalPhoneNumber,
          website: detailsFr.websiteUri,
          googleMapsUrl: detailsFr.googleMapsUri
        },
        metadata: {
          source: 'Google Places',
          placeId: placeId,
          status: 'brouillon',
          lastEnriched: new Date(),
          rating: detailsFr.rating,
          ratingCount: detailsFr.userRatingCount,
          businessStatus: detailsFr.businessStatus
        },
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
        _id: placeId,
        practical_info: this.extractPracticalInfo(detailsFr)
      };

      console.log('Place enrichie construite:', JSON.stringify(enrichedPlace, null, 2));
      return enrichedPlace;

    } catch (error) {
      console.error(`Erreur lors de l'enrichissement détaillé pour ${placeId}:`, error);
      throw error;
    }
  }

  private validateEnrichedData(place: Place): EnrichmentLog {
    const log: EnrichmentLog = {
      placeId: place._id,
      name: place.name.fr,
      fieldsExtracted: {
        name: Boolean(place.name?.fr && place.name?.ja),
        address: Boolean(place.location?.address?.full?.fr && place.location?.address?.full?.ja),
        coordinates: Boolean(place.location?.point?.coordinates),
        category: Boolean(place.category),
        images: Boolean(place.images?.length > 0),
        openingHours: Boolean(place.openingHours?.weekdayTexts?.fr),
        pricing: Boolean(place.pricing?.level),
        contact: Boolean(place.contact?.phone || place.contact?.website),
        access: Boolean(place.location?.access?.nearestStation)
      },
      missingFields: []
    };

    Object.entries(log.fieldsExtracted).forEach(([field, extracted]) => {
      if (!extracted) {
        log.missingFields.push(field);
      }
    });

    return log;
  }

  async enrichPreview(preview: ImportPreview): Promise<{ 
    preview: ImportPreview; 
    log: EnrichmentLog | null 
  }> {
    try {
      if (!preview.enriched?.placeId) {
        throw new Error('ID de lieu manquant');
      }

      console.log(`Enrichissement de ${preview.original.Title} (ID: ${preview.enriched.placeId})`);

      const enrichedPlace = await this.enrichPlaceDetails(preview.enriched.placeId);
      const log = this.validateEnrichedData(enrichedPlace);

      const enrichedPreview: ImportPreview = {
        ...preview,
        status: 'success',
        enriched: {
          success: true,
          place: enrichedPlace,
          placeId: preview.enriched.placeId
        }
      };

      return { preview: enrichedPreview, log };

    } catch (error) {
      console.error(`Erreur d'enrichissement pour ${preview.original.Title}:`, error);
      return {
        preview: {
          ...preview,
          status: 'error',
          enriched: {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            placeId: preview.enriched?.placeId
          }
        },
        log: null
      };
    }
  }

  async enrichBatch(previews: ImportPreview[]): Promise<{
    results: ImportPreview[];
    stats: {
      total: number;
      success: number;
      failed: number;
      logs: EnrichmentLog[];
    };
  }> {
    const results: ImportPreview[] = [];
    const logs: EnrichmentLog[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const preview of previews) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { preview: enrichedPreview, log } = await this.enrichPreview(preview);
        
        if (enrichedPreview.status === 'success') {
          successCount++;
          if (log) logs.push(log);
        } else {
          failedCount++;
        }

        results.push(enrichedPreview);

      } catch (error) {
        console.error('Error enriching preview:', error);
        failedCount++;
        results.push({
          ...preview,
          status: 'error',
          enriched: {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        });
      }
    }

    return {
      results,
      stats: {
        total: previews.length,
        success: successCount,
        failed: failedCount,
        logs
      }
    };
  }
}