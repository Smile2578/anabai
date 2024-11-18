// app/api/admin/places/validate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { ValidationService } from '@/lib/services/validation';
import { LocationService } from '@/lib/services/location';
import { ImportPreview } from '@/types/place';

export async function POST(req: NextRequest) {
  try {
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    const placeRepository = new PlaceRepository(db);
    const validationService = new ValidationService();
    const validationResults: ImportPreview[] = [];

    // Traitement de chaque aperçu
    for (const preview of previews) {
      try {
        // Validation initiale
        const validationErrors = validationService.validateImportPreview(preview);

        // Vérifier les doublons si nous avons un placeId
        let existingPlace = undefined;
        if (preview.enriched?.placeId) {
          existingPlace = await placeRepository.findByPlaceId(preview.enriched.placeId);
        }

        // Vérifier la localisation si nous avons des coordonnées
        if (preview.enriched?.place?.location?.coordinates) {
          const coordinates = preview.enriched.place.location.coordinates;
          if (!LocationService.validateCoordinates(coordinates)) {
            validationErrors.push('Coordonnées invalides');
          } else {
            const coordObj = LocationService.convertCoordinates(coordinates);
            if (!LocationService.isInJapan(coordObj)) {
              validationErrors.push('Ce lieu n\'est pas situé au Japon');
            }
          }
        }

        // Validation complète si nous avons des données enrichies
        if (preview.enriched?.place) {
          const placeValidationErrors = validationService.validatePlace(preview.enriched.place);
          validationErrors.push(...placeValidationErrors);
        }

        validationResults.push({
          ...preview,
          status: validationErrors.length > 0 ? 'error' : 'success',
          validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
          existingPlace
        });

      } catch (error) {
        console.error('Error during validation:', error);
        validationResults.push({
          ...preview,
          status: 'error',
          validationErrors: [
            error instanceof Error ? error.message : 'Erreur de validation'
          ]
        });
      }
    }

    // Statistiques de validation
    const stats = {
      total: validationResults.length,
      valid: validationResults.filter(r => !r.validationErrors?.length).length,
      invalid: validationResults.filter(r => r.validationErrors?.length > 0).length,
      duplicates: validationResults.filter(r => r.existingPlace).length
    };

    return NextResponse.json({
      results: validationResults,
      stats
    });

  } catch (error) {
    console.error('Error during validation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation des données' },
      { status: 500 }
    );
  }
}