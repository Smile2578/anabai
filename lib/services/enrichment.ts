// lib/services/enrichment.ts

import { GoogleMapsService } from './googleMaps';
import { GeocodingService } from './geocoding';
import { ValidationService } from './validation';
import { LocationService } from './location';
import { ImageCacheService } from './imageCache';
import { ImportPreview, Place } from '@/types/place';

export class EnrichmentService {
  private googleMapsService: GoogleMapsService;
  private geocodingService: GeocodingService;
  private validationService: ValidationService;
  private imageCacheService: ImageCacheService;

  constructor() {
    this.googleMapsService = new GoogleMapsService();
    this.geocodingService = new GeocodingService();
    this.validationService = new ValidationService();
    this.imageCacheService = new ImageCacheService();
  }

  async enrichImportPreview(preview: ImportPreview): Promise<ImportPreview> {
    try {
      console.log('Starting enrichment for:', preview.original.Title);
      console.log('URL:', preview.original.URL);
  
      // Vérifier si nous avons un placeId
      if (!preview.enriched?.placeId) {
        return {
          ...preview,
          status: 'error',
          enriched: {
            success: false,
            error: 'ID de lieu manquant'
          }
        };
      }

      // Enrichir avec Google Places
      const enrichedPlace = await this.googleMapsService.getPlaceDetails(preview.enriched.placeId);

      // Vérifier la localisation
      const coordinates = enrichedPlace.location.coordinates;
      if (!LocationService.validateCoordinates(coordinates)) {
        throw new Error('Coordonnées invalides');
      }

      const coordObj = LocationService.convertCoordinates(coordinates);
      if (!LocationService.isInJapan(coordObj)) {
        throw new Error('Ce lieu n\'est pas situé au Japon');
      }

      // Mettre en cache les images
      const cachedImages = await Promise.all(
        enrichedPlace.images.slice(0, 3).map(async (image) => ({
          ...image,
          url: await this.imageCacheService.cacheImage(image.url)
        }))
      );

      // Créer la version enrichie du lieu
      const enrichedResult: ImportPreview = {
        ...preview,
        status: 'success',
        enriched: {
          success: true,
          place: {
            ...enrichedPlace,
            images: cachedImages,
            originalData: {
              title: preview.original.Title,
              note: preview.original.Note,
              url: preview.original.URL,
              comment: preview.original.Comment
            }
          },
          placeId: preview.enriched.placeId
        }
      };
      // Valider le résultat
      const validationErrors = this.validationService.validatePlace(enrichedResult.enriched?.place!);
      const enrichedResultWithValidation = {
        ...enrichedResult,
        validationErrors
      };
      return enrichedResultWithValidation;

      return enrichedResult;

    } catch (error) {
      console.error('Erreur lors de l\'enrichissement:', error);
      return {
        ...preview,
        status: 'error',
        enriched: {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          placeId: preview.enriched?.placeId
        }
      };
    }
  }

  async enrichBatch(previews: ImportPreview[]): Promise<{
    results: ImportPreview[];
    stats: {
      total: number;
      success: number;
      errors: number;
      withWarnings: number;
    };
  }> {
    const results: ImportPreview[] = [];
    const stats = {
      total: previews.length,
      success: 0,
      errors: 0,
      withWarnings: 0
    };

    // Traitement séquentiel avec délai pour éviter les limitations d'API
    for (const preview of previews) {
      try {
        // Ajouter un délai entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 500));

        const enrichedPreview = await this.enrichImportPreview(preview);
        results.push(enrichedPreview);

        if (enrichedPreview.status === 'error') {
          stats.errors++;
        } else {
          stats.success++;
          if ('validationErrors' in enrichedPreview && enrichedPreview.validationErrors && Array.isArray(enrichedPreview.validationErrors) && enrichedPreview.validationErrors.length > 0) {
            stats.withWarnings++;
          }
        }
      } catch (error) {
        console.error('Error enriching preview:', error);
        stats.errors++;
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

    return { results, stats };
  }

  async enrichLocationData(placeId: string): Promise<{
    coordinates: [number, number];
    address: {
      fr: string;
      ja: string;
      prefecture?: string;
      city?: string;
      postalCode?: string;
    };
    nearestStation?: string;
    walkingTime?: number;
  }> {
    // Obtenir les détails du lieu
    const placeDetails = await this.googleMapsService.getPlaceDetails(placeId);

    // Convertir les coordonnées au format attendu
    const coordinates: [number, number] = [
      placeDetails.location.coordinates[0],
      placeDetails.location.coordinates[1]
    ];

    // Vérifier et renvoyer les données
    if (!LocationService.validateCoordinates(coordinates)) {
      throw new Error('Coordonnées invalides');
    }

    return {
      coordinates,
      address: {
        fr: placeDetails.location.address.fr,
        ja: placeDetails.location.address.ja || '', // Provide default empty string if undefined
        prefecture: placeDetails.location.address.prefecture,
        city: placeDetails.location.address.city,
        postalCode: placeDetails.location.address.postalCode
      },
      nearestStation: placeDetails.location.accessInfo?.nearestStation,
      walkingTime: placeDetails.location.accessInfo?.walkingTime
    };
  }

  async validateAndPreparePlace(place: Partial<Place>): Promise<{
    isValid: boolean;
    errors: string[];
    preparedPlace?: Place;
  }> {
    // Valider les données
    const errors = this.validationService.validatePlace(place);
    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    try {
      // Mettre en cache les images si nécessaire
      const images = place.images ? await Promise.all(
        place.images.map(async (image) => ({
          ...image,
          url: image.url.startsWith('http') 
            ? await this.imageCacheService.cacheImage(image.url)
            : image.url
        }))
      ) : [];

      // Préparer le lieu
      const preparedPlace = {
        ...place,
        images,
        isActive: true,
        metadata: {
          ...place.metadata,
          lastEnriched: new Date().toISOString()
        }
      } as Place;

      return {
        isValid: true,
        errors: [],
        preparedPlace
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Erreur de préparation']
      };
    }
  }
}