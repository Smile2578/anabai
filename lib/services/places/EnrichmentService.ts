// lib/services/places/EnrichmentService.ts
import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { Place } from '@/types/places/main';
import { Category, Subcategory } from '@/types/common';
import { PLACE_CATEGORIES } from '@/lib/config/categories';
import { GooglePlace } from '@/types/google/place';
import { PlacePricing, AccessInfo, PracticalInfo } from '@/types/places/base';
import { ImportPreview } from '@/types/import';

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

  private async extractPricing(details: GooglePlace): Promise<PlacePricing | undefined> {
    if (!details.priceLevel) return undefined;

    const level = this.transformPriceLevel(details.priceLevel);
    if (!level) return undefined;

    return {
      level,
      currency: 'JPY',
      range: details.priceRange ? {
        min: details.priceRange.lowerPrice || 0,
        max: details.priceRange.upperPrice || 0
      } : undefined,
      details: details.priceRange?.text ? {
        fr: details.priceRange.text,
        ja: details.priceRange.text
      } : undefined
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
      access.nearestStation = stationComponent.longName;
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
        (comp: { types: string | string[]; }) => comp.types.includes('administrative_area_level_1')
      )?.longText;
  
      const city = detailsFr.addressComponents?.find(
        (comp: { types: string | string[]; }) => comp.types.includes('locality') || comp.types.includes('sublocality_level_1')
      )?.longText;

      console.log('Données brutes reçues de Google Places:', {
        fr: detailsFr,
        ja: detailsJa
      });
  
      // Traitement des images
      const processedImages = await Promise.all(
        (detailsFr.photos || []).map(async (photo: { name: any; authorAttributions: { displayName: any; }[]; }, index: number) => {
          try {
            const photoUrl = photo.name;
            console.log('URL de la photo:', photoUrl);
            
            return {
              url: photoUrl, // Pour le moment, on garde l'URL directe
              source: 'Google Places',
              isCover: index === 0,
              name: `photo_${index + 1}`,
              caption: photo.authorAttributions?.[0] ? {
                fr: photo.authorAttributions[0].displayName
              } : undefined
            };
          } catch (error) {
            console.error(`Erreur de traitement d'image:`, error);
            return {
              url: '/placeholder-image.jpg', // URL par défaut
              source: 'Default',
              isCover: index === 0,
              name: `placeholder_${index + 1}`
            };
          }
        })
      );
      
      const images = processedImages.filter(Boolean);
      
      console.log('Images traitées:', images);
  
      // Construction du lieu enrichi
      const enrichedPlace: Place = {
        name: {
          fr: detailsFr.displayName.text,
          ja: detailsJa.displayName.text
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
            prefecture,
            city,
            postalCode: detailsFr.addressComponents?.find(
              (comp: { types: string | string[]; }) => comp.types.includes('postal_code')
            )?.longText
          }
        },
        category: this.determineCategory(detailsFr.types),
        subcategories: this.determineSubcategories(detailsFr.types, this.determineCategory(detailsFr.types)),
        images,
        description: detailsFr.editorialSummary ? {
          fr: detailsFr.editorialSummary.text,
          ja: detailsJa.editorialSummary?.text
        } : undefined,
        openingHours: detailsFr.currentOpeningHours || detailsFr.regularOpeningHours ? {
          weekdayTexts: {
            fr: (detailsFr.currentOpeningHours || detailsFr.regularOpeningHours)!.weekdayDescriptions.join('\n'),
            ja: (detailsJa.currentOpeningHours || detailsJa.regularOpeningHours)!.weekdayDescriptions.join('\n')
          },
          periods: (detailsFr.currentOpeningHours || detailsFr.regularOpeningHours)!.periods.map((period: { open: { day: any; hour: any; minute: { toString: () => string; }; }; close: { hour: any; minute: { toString: () => string; }; }; }) => ({
            day: period.open.day,
            open: `${period.open.hour}:${period.open.minute.toString().padStart(2, '0')}`,
            close: period.close ? 
              `${period.close.hour}:${period.close.minute.toString().padStart(2, '0')}` :
              '23:59'
          }))
        } : undefined,
        contact: {
          phone: detailsFr.internationalPhoneNumber,
          website: detailsFr.websiteUri,
          googleMapsUrl: detailsFr.googleMapsUri
        },
        metadata: {
          source: 'Google Places',
          placeId,
          status: 'brouillon', // Statut par défaut
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
      console.log('Place enrichie:', JSON.stringify(enrichedPlace, null, 2));
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
