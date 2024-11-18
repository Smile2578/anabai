// app/api/admin/places/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';

export async function POST(req: NextRequest) {
  try {
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    // Filtrer uniquement les lieux valides et enrichis
    const validPreviews = previews.filter(
      preview => preview.status === 'success' && 
                preview.enriched?.success && 
                preview.enriched.place
    );

    if (validPreviews.length === 0) {
      return NextResponse.json({
        success: true,
        savedCount: 0,
        message: 'Aucun lieu valide à sauvegarder'
      });
    }

    // Sauvegarder les lieux
    const savedPlaces = await Promise.all(
      validPreviews.map(async preview => {
        if (!preview.enriched?.place) return null;

        const placeData = {
          ...preview.enriched.place,
          metadata: {
            ...preview.enriched.place.metadata,
            placeId: preview.enriched.placeId,
            lastEnriched: new Date(),
            status: 'brouillon'
          },
          isActive: true
        };

        return placeRepository.create(placeData);
      })
    );

    const savedCount = savedPlaces.filter(Boolean).length;

    return NextResponse.json({
      success: true,
      savedCount,
      message: `${savedCount} lieu(x) importé(s) avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la sauvegarde des lieux' },
      { status: 500 }
    );
  }
}