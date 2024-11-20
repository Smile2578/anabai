// app/api/admin/places/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';
import connectDB from '@/lib/db/connection';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Services
    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

    // Enrichissement des previews
    const result = await enrichmentService.enrichBatch(previews);

    console.log('Enrichissement terminé:', {
      total: result.stats.total,
      success: result.stats.success,
      failed: result.stats.failed
    });

    return NextResponse.json({
      success: result.stats.failed === 0,
      results: result.results,
      stats: result.stats
    });

  } catch (error) {
    console.error('Error enriching places:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'enrichissement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}