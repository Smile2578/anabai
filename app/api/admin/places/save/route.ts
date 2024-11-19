// app/api/admin/places/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
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

    // Connexion à la base de données
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Failed to connect to database');
    }
    const placeRepository = new PlaceRepository(db);
    const storageService = new StorageService(placeRepository);

    // Sauvegarder les lieux
    const result = await storageService.saveImportedPlaces(previews);

    console.log('Sauvegarde terminée:', {
      saved: result.savedCount,
      errors: result.errors.length
    });

    if (result.errors.length > 0) {
      console.error('Erreurs de sauvegarde:', result.errors);
    }

    return NextResponse.json({
      success: true,
      savedCount: result.savedCount,
      errors: result.errors,
      message: result.errors.length > 0
        ? `${result.savedCount} lieu(x) importé(s) avec ${result.errors.length} erreur(s)`
        : `${result.savedCount} lieu(x) importé(s) avec succès`
    });

  } catch (error) {
    console.error('Fatal error during save:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la sauvegarde',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}