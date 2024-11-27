// app/api/admin/places/save/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { ValidationService } from '@/lib/services/places/ValidationService';
import { LocationService } from '@/lib/services/core/LocationService';
import { StorageService } from '@/lib/services/places/StorageService';
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

interface SaveStats {
  total: number;
  saved: number;
  failed: number;
  skipped: number;
  duplicates: number;
}

async function handleSavePlaces(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    
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
    const storageService = new StorageService(placeRepository, validationService);

    // Filtrer les previews valides et enrichis
    const validPreviews = previews.filter(
      (preview): preview is ImportPreview & { enriched: { place: Place } } => 
        preview.status === 'success' && 
        preview.enriched?.success === true &&
        preview.enriched?.place !== undefined
    );

    if (validPreviews.length === 0) {
      return NextResponse.json(
        { error: 'Aucun lieu valide à sauvegarder' },
        { status: 400 }
      );
    }

    // Sauvegarder les lieux
    const result = await storageService.saveImportedPlaces(validPreviews);

    // Préparer les statistiques détaillées
    const stats: SaveStats = {
      total: previews.length,
      saved: result.savedCount,
      failed: result.errors.length,
      skipped: previews.length - validPreviews.length,
      duplicates: result.duplicates.length
    };

    // Préparer les données des erreurs
    const errors = result.errors.map(err => ({
      title: err.title,
      error: err.error
    }));

    // Préparer le message de retour
    const successRate = (stats.saved / stats.total * 100).toFixed(1);
    const message = `Sauvegarde terminée : ${stats.saved} lieux sauvegardés (${successRate}% de succès), ` +
                   `${stats.duplicates} doublons, ${stats.failed} erreurs, ${stats.skipped} ignorés`;

    // Log pour monitoring
    console.log('Save operation completed:', {
      stats,
      errors: errors.length > 0 ? errors : undefined,
      duplicates: result.duplicates.length > 0 ? result.duplicates : undefined
    });

    return NextResponse.json({
      success: result.success,
      stats,
      errors: errors.length > 0 ? errors : undefined,
      duplicates: result.duplicates.length > 0 ? result.duplicates : undefined,
      message
    });

  } catch (error) {
    console.error('Fatal error during place saving:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la sauvegarde des lieux',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

async function handleBulkUpdate(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] PATCH request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    
    const { ids, updates } = await req.json();
    
    if (!Array.isArray(ids) || !updates) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Initialiser les services
    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);
    const storageService = new StorageService(placeRepository, validationService);

    // Effectuer les mises à jour en masse
    const results = await Promise.all(
      ids.map(id => storageService.updatePlace(id, updates))
    );

    // Compiler les résultats
    const stats = {
      total: ids.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

    // Collecter les erreurs
    const errors = results
      .filter(r => !r.success && r.error)
      .map(r => r.error);

    return NextResponse.json({
      success: stats.failed === 0,
      stats,
      errors: errors.length > 0 ? errors : undefined,
      message: `Mise à jour terminée : ${stats.success} succès, ${stats.failed} échecs sur ${stats.total} lieux`
    });

  } catch (error) {
    console.error('Fatal error during bulk update:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour des lieux',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// Support CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export const POST = protectApiRoute(handleSavePlaces, 'admin');
export const PATCH = protectApiRoute(handleBulkUpdate, 'admin');