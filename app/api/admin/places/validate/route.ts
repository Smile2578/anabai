// app/api/admin/places/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ValidationService } from '@/lib/services/places/ValidationService';
import { LocationService } from '@/lib/services/core/LocationService';
import { StorageService } from '@/lib/services/places/StorageService';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';

export async function POST(req: NextRequest) {
  try {
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Initialiser les services
    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);

    // Connexion à la base de données pour vérifier les doublons
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    const placeRepository = new PlaceRepository(db);
    const storageService = new StorageService(placeRepository);

    // Vérifier les doublons
    const placeIds = previews
      .filter(preview => preview.enriched?.placeId)
      .map(preview => preview.enriched!.placeId!);
    
    const existingPlaceIds = await storageService.checkExistingPlaces(placeIds);

    // Valider les données
    const validationResult = await validationService.validateImportBatch(previews);

    // Ajouter l'information sur les doublons aux résultats
    const resultsWithDuplicates = validationResult.results.map(preview => ({
      ...preview,
      isDuplicate: preview.enriched?.placeId ? 
        existingPlaceIds.has(preview.enriched.placeId) : 
        false
    }));

    console.log('Validation terminée:', {
      total: validationResult.stats.total,
      valid: validationResult.stats.valid,
      invalid: validationResult.stats.invalid,
      duplicates: validationResult.stats.duplicates
    });

    return NextResponse.json({
      results: resultsWithDuplicates,
      stats: validationResult.stats,
      message: `Validation terminée : ${validationResult.stats.valid} valides, ${validationResult.stats.invalid} invalides, ${validationResult.stats.duplicates} doublons sur ${validationResult.stats.total} lieux`
    });

  } catch (error) {
    console.error('Fatal error during validation:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}