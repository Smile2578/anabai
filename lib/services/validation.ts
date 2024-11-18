// lib/services/validation.ts

import { Place, ImportPreview } from '@/types/place';
import { LocationService } from './location';

export class ValidationService {
  validatePlace(place: Partial<Place>): string[] {
    const errors: string[] = [];

    // Validation du nom
    if (!place.name?.fr) {
      errors.push('Le nom en français est requis');
    }
    if (!place.name?.ja) {
      errors.push('Le nom en japonais est requis');
    }

    // Validation de la localisation
    if (!place.location?.coordinates) {
      errors.push('Les coordonnées sont requises');
    } else if (!LocationService.validateCoordinates(place.location.coordinates)) {
      errors.push('Les coordonnées sont invalides');
    } else {
      // Vérifier si les coordonnées sont au Japon
      const coords = LocationService.convertCoordinates(place.location.coordinates);
      if (!LocationService.isInJapan(coords)) {
        errors.push('Les coordonnées doivent être situées au Japon');
      }
    }

    // Validation des adresses
    if (!place.location?.address?.fr) {
      errors.push('L\'adresse en français est requise');
    }
    if (!place.location?.address?.ja) {
      errors.push('L\'adresse en japonais est requise');
    }

    // Validation de la catégorie
    if (!place.category) {
      errors.push('La catégorie est requise');
    } else if (!this.isValidCategory(place.category)) {
      errors.push('La catégorie est invalide');
    }

    // Validation des sous-catégories
    if (!place.subcategories || !Array.isArray(place.subcategories)) {
      errors.push('Les sous-catégories doivent être un tableau');
    }

    // Validation des images
    if (!place.images || !Array.isArray(place.images)) {
      errors.push('Les images doivent être un tableau');
    } else {
      if (!place.images.some(img => img.isCover)) {
        errors.push('Une image de couverture est requise');
      }
      if (place.images.length > 10) {
        errors.push('Le nombre maximum d\'images est de 10');
      }
    }

    // Validation des prix
    if (place.pricing?.priceRange) {
      if (![1, 2, 3, 4, 5].includes(place.pricing.priceRange)) {
        errors.push('Le niveau de prix doit être entre 1 et 5');
      }
    }

    // Validation de l'état
    if (!place.isActive) {
      errors.push('Le lieu doit être actif');
    }

    return errors;
  }

  validateImportPreview(preview: ImportPreview): string[] {
    const errors: string[] = [];

    // Validation des données originales
    if (!preview.original.Title) {
      errors.push('Le titre est requis');
    }

    if (!preview.original.URL) {
      errors.push('L\'URL est requise');
    } else if (!preview.original.URL.includes('google.com/maps')) {
      errors.push('L\'URL doit être une URL Google Maps');
    }

    // Validation des données enrichies
    if (preview.enriched) {
      if (!preview.enriched.placeId) {
        errors.push('L\'ID du lieu est requis pour l\'enrichissement');
      }
      if (preview.enriched.success && !preview.enriched.place) {
        errors.push('Les données enrichies sont manquantes');
      }
      if (!preview.enriched.success && !preview.enriched.error) {
        errors.push('Une erreur est survenue mais aucun message n\'est fourni');
      }
    }

    return errors;
  }

  private isValidCategory(category: string): boolean {
    const validCategories = [
      'Restaurant',
      'Hôtel',
      'Visite',
      'Shopping',
      'Café & Bar'
    ];
    return validCategories.includes(category);
  }

  // Valider les mises à jour en masse
  validateBulkUpdates(updates: Array<{ id: string; place: Partial<Place> }>): {
    valid: Array<{ id: string; place: Partial<Place> }>;
    invalid: Array<{ id: string; errors: string[] }>;
  } {
    return updates.reduce(
      (acc, { id, place }) => {
        const errors = this.validatePlace(place);
        if (errors.length === 0) {
          acc.valid.push({ id, place });
        } else {
          acc.invalid.push({ id, errors });
        }
        return acc;
      },
      { valid: [] as Array<{ id: string; place: Partial<Place> }>, invalid: [] as Array<{ id: string; errors: string[] }> }
    );
  }
}