// lib/services/places/ValidationService.ts
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { VALIDATION_RULES } from '@/lib/config/validation-rules';
import { LocationService } from '@/lib/services/core/LocationService';

export class ValidationService {
  constructor(private locationService: LocationService) {}

  validatePlace(place: Partial<Place>): string[] {
    const errors: string[] = [];

    // Validation basique des champs requis
    if (!place.name?.fr || place.name.fr.length < VALIDATION_RULES.name.minLength) {
      errors.push('Le nom en français est requis');
    }

    if (!place.location?.point) {
      errors.push('Les coordonnées sont requises');
    } else if (!LocationService.validateCoordinates([place.location.point.coordinates.lng, place.location.point.coordinates.lat])) {
      errors.push('Les coordonnées sont invalides');
    }

    // Validation des images
    if (!place.images || place.images.length < VALIDATION_RULES.images.minCount) {
      errors.push(`Au moins ${VALIDATION_RULES.images.minCount} image est requise`);
    }
    if (place.images && !place.images.some(img => img.isCover)) {
      errors.push('Une image de couverture est requise');
    }

    // Validation de la catégorie
    if (!place.category || !VALIDATION_RULES.category.values.includes(place.category)) {
      errors.push('La catégorie est invalide');
    }

    return errors;
  }

  async validateImportBatch(previews: ImportPreview[]): Promise<{
    results: ImportPreview[];
    stats: {
      total: number;
      valid: number;
      invalid: number;
      duplicates: number;
    };
  }> {
    const results: ImportPreview[] = [];
    let validCount = 0;
    let invalidCount = 0;
    const duplicateCount = 0;

    for (const preview of previews) {
      try {
        const validationErrors: string[] = [];

        if (!preview.enriched?.place) {
          throw new Error('Données enrichies manquantes');
        }

        // Validation du lieu
        const placeErrors = this.validatePlace(preview.enriched.place);
        validationErrors.push(...placeErrors);

        // Ajouter d'autres validations spécifiques si nécessaire

        if (validationErrors.length === 0) {
          validCount++;
          results.push({
            ...preview,
            status: 'success'
          });
        } else {
          invalidCount++;
          results.push({
            ...preview,
            status: 'error',
            validationErrors
          });
        }

      } catch (error) {
        console.error('Validation error:', error);
        invalidCount++;
        results.push({
          ...preview,
          status: 'error',
          validationErrors: [error instanceof Error ? error.message : 'Erreur inconnue']
        });
      }
    }

    return {
      results,
      stats: {
        total: previews.length,
        valid: validCount,
        invalid: invalidCount,
        duplicates: duplicateCount
      }
    };
  }
}