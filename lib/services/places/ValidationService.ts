// lib/services/places/ValidationService.ts
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { LocationService } from '@/lib/services/core/LocationService';


interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ValidationService {
  constructor(private locationService: LocationService) {}

  validatePlace(place: Place): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validation du nom
    if (!place.name?.fr) {
      errors.push('Le nom en français est requis');
    }

    // Validation de la localisation
    if (!place.location?.point?.coordinates || 
        !Array.isArray(place.location.point.coordinates) || 
        place.location.point.coordinates.length !== 2) {
      errors.push('Les coordonnées sont invalides ou manquantes');
    } else {
      const [lng, lat] = place.location.point.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' ||
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        errors.push('Les coordonnées sont hors limites');
      }
    }

    // Validation de l'adresse
    if (!place.location?.address?.full?.fr || !place.location.address.formatted?.fr) {
      errors.push('L\'adresse complète en français est requise');
    }

    // Validation des images
    if (!place.images || place.images.length === 0) {
      errors.push('Au moins une image est requise');
    } else if (!place.images.some(img => img.isCover)) {
      errors.push('Une image de couverture est requise');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }


  async validateBatch(previews: ImportPreview[]): Promise<{
    results: ImportPreview[];
    stats: {
      total: number;
      valid: number;
      invalid: number;
      warnings: number;
    };
  }> {
    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;

    const results = await Promise.all(
      previews.map(async (preview) => {
        if (!preview.enriched?.place) {
          invalidCount++;
          return {
            ...preview,
            status: 'error',
            validationErrors: ['Place enrichie manquante']
          };
        }

        const validation = this.validatePlace(preview.enriched.place);

        if (validation.warnings.length > 0) {
          warningCount++;
        }

        if (validation.isValid) {
          validCount++;
          return {
            ...preview,
            status: 'success',
            validationWarnings: validation.warnings
          };
        } else {
          invalidCount++;
          return {
            ...preview,
            status: 'error',
            validationErrors: validation.errors,
            validationWarnings: validation.warnings
          };
        }
      })
    );

    return {
      results: results.map(r => ({
        ...r,
        status: r.status as "error" | "success" | "pending"
      })),
      stats: {
        total: previews.length,
        valid: validCount,
        invalid: invalidCount,
        warnings: warningCount
      }
    };
  }
}