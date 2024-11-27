// app/api/admin/places/enrich/route.ts
import { NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';
import connectDB from '@/lib/db/connection';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

async function handleEnrichPlaces(req: Request, session: SessionWithUser) {
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

export const POST = protectApiRoute(handleEnrichPlaces, 'admin');