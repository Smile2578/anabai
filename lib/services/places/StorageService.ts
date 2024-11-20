// lib/services/places/StorageService.ts
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

export class StorageService {
  constructor(
    private repository: PlaceRepository,
    private validationService: ValidationService
  ) {}

  async saveImportedPlaces(previews: ImportPreview[]): Promise<StorageResult> {
    const errors: Array<{ title: string; error: string }> = [];
    const duplicates: string[] = [];
    let savedCount = 0;

    // Filtrer les previews valides
    const validPreviews = previews.filter(
      preview => preview.status === 'success' && 
                preview.enriched?.success && 
                preview.enriched.place
    );

    // Vérifier les doublons avant de sauvegarder
    const placeIds = validPreviews
      .map(preview => preview.enriched?.place?.metadata.placeId)
      .filter((id): id is string => Boolean(id));

    const existingPlaces = await this.repository.findByPlaceIds(placeIds);
    const existingPlaceIds = new Set(existingPlaces.map(p => p.metadata.placeId!));

    // Sauvegarder chaque lieu
    for (const preview of validPreviews) {
      try {
        if (!preview.enriched?.place) {
          throw new Error('Données du lieu manquantes');
        }

        // Vérifier si c'est un doublon
        if (preview.enriched.place.metadata.placeId && 
            existingPlaceIds.has(preview.enriched.place.metadata.placeId)) {
          duplicates.push(preview.enriched.place.metadata.placeId);
          continue;
        }

        // Validation finale avant sauvegarde
        const validation = await this.validationService.validatePlace(preview.enriched.place);
        if (!validation.isValid) {
          throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
        }

        const savedPlace = await this.repository.create(preview.enriched.place);
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

  async updatePlace(id: string, updates: Partial<Place>): Promise<UpdateResult> {
    try {
      // Récupérer le lieu existant
      const existingPlace = await this.repository.findById(id);
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
      const saved = await this.repository.update(id, updatedPlace);
      if (!saved) {
        return { success: false, error: 'Échec de la mise à jour' };
      }

      return { success: true, place: saved };

    } catch (error) {
      console.error('Error updating place:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async updateStatus(ids: string[], status: Status): Promise<{
    success: boolean;
    updated: number;
    failed: string[];
  }> {
    const failed: string[] = [];
    let updated = 0;

    for (const id of ids) {
      try {
        const result = await this.repository.updateStatus(id, status);
        if (result) {
          updated++;
        } else {
          failed.push(id);
        }
      } catch (error) {
        console.error(`Failed to update status for ${id}:`, error);
        failed.push(id);
      }
    }

    return {
      success: failed.length === 0,
      updated,
      failed
    };
  }

  async toggleGemStatus(id: string): Promise<UpdateResult> {
    try {
      const place = await this.repository.findById(id);
      if (!place) {
        return { success: false, error: 'Lieu non trouvé' };
      }

      const updated = await this.repository.update(id, {
        ...place,
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

  async deletePlace(id: string, soft = true): Promise<{ success: boolean; error?: string }> {
    try {
      if (soft) {
        const updated = await this.repository.update(id, {
          isActive: false,
          updatedAt: new Date()
        });
        return {
          success: Boolean(updated)
        };
      } else {
        const deleted = await this.repository.delete(id);
        return {
          success: deleted
        };
      }
    } catch (error) {
      console.error('Error deleting place:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  async restorePlace(id: string): Promise<UpdateResult> {
    try {
      const updated = await this.repository.update(id, {
        isActive: true,
        updatedAt: new Date()
      });

      return {
        success: Boolean(updated),
        place: updated || undefined
      };
    } catch (error) {
      console.error('Error restoring place:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}