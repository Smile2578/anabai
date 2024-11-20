// lib/services/places/ValidationService.ts
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { VALIDATION_RULES } from '@/lib/config/validation-rules';
import { LocationService } from '@/lib/services/core/LocationService';
import { PLACE_CATEGORIES } from '@/lib/config/categories';

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
    if (!place.name?.fr || place.name.fr.length < VALIDATION_RULES.name.minLength) {
      errors.push('Le nom en français est requis');
    }
    if (!place.name?.ja && VALIDATION_RULES.name.required.ja) {
      errors.push('Le nom en japonais est requis');
    }

    // Validation de la localisation
    if (place.location?.point?.coordinates) {
      const coordinates = place.location.point.coordinates;
      const isValidLocation = LocationService.validateCoordinates({
        lng: coordinates.lng,
        lat: coordinates.lat
      });
      if (!isValidLocation) {
        errors.push('Les coordonnées doivent être situées au Japon');
      }
    } else if (VALIDATION_RULES.location.coordinates.required) {
      errors.push('Les coordonnées sont requises');
    }

    // Validation de l'adresse
    if (!place.location?.address?.full?.fr) {
      errors.push('L\'adresse en français est requise');
    }
    if (!place.location?.address?.prefecture) {
      errors.push('La préfecture est requise');
    }
    if (!place.location?.address?.city) {
      errors.push('La ville est requise');
    }

    // Validation des images
    if (!place.images || place.images.length === 0) {
      errors.push('Au moins une image est requise');
    } else {
      if (!place.images.some(img => img.isCover)) {
        errors.push('Une image de couverture est requise');
      }
      if (place.images.length > VALIDATION_RULES.images.maxCount) {
        warnings.push(`Le nombre d'images ne devrait pas dépasser ${VALIDATION_RULES.images.maxCount}`);
      }
    }

    // Validation de la catégorie et sous-catégories
    if (!place.category || !VALIDATION_RULES.category.values.includes(place.category)) {
      errors.push('La catégorie est invalide');
    } else {
      const validSubcategories = PLACE_CATEGORIES[place.category].subcategories;
      const invalidSubcategories = place.subcategories.filter(
        sub => !validSubcategories.includes(sub as never)
      );
      if (invalidSubcategories.length > 0) {
        errors.push(`Sous-catégories invalides : ${invalidSubcategories.join(', ')}`);
      }
    }

    // Validation du prix
    if (place.pricing?.level) {
      if (
        place.pricing.level < VALIDATION_RULES.pricing.level.min ||
        place.pricing.level > VALIDATION_RULES.pricing.level.max
      ) {
        errors.push('Niveau de prix invalide');
      }
    }

    // Validation des horaires
    if (place.openingHours) {
      if (!place.openingHours.weekdayTexts?.fr) {
        warnings.push('Les horaires en français sont recommandés');
      }
      if (!place.openingHours.periods || place.openingHours.periods.length === 0) {
        warnings.push('Les périodes d\'ouverture sont recommandées');
      }
    }

    // Validation des métadonnées
    if (!place.metadata.source) {
      errors.push('La source est requise');
    }
    if (!VALIDATION_RULES.metadata.status.values.includes(place.metadata?.status as 'active' | 'inactive')) {
      errors.push('Le statut est invalide');
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