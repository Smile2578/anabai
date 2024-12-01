import { put, del } from '@vercel/blob';
import { Place } from '@/types/places/main';
import { ImportPreview } from '@/types/import';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { ValidationService } from './ValidationService';
import { Status } from '@/types/common';

interface StorageResult {
  success: boolean;
  savedCount: number;
  errors: Array<{
    title: string;
    error: string;
  }>;
  duplicates: string[];
}

interface UpdateResult {
  success: boolean;
  error?: string;
  place?: Place;
}

interface BulkUpdateResult {
  success: boolean;
  error?: string;
}

export class StorageService {
  constructor(
    private placeRepository: PlaceRepository,
    private validationService: ValidationService
  ) {}

  // Méthodes de stockage des fichiers
  async uploadFile(buffer: Buffer, path: string): Promise<string> {
    const blob = await put(path, buffer, {
      access: 'public',
      addRandomSuffix: true,
    });
    return blob.url;
  }

  async deleteFile(path: string): Promise<void> {
    await del(path);
  }

  // Méthodes de gestion des lieux
  async saveImportedPlaces(previews: ImportPreview[]): Promise<StorageResult> {
    const errors: Array<{ title: string; error: string }> = [];
    const duplicates: string[] = [];
    let savedCount = 0;

    const validPreviews = previews.filter(
      preview => preview.status === 'success' && 
                preview.enriched?.success && 
                preview.enriched.place
    );

    const placeIds = validPreviews
      .map(preview => preview.enriched?.place?.metadata.placeId)
      .filter((id): id is string => Boolean(id));

    const existingPlaces = await this.placeRepository.findByPlaceIds(placeIds);
    const existingPlaceIds = new Set(existingPlaces.map(p => p.metadata.placeId!));

    for (const preview of validPreviews) {
      try {
        if (!preview.enriched?.place) {
          throw new Error('Données du lieu manquantes');
        }

        if (preview.enriched.place.metadata.placeId && 
            existingPlaceIds.has(preview.enriched.place.metadata.placeId)) {
          duplicates.push(preview.enriched.place.metadata.placeId);
          continue;
        }

        // Forcer le statut à 'publié' pour les nouveaux lieux
        const placeToSave = {
          ...preview.enriched.place,
          metadata: {
            ...preview.enriched.place.metadata,
            status: 'publié' as const
          }
        };

        const validation = await this.validationService.validatePlace(placeToSave);
        if (!validation.isValid) {
          throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }

        const savedPlace = await this.placeRepository.create(placeToSave);
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
      success: errors.length === 0,
      savedCount,
      errors,
      duplicates
    };
  }

  async updateStatus(id: string, status: Status): Promise<UpdateResult> {
    try {
      const existingPlace = await this.placeRepository.findById(id);
      if (!existingPlace) {
        return { success: false, error: 'Lieu non trouvé' };
      }

      const updatedPlace = await this.placeRepository.update(id, {
        metadata: {
          ...existingPlace.metadata,
          status
        },
        updatedAt: new Date()
      });

      return {
        success: Boolean(updatedPlace),
        place: updatedPlace || undefined
      };

    } catch (error) {
      console.error('Error updating status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async toggleGemStatus(id: string): Promise<UpdateResult> {
    try {
      const place = await this.placeRepository.findById(id);
      if (!place) {
        return { success: false, error: 'Lieu non trouvé' };
      }

      const updated = await this.placeRepository.update(id, {
        isGem: !place.isGem,
        updatedAt: new Date()
      });

      return {
        success: true,
        place: updated || undefined
      };

    } catch (error) {
      console.error('Error toggling gem status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async updatePlace(id: string, updates: Partial<Place>): Promise<BulkUpdateResult> {
    try {
      // Récupérer le lieu existant
      const existingPlace = await this.placeRepository.findById(id);
      if (!existingPlace) {
        return { success: false, error: 'Lieu non trouvé' };
      }

      // Fusionner les mises à jour avec le lieu existant
      const updatedPlace: Place = {
        ...existingPlace,
        ...updates,
        updatedAt: new Date()
      };

      // Valider le lieu mis à jour
      const validation = await this.validationService.validatePlace(updatedPlace);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation échouée: ${validation.errors.join(', ')}`
        };
      }

      // Sauvegarder les modifications
      const saved = await this.placeRepository.update(id, updatedPlace);
      if (!saved) {
        return { success: false, error: 'Échec de la mise à jour' };
      }

      return { success: true };

    } catch (error) {
      console.error('Error updating place:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}