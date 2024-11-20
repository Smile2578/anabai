// app/api/admin/places/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { ImportService } from '@/lib/services/places/ImportService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/admin/places/import
 * 
 * Route pour l'import de lieux via CSV. 
 * Le fichier doit être envoyé via FormData avec la clé 'file'.
 * 
 * @param req NextRequest contenant le fichier CSV
 * @returns NextResponse avec les résultats de l'import
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Récupération et validation du fichier
    const formData = await req.formData();
    const file = formData.get('file');

    // Vérifier si c'est bien un fichier
    if (!file || !(file instanceof File)) {
      return NextResponse.json({
        success: false,
        error: 'Veuillez fournir un fichier CSV'
      }, { status: 400 });
    }

    // Vérifier le type et l'extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({
        success: false,
        error: 'Le fichier doit être au format CSV'
      }, { status: 400 });
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        error: `Le fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }, { status: 400 });
    }

    // 2. Lecture du fichier
    const fileContent = await file.text();
    if (!fileContent.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Le fichier est vide'
      }, { status: 400 });
    }

    // 3. Initialisation des services
    const googlePlacesService = new GooglePlacesService();
    const importService = new ImportService(googlePlacesService);

    // 4. Traitement du CSV
    const result = await importService.processCSV(fileContent);

    // 5. Construction de la réponse
    const response = {
      success: result.success,
      stats: {
        total: result.stats.total,
        success: result.stats.success,
        failed: result.stats.failed
      },
      previews: result.previews,
      message: `Import initial : ${result.stats.success} lieux valides, ${result.stats.failed} invalides sur ${result.stats.total} entrées`
    };

    // Log pour le monitoring
    console.log(JSON.stringify({
      event: 'import_completed',
      filename: file.name,
      filesize: file.size,
      stats: response.stats
    }));

    return NextResponse.json(response);

  } catch (error) {
    // Log détaillé de l'erreur
    console.error('Erreur lors de l\'import:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });

    // Réponse d'erreur
    return NextResponse.json({
      success: false,
      error: 'Erreur lors du traitement du fichier',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// Optionnel: Route OPTIONS pour CORS si nécessaire
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