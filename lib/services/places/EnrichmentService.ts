// lib/services/places/EnrichmentService.ts

import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { Place } from '@/types/places/main';
import { Category, Subcategory } from '@/types/common';
import { PLACE_CATEGORIES } from '@/lib/config/categories';
import { GooglePlace } from '@/types/google/place';
import { PlacePricing } from '@/types/places/base';
import { ImportPreview } from '@/types/import';
import { PlaceImage } from '@/types/places/base';
import { PRICE_LEVELS } from '@/lib/config/price-levels';

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
    const possibleSubcategories = PLACE_CATEGORIES[category].subcategories;
    
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
          if (possibleSubcategories.includes(sub as never)) {
            subcategories.add(sub);
          }
        });
      }
    }

    return Array.from(subcategories);
  }

  private transformPriceLevel(priceLevel?: string): 1 | 2 | 3 | 4 {
    if (!priceLevel) return 2;

    const priceLevelMap: Record<string, 1 | 2 | 3 | 4> = {
      'PRICE_LEVEL_FREE': 1,
      'PRICE_LEVEL_INEXPENSIVE': 1,
      'PRICE_LEVEL_MODERATE': 2,
      'PRICE_LEVEL_EXPENSIVE': 3,
      'PRICE_LEVEL_VERY_EXPENSIVE': 4
    };

    return priceLevelMap[priceLevel] || 2;
  }

  private async enrichPlaceDetails(placeId: string): Promise<Place> {
    try {
      console.log(`Début de l'enrichissement pour ${placeId}`);
  
      const [detailsFr, detailsJa] = await Promise.all([
        this.googlePlacesService.getPlaceDetails(placeId, 'fr'),
        this.googlePlacesService.getPlaceDetails(placeId, 'ja')
      ]);

      if (!detailsFr || !detailsJa) {
        throw new Error('Impossible de récupérer les détails du lieu');
      }

      // Extraction de la préfecture et de la ville
      const prefecture = detailsFr.addressComponents?.find(
        comp => comp.types.includes('administrative_area_level_1')
      )?.longText || '';

      const city = detailsFr.addressComponents?.find(
        comp => comp.types.includes('locality') || comp.types.includes('sublocality_level_1')
      )?.longText || '';

      const postalCode = detailsFr.addressComponents?.find(
        comp => comp.types.includes('postal_code')
      )?.longText;

      // Traitement des images
      const images = await Promise.all(
        (detailsFr.photos || []).slice(0, 5).map(async (photo, index) => {
          try {
            const photoUrl = await this.googlePlacesService.getPhotoUrl(photo);
            const processedImage = await this.imageService.cacheImage(photoUrl);
            
            return {
              url: processedImage,
              source: 'Google Places',
              isCover: index === 0,
              name: `img_${(index + 1).toString().padStart(2, '0')}`,
              caption: {
                fr: photo.authorAttributions?.[0]?.displayName || 'Image du lieu',
              }
            };
          } catch (error) {
            console.error(`Erreur de traitement d'image:`, error);
            return null;
          }
        })
      ).then(images => images.filter(Boolean));

      // Construction de l'objet Place enrichi
      const enrichedPlace: Place = {
        name: {
          fr: detailsFr.displayName.text,
          ja: detailsJa.displayName.text
        },
        originalData: {
          title: detailsFr.displayName.text,
          note: detailsFr.editorialSummary?.text || '',
          url: detailsFr.websiteUri
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
          }
        },
        category: this.determineCategory(detailsFr.types),
        subcategories: this.determineSubcategories(
          detailsFr.types, 
          this.determineCategory(detailsFr.types)
        ),
        images: images as PlaceImage[],
        description: {
          fr: detailsFr.editorialSummary?.text || 
              `${detailsFr.displayName.text} - ${detailsFr.formattedAddress}`,
          ja: detailsJa.editorialSummary?.text ||
              detailsJa.displayName.text
        },
        openingHours: this.extractOpeningHours(detailsFr),
        pricing: this.transformPricing(detailsFr),
        contact: {
          phone: detailsFr.internationalPhoneNumber,
          website: detailsFr.websiteUri,
          googleMapsUrl: detailsFr.googleMapsUri
        },
        metadata: {
          source: 'Google Places',
          placeId,
          status: 'brouillon',
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
      console.error(`Erreur lors de l'enrichissement pour ${placeId}:`, error);
      throw error;
    }
  }

  private extractOpeningHours(details: GooglePlace) {
    const hours = details.currentOpeningHours || details.regularOpeningHours;
    if (!hours?.periods?.length || !hours?.weekdayDescriptions?.length) {
      return undefined;
    }

    return {
      weekdayTexts: {
        fr: hours.weekdayDescriptions.join('\n')
      },
      periods: hours.periods.map(period => ({
        day: period.open.day,
        open: `${period.open.hour}:${period.open.minute.toString().padStart(2, '0')}`,
        close: period.close ? 
          `${period.close.hour}:${period.close.minute.toString().padStart(2, '0')}` :
          '23:59'
      }))
    };
  }

  private transformPricing(details: GooglePlace): PlacePricing {
    const level = this.transformPriceLevel(details.priceLevel);
    const priceInfo = PRICE_LEVELS.find(p => p.value === level);

    let range;
    if (details.priceRange?.lowerPrice && details.priceRange?.upperPrice) {
      range = {
        min: details.priceRange.lowerPrice,
        max: details.priceRange.upperPrice
      };
    }

    return {
      level,
      currency: 'JPY',
      range,
      details: {
        fr: range 
          ? `Prix entre ¥${range.min.toLocaleString()} et ¥${range.max.toLocaleString()}`
          : priceInfo?.description || '',
        ja: range
          ? `料金：¥${range.min.toLocaleString()} ～ ¥${range.max.toLocaleString()}`
          : priceInfo?.ja?.description || ''
      }
    };
  }

  async enrichPreview(preview: ImportPreview): Promise<{
    preview: ImportPreview;
    log: EnrichmentLog | null;
  }> {
    try {
      if (!preview.enriched?.placeId) {
        throw new Error('ID de lieu manquant');
      }

      const enrichedPlace = await this.enrichPlaceDetails(preview.enriched.placeId);
      const log = this.validateEnrichedData(enrichedPlace);

      return {
        preview: {
          ...preview,
          status: 'success',
          enriched: {
            success: true,
            place: enrichedPlace,
            placeId: preview.enriched.placeId
          }
        },
        log
      };
    } catch (error) {
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

  async enrichSingleImage(placeId: string, source: string = 'Google Places'): Promise<PlaceImage | null> {
    try {
      const detailsFr = await this.googlePlacesService.getPlaceDetails(placeId, 'fr');
      
      if (!detailsFr.photos?.length) {
        console.log('Aucune photo disponible pour ce lieu');
        return null;
      }

      const photo = detailsFr.photos[0];
      const photoUrl = this.googlePlacesService.getPhotoUrl(photo);
      
      try {
        const cachedUrl = await this.imageService.cacheImage(photoUrl);
        
        return {
          url: cachedUrl,
          source,
          isCover: true,
          name: 'img_01',
          caption: {
            fr: photo.authorAttributions?.[0]?.displayName || 'Image du lieu'
          }
        };
      } catch (error) {
        console.error(`Erreur de traitement d'image:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Erreur lors de l'enrichissement d'image pour ${placeId}:`, error);
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
        access: Boolean(place.location?.address?.city && place.location?.address?.prefecture)
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
}