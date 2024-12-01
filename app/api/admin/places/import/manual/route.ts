import { NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { ImageService } from '@/lib/services/core/ImageService';
import { protectApiRoute } from '@/lib/auth/protect-api';
import { createError, AppError } from '@/lib/errors/AppError';

async function handleManualImport(req: Request) {
  try {
    const { previewId, placeId, noteAuthor } = await req.json();

    if (!previewId || !placeId) {
      throw createError.validation('previewId et placeId sont requis');
    }

    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

    // Créer un preview temporaire avec le placeId
    const tempPreview = {
      original: { Title: previewId, Note: noteAuthor },
      status: 'pending' as const,
      enriched: {
        success: false,
        placeId
      }
    };

    // Enrichir le preview
    const { preview: enrichedPreview } = await enrichmentService.enrichPreview(tempPreview);

    const savedPreview = enrichedPreview;

    return NextResponse.json({ success: true, preview: savedPreview });

  } catch (error) {
    console.error('Error in manual import:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          error: 'Erreur lors de l\'import manuel',
          details: error.message
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'import manuel',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(handleManualImport, 'admin'); 