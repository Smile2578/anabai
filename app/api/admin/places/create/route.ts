// app/api/admin/places/create/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';
import { ImportPreview } from '@/types/import';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

const googlePlacesService = new GooglePlacesService();
const imageService = new ImageService();
const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

async function handleCreatePlace(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    
    const { placeId, metadata: initialMetadata } = await req.json();

    if (!placeId) {
      return NextResponse.json(
        { error: 'PlaceId is required' },
        { status: 400 }
      );
    }

    // Créer l'aperçu
    const preview: ImportPreview = {
      original: {
        Title: `Place ${placeId}`,
        URL: `https://maps.google.com/?q=${placeId}`
      },
      status: 'pending',
      enriched: {
        success: false,
        placeId
      }
    };

    // Enrichir la preview
    const enriched = await enrichmentService.enrichPreview(preview);
    
    if (!enriched.preview.enriched?.success || !enriched.preview.enriched.place) {
      return NextResponse.json(
        { error: enriched.preview.enriched?.error || 'Échec de l\'enrichissement' },
        { status: 400 }
      );
    }

    // Fusionner les métadonnées initiales avec celles enrichies
    const place = {
      ...enriched.preview.enriched.place,
      metadata: {
        ...enriched.preview.enriched.place.metadata,
        ...initialMetadata,
      }
    };

    // Sauvegarder le lieu
    const savedPlace = await placeRepository.create(place);
    
    if (!savedPlace) {
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde' },
        { status: 500 }
      );
    }

    return NextResponse.json(savedPlace);

  } catch (error) {
    console.error('Error in create place route:', error);
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(handleCreatePlace, 'admin');