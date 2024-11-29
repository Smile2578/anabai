import { NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';
import { placeRepository } from '@/lib/repositories/place-repository';
import connectDB from '@/lib/db/connection';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

async function handleEnrichPlaceImage(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    
    const { placeId } = await req.json();
    
    if (!placeId) {
      return NextResponse.json(
        { error: 'PlaceId est requis' },
        { status: 400 }
      );
    }

    // Services
    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

    // Enrichir l'image
    const enrichedImage = await enrichmentService.enrichSingleImage(placeId);

    if (!enrichedImage) {
      return NextResponse.json(
        { error: 'Impossible d\'enrichir l\'image du lieu' },
        { status: 404 }
      );
    }

    // Mettre à jour le lieu avec la nouvelle image
    const updatedPlace = await placeRepository.update(placeId, {
      images: [enrichedImage],
      metadata: {
        source: 'Google Places',
        status: 'publié',
        lastEnriched: new Date()
      }
    });

    if (!updatedPlace) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      place: updatedPlace
    });

  } catch (error) {
    console.error('Error enriching place image:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'enrichissement de l\'image',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(handleEnrichPlaceImage, 'admin'); 