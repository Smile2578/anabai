// lib/services/places/ValidationService.ts
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { LocationService } from '@/lib/services/core/LocationService';
import { VALIDATION_RULES } from '@/lib/config/validation-rules';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export class ValidationService {
  constructor(private locationService: LocationService) {}

  private validateLocation(place: Place): ValidationError[] {
    const errors: ValidationError[] = [];

    // Vérifier la présence des coordonnées
    if (!place.location?.point?.coordinates || 
        !Array.isArray(place.location.point.coordinates) || 
        place.location.point.coordinates.length !== 2) {
      errors.push({
        field: 'location.coordinates',
        message: 'Coordonnées manquantes ou invalides',
        severity: 'error'
      });
      return errors;
    }

    const [lng, lat] = place.location.point.coordinates;

    // Vérifier les limites globales
    if (typeof lng !== 'number' || typeof lat !== 'number' ||
        lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      errors.push({
        field: 'location.coordinates',
        message: 'Coordonnées hors limites',
        severity: 'error'
      });
    }

    // Vérifier si dans les limites du Japon
    const isInJapan = LocationService.validateCoordinates({
      lng, lat
    });

    if (!isInJapan) {
      errors.push({
        field: 'location.coordinates',
        message: 'Les coordonnées doivent être au Japon',
        severity: 'error'
      });
    }

    // Vérifier l'adresse
    if (!place.location.address?.prefecture) {
      errors.push({
        field: 'location.address.prefecture',
        message: 'Préfecture manquante',
        severity: 'error'
      });
    }

    if (!place.location.address?.city) {
      errors.push({
        field: 'location.address.city',
        message: 'Ville manquante',
        severity: 'warning'
      });
    }

    return errors;
  }

  private validateImages(place: Place): ValidationError[] {
    const errors: ValidationError[] = [];

    // Vérifier présence d'images
    if (!place.images || place.images.length === 0) {
      errors.push({
        field: 'images',
        message: 'Au moins une image est requise',
        severity: 'error'
      });
      return errors;
    }

    // Vérifier image de couverture
    if (!place.images.some(img => img.isCover)) {
      errors.push({
        field: 'images',
        message: 'Une image de couverture est requise',
        severity: 'error'
      });
    }

    // Vérifier le nombre maximum d'images
    if (place.images.length > VALIDATION_RULES.images.maxCount) {
      errors.push({
        field: 'images',
        message: `Maximum ${VALIDATION_RULES.images.maxCount} images autorisées`,
        severity: 'error'
      });
    }

    return errors;
  }

  private validateNames(place: Place): ValidationError[] {
    const errors: ValidationError[] = [];

    // Vérifier le nom français
    if (!place.name?.fr) {
      errors.push({
        field: 'name.fr',
        message: 'Le nom en français est requis',
        severity: 'error'
      });
    } else if (place.name.fr.length < VALIDATION_RULES.name.minLength) {
      errors.push({
        field: 'name.fr',
        message: `Le nom doit faire au moins ${VALIDATION_RULES.name.minLength} caractères`,
        severity: 'error'
      });
    }

    // Vérifier le nom japonais (warning si absent)
    if (!place.name?.ja) {
      errors.push({
        field: 'name.ja',
        message: 'Le nom en japonais est recommandé',
        severity: 'warning'
      });
    }

    return errors;
  }

  private validateMetadata(place: Place): ValidationError[] {
    const errors: ValidationError[] = [];

    // Vérifier la source
    if (!place.metadata?.source) {
      errors.push({
        field: 'metadata.source',
        message: 'La source est requise',
        severity: 'error'
      });
    }

    // Vérifier le statut
    if (!VALIDATION_RULES.metadata.status.values.includes(place.metadata?.status)) {
      errors.push({
        field: 'metadata.status',
        message: 'Statut invalide',
        severity: 'error'
      });
    }

    return errors;
  }

  validatePlace(place: Place): ValidationResult {
    const allErrors: ValidationError[] = [
      ...this.validateLocation(place),
      ...this.validateImages(place),
      ...this.validateNames(place),
      ...this.validateMetadata(place)
    ];

    const errors = allErrors
      .filter(e => e.severity === 'error')
      .map(e => e.message);

    const warnings = allErrors
      .filter(e => e.severity === 'warning')
      .map(e => e.message);

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
            status: 'error' as const,
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
            status: 'success' as const,
            validationWarnings: validation.warnings
          };
        } else {
          invalidCount++;
          return {
            ...preview,
            status: 'error' as const,
            validationErrors: validation.errors,
            validationWarnings: validation.warnings
          };
        }
      })
    );

    return {
      results,
      stats: {
        total: previews.length,
        valid: validCount,
        invalid: invalidCount,
        warnings: warningCount
      }
    };
  }
}