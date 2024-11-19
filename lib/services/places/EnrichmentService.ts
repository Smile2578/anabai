// lib/services/places/EnrichmentService.ts
import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';

export class EnrichmentService {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private imageService: ImageService
  ) {}

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async enrichPreview(preview: ImportPreview): Promise<ImportPreview> {
    try {
      if (!preview.enriched?.placeId) {
        throw new Error('ID de lieu manquant');
      }

      // Enrichissement via Google Places
      const enrichedPlace = await this.googlePlacesService.getPlaceDetails(
        preview.enriched.placeId
      );

      // Mise en cache des images
      const cachedImages = await Promise.all(
        enrichedPlace.images.map(async image => ({
          ...image,
          url: await this.imageService.cacheImage(image.url)
        }))
      );

      // Construction du résultat enrichi
      return {
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

    } catch (error) {
      console.error('Enrichment error:', error);
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
      failed: number;
    };
  }> {
    const results: ImportPreview[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const preview of previews) {
      try {
        // Ajouter un délai entre les requêtes
        await this.delay(500);

        const enrichedPreview = await this.enrichPreview(preview);
        
        if (enrichedPreview.status === 'success') {
          successCount++;
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
        failed: failedCount
      }
    };
  }
}