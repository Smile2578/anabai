// app/api/admin/places/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImportService } from '@/lib/services/places/ImportService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Initialiser les services
    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const importService = new ImportService(googlePlacesService, imageService);

    // Lire le contenu du fichier
    const fileContent = await file.text();
    
    // Traiter le CSV
    const result = await importService.processCSV(fileContent);

    console.log(`Import initial terminé: ${result.stats.success} succès, ${result.stats.failed} échecs`);

    return NextResponse.json({
      success: result.success,
      previews: result.previews,
      stats: {
        total: result.stats.total,
        success: result.stats.success,
        failed: result.stats.failed
      },
      message: `Import initial : ${result.stats.success} valides, ${result.stats.failed} invalides sur ${result.stats.total} entrées`
    });

  } catch (error) {
    console.error('Fatal error during import:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du fichier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}