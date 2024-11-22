// lib/services/places/EnrichmentService.ts
import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { Place } from '@/types/places/main';
import { Category, Subcategory } from '@/types/common';
import { PLACE_CATEGORIES } from '@/lib/config/categories';
import { GooglePlace } from '@/types/google/place';
import { PlacePricing, AccessInfo, PracticalInfo } from '@/types/places/base';
import { ImportPreview } from '@/types/import';
import { GooglePhoto } from '@/types/google/details';
import { PlaceImage } from '@/types/places/base';

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

interface EnrichmentBatchResult {
  results: ImportPreview[];
  stats: {
    total: number;
    success: number;
    failed: number;
    logs: EnrichmentLog[];
  };
}

export class EnrichmentService {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private imageService: ImageService
  ) {}

  private determineCategory(types: string[]): Category {
    // Mapper les types Google vers nos catégories
    const typeMapping: Partial<Record<string, Category>> = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'cafe': 'Café & Bar',
      'bar': 'Café & Bar',
      'lodging': 'Hôtel',
      'hotel': 'Hôtel',
      'ryokan': 'Hôtel',
      'store': 'Shopping',
      'shopping_mall': 'Shopping',
      'point_of_interest': 'Visite',
      'tourist_attraction': 'Visite',
      'temple': 'Visite',
      'shrine': 'Visite',
      'museum': 'Visite',
      'park': 'Visite'
    };

    for (const type of types) {
      const category = typeMapping[type];
      if (category) {
        return category;
      }
    }

    return 'Visite'; // Catégorie par défaut
  }

  private determineSubcategories(types: string[], category: Category): Subcategory[] {
    // Récupérer les sous-catégories possibles pour cette catégorie
    const possibleSubcategories = PLACE_CATEGORIES[category].subcategories;
    
    // Mapper les types Google vers nos sous-catégories
    const typeToSubcategory: Record<string, Subcategory[]> = {
      'ramen_restaurant': ['Ramen'],
      'sushi_restaurant': ['Sushi'],
      'izakaya': ['Izakaya'],
      'lodging': ['Hôtel traditionnel'],
      'ryokan': ['Ryokan'],
      'business_hotel': ['Business Hotel'],
      'temple': ['Temple'],
      'shrine': ['Sanctuaire'],
      'museum': ['Musée'],
      'park': ['Parc'],
      'shopping_mall': ['Centre commercial'],
      'market': ['Marché'],
      'cafe': ['Café'],
      'bar': ['Bar'],
      'kaitai': ['Kaitai'],
      'karaoke': ['Karaoké'],
      'italian_restaurant': ['Italien'],
      'pizza_restaurant': ['Pizza'],
      'soba_restaurant': ['Soba'],
      'yakitori_restaurant': ['Yakitori'],
      'okonomiyaki_restaurant': ['Okonomiyaki'],
      'tempura_restaurant': ['Tempura'],
      'teppanyaki_restaurant': ['Teppanyaki'],
      'love_hotel': ['Love Hotel'],
      'boutique_de_mode': ['Boutique de mode'],
      'boutique_de_souvenirs': ['Boutique de souvenirs'],
      'boutique_de_cuisine': ['Boutique de cuisine'],
      'boutique_de_bien-être': ['Boutique de bien-être'],
      'friperie': ['Friperie'],
      'magasin_de_collection': ['Magasin de collection'],
      'magasin_de_jeux-vidéos': ['Magasin de jeux-vidéos'],
      'librairie': ['Librairie'],
      'tcg_shop': ['Magasin de TCG'],
      'viewpoint': ['Point de vue'],
      'jardin': ['Jardin'],
      'chateau': ['Château'],
      'monument': ['Monument'],
      'bar_a_cocktails': ['Bar à cocktails'],
      'bar_a_vin': ['Bar à vin'],
      'bar_de_jazz': ['Bar de Jazz'],
      'bar_a_sake': ['Bar à saké'],
    };

    const subcategories = new Set<Subcategory>();
    
    for (const type of types) {
      const mappedSubcategories = typeToSubcategory[type];
      if (mappedSubcategories) {
        mappedSubcategories.forEach((sub) => {
          // Vérifier que la sous-catégorie est valide pour cette catégorie
          if (possibleSubcategories.includes(sub as never)) {
            subcategories.add(sub);
          }
        });
      }
    }

    return Array.from(subcategories);
  }

  private transformPriceLevel(priceLevel: string): 1 | 2 | 3 | 4 {
    const priceLevelMap: Record<string, 1 | 2 | 3 | 4> = {
      'PRICE_LEVEL_FREE': 1,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };
    return priceLevelMap[priceLevel] || 2; // Prix modéré par défaut
  }

  private getPriceLevelDescription(priceLevel: string): string {
    const descriptions: Record<string, string> = {
      'PRICE_LEVEL_FREE': 'Gratuit',
      'PRICE_LEVEL_INEXPENSIVE': 'Prix abordable',
      'PRICE_LEVEL_MODERATE': 'Prix modéré',
      'PRICE_LEVEL_EXPENSIVE': 'Prix élevé',
      'PRICE_LEVEL_VERY_EXPENSIVE': 'Prix très élevé'
    };
    return descriptions[priceLevel] || 'Prix modéré';
  }

  private async extractPricing(details: GooglePlace): Promise<PlacePricing | undefined> {
    if (!details.priceLevel) return undefined;

    const level = this.transformPriceLevel(details.priceLevel);
    if (!level) return undefined;

    return {
      level,
      currency: 'JPY',
      range: details.priceRange ? {
        min: details.priceRange.lowerPrice || 0,
        max: details.priceRange?.upperPrice !== undefined ? details.priceRange.upperPrice : 0
      } : undefined,
      details: details.priceRange?.text ? {
        fr: details.priceRange.text as string,
        ja: details.priceRange.text as string
      } : { fr: '', ja: '' }
    };
  }

  private async extractPracticalInfo(details: GooglePlace): Promise<PracticalInfo> {
    return {
      bookingRequired: Boolean(details.reservable),
      englishSupport: true, // Par défaut à true, à affiner si possible
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

  private async enrichAccessInfo(details: GooglePlace): Promise<AccessInfo> {
    const access: AccessInfo = {
      nearestStation: undefined,
      walkingTime: undefined,
      transportOptions: []
    };

    // Chercher la station la plus proche dans les composants d'adresse
    const stationComponent = details.addressComponents.find(
      c => c.types.includes('transit_station') || 
           c.types.includes('subway_station')
    );
    if (stationComponent) {
      access.nearestStation = stationComponent.longText;
    }

    // Utiliser routingSummaries pour les infos de transport
    if (details.routingSummaries) {
      const transportInfo = details.routingSummaries
        .filter(summary => summary.transitInfo)
        .map(summary => ({
          mode: summary.transitInfo?.primaryMode,
          duration: summary.duration,
          distance: summary.distanceMeters
        }));

      if (transportInfo.length > 0) {
        // Extraire les options de transport
        access.transportOptions = transportInfo.map(info => 
          `${info.mode} (${Math.round(info.duration / 60)} min)`
        );
        
        // Utiliser le temps de marche si disponible
        const walkingOption = transportInfo.find(info => info.mode === 'WALKING');
        if (walkingOption) {
          access.walkingTime = Math.round(walkingOption.duration / 60);
        }
      }
    }

    return access;
  }
  private async enrichPlaceDetails(placeId: string): Promise<Place> {
    try {
      console.log(`Début de l'enrichissement pour ${placeId}`);
  
      const [detailsFr, detailsJa] = await Promise.all([
        this.googlePlacesService.getPlaceDetails(placeId, 'fr'),
        this.googlePlacesService.getPlaceDetails(placeId, 'ja')
      ]);

      // Extraire la préfecture et la ville des composants d'adresse
      const prefecture = detailsFr.addressComponents?.find(
        (comp: { types: string[]; longText: string }) => comp.types.includes('administrative_area_level_1')
      )?.longText || '';

      const city = detailsFr.addressComponents?.find(
        (comp: { types: string[]; longText: string }) => comp.types.includes('locality') || comp.types.includes('sublocality_level_1')
      )?.longText || '';

      const postalCode = detailsFr.addressComponents?.find(
        (comp: { types: string[]; longText: string }) => comp.types.includes('postal_code')
      )?.longText;

        // Traitement des images avec noms courts
        let images = await Promise.all(
          (detailsFr.photos || []).map(async (photo: GooglePhoto, index: number) => {
            try {
              const photoUrl = this.googlePlacesService.getPhotoUrl(photo);
              const shortName = `img_${(index + 1).toString().padStart(2, '0')}`;
              
              // Utiliser ImageService pour cacher l'image
              const cachedUrl = await this.imageService.cacheImage(photoUrl);
              
              return {
                url: cachedUrl, // Utiliser l'URL mise en cache
                source: 'Google Places',
                isCover: index === 0,
                name: shortName,
                caption: {
                  fr: photo.authorAttributions?.[0]?.displayName || 'Image du lieu',
                }
              };
            } catch (error) {
              console.error(`Erreur de traitement d'image:`, error);
              return null;
            }
          })
        );
      let openingHours;
      if (detailsFr.currentOpeningHours?.periods?.length || detailsFr.regularOpeningHours?.periods?.length) {
        const hours = detailsFr.currentOpeningHours || detailsFr.regularOpeningHours;
        if (hours?.periods?.length && hours?.weekdayDescriptions?.length) {
          openingHours = {
            weekdayTexts: {
                fr: hours.weekdayDescriptions.join('\n')
              },
              periods: hours.periods.map((period: { open: { day: number; hour: number; minute: number }; close?: { hour: number; minute: number } }) => ({
                day: period.open.day,
                open: `${period.open.hour}:${period.open.minute.toString().padStart(2, '0')}`,
                close: period.close ? 
                  `${period.close.hour}:${period.close.minute.toString().padStart(2, '0')}` :
                  '23:59'
              }))
            };
          }
        }

      // Filtrer les images null et ajouter une image par défaut si nécessaire
      images = images.filter(Boolean);
      if (images.length === 0) {
        images = [{
          url: '/images/placeholder.jpg',
          source: 'Default',
          isCover: true,
          name: 'img_00',
          caption: {
            fr: 'Image par défaut',
          }
        }];
      }

      // Construction du lieu enrichi
      const enrichedPlace: Place = {
        name: {
          fr: detailsFr.displayName.text,
          ja: detailsJa.displayName.text
        },
        location: {
          point: {
            type: 'Point',
            coordinates: [
              detailsFr.location.longitude,
              detailsFr.location.latitude
            ]
          },
          address: {
            full: {
              fr: detailsFr.formattedAddress,
              ja: detailsJa.formattedAddress
            },
            formatted: {
              fr: detailsFr.formattedAddress,
              ja: detailsJa.formattedAddress
            },
            prefecture,
            city,
            postalCode
          },
          access: await this.enrichAccessInfo(detailsFr)
        },
        category: this.determineCategory(detailsFr.types),
        subcategories: this.determineSubcategories(detailsFr.types, this.determineCategory(detailsFr.types)),
        images: images as PlaceImage[],
        description: {
          fr: detailsFr.editorialSummary?.text || 
              `${detailsFr.displayName.text} - ${detailsFr.formattedAddress}`,
          ja: detailsJa.editorialSummary?.text ||
              detailsJa.displayName.text
        },
        openingHours,
        pricing: detailsFr.priceLevel ? {
          level: this.transformPriceLevel(detailsFr.priceLevel),
          currency: 'JPY',
          range: detailsFr.priceRange ? {
            min: detailsFr.priceRange.lowerPrice || 0,
            max: detailsFr.priceRange.upperPrice || 0
          } : undefined,
          details: {
            fr: detailsFr.priceRange?.text || this.getPriceLevelDescription(detailsFr.priceLevel),
            ja: detailsJa.priceRange?.text
          }
        } : {
          level: 2,
          currency: 'JPY',
          details: {
            fr: 'Prix modéré',
            ja: '適度な価格'
          }
        },
        contact: {
          phone: detailsFr.internationalPhoneNumber,
          website: detailsFr.websiteUri,
          googleMapsUrl: detailsFr.googleMapsUri
        },
        metadata: {
          source: 'Google Places',
          placeId,
          status: 'publié',
          lastEnriched: new Date(),
          rating: detailsFr.rating,
          ratingCount: detailsFr.userRatingCount,
          businessStatus: detailsFr.businessStatus
        },
        isActive: true,
        updatedAt: new Date(),
        createdAt: new Date(),
        isGem: false,
        _id: placeId
      };

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

    // Identifier les champs manquants
    Object.entries(log.fieldsExtracted).forEach(([field, extracted]) => {
      if (!extracted) {
        log.missingFields.push(field);
      }
    });

    return log;
  }

  async enrichPreview(preview: ImportPreview): Promise<{
    preview: ImportPreview;
    log: EnrichmentLog | null;
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

  async enrichBatch(previews: ImportPreview[]): Promise<EnrichmentBatchResult> {
    const results: ImportPreview[] = [];
    const logs: EnrichmentLog[] = [];
    let successCount = 0;
    let failedCount = 0;

    // Processus d'enrichissement par lots avec délai
    for (const preview of previews) {
      try {
        // Pause entre les requêtes pour éviter le rate limiting
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
