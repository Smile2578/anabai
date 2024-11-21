// app/api/admin/places/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';
import { ImportPreview } from '@/types/import';

const googlePlacesService = new GooglePlacesService();
const imageService = new ImageService();
const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { placeId } = await req.json();

    if (!placeId) {
      return NextResponse.json(
        { error: 'PlaceId is required' },
        { status: 400 }
      );
    }

    // Utiliser la structure existante d'ImportPreview
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

    // Utiliser l'enrichisseur existant qui fonctionne bien
    const enriched = await enrichmentService.enrichPreview(preview);
    
    if (!enriched.preview.enriched?.success || !enriched.preview.enriched.place) {
      return NextResponse.json(
        { error: enriched.preview.enriched?.error || 'Échec de l\'enrichissement' },
        { status: 400 }
      );
    }

    // Sauvegarder le lieu enrichi
    const savedPlace = await placeRepository.create(enriched.preview.enriched.place);
    
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