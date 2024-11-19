// lib/services/places/StorageService.ts
import { Place } from '@/types/places/main';
import { ImportPreview } from '@/types/import';
import { PlaceRepository } from '@/lib/repositories/place-repository';

export class StorageService {
  constructor(private repository: PlaceRepository) {}

  async saveImportedPlaces(previews: ImportPreview[]): Promise<{
    savedCount: number;
    errors: Array<{ title: string; error: string }>;
  }> {
    const errors: Array<{ title: string; error: string }> = [];
    let savedCount = 0;

    // Filtrer les previews valides
    const validPreviews = previews.filter(
      preview => preview.status === 'success' && 
                preview.enriched?.success && 
                preview.enriched.place
    );

    // Sauvegarder chaque lieu
    for (const preview of validPreviews) {
      try {
        if (!preview.enriched?.place) {
          throw new Error('Données du lieu manquantes');
        }

        const placeData: Omit<Place, '_id' | 'createdAt' | 'updatedAt'> = {
          ...preview.enriched.place,
          metadata: {
            ...preview.enriched.place.metadata,
            status: 'brouillon',
            lastEnriched: new Date()
          }
        };

        const savedPlace = await this.repository.create(placeData);
        if (savedPlace) {
          savedCount++;
        } else {
          throw new Error('Échec de la sauvegarde');
        }

      } catch (error) {
        console.error('Error saving place:', error);
        errors.push({
          title: preview.original.Title,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
      }
    }

    return {
      savedCount,
      errors
    };
  }

  async checkExistingPlaces(placeIds: string[]): Promise<Set<string>> {
    const existingPlaces = new Set<string>();

    for (const placeId of placeIds) {
      const place = await this.repository.findByPlaceId(placeId);
      if (place) {
        existingPlaces.add(placeId);
      }
    }

    return existingPlaces;
  }
}
