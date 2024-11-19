// app/api/admin/places/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';

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
    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

    // Enrichir les données
    const enrichmentResult = await enrichmentService.enrichBatch(previews);

    console.log('Enrichissement terminé:', {
      total: enrichmentResult.stats.total,
      success: enrichmentResult.stats.success,
      failed: enrichmentResult.stats.failed
    });

    return NextResponse.json({
      success: true,
      previews: enrichmentResult.results,
      stats: enrichmentResult.stats,
      message: `Enrichissement terminé : ${enrichmentResult.stats.success} succès, ${enrichmentResult.stats.failed} erreurs sur ${enrichmentResult.stats.total} lieux`
    });

  } catch (error) {
    console.error('Fatal error during enrichment:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'enrichissement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}