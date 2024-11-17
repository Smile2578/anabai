// app/api/admin/places/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { ImportPreview } from '@/types/place';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { previews } = data as { previews: ImportPreview[] };

    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    // Validation des données
    const validationResults = await Promise.all(
      previews.map(async (preview) => {
        try {
          const placeId = preview.enriched?.placeId;
          if (!placeId) {
            return {
              ...preview,
              validationErrors: ['Place ID manquant']
            };
          }

          // Vérification des doublons
          const existingPlace = await placeRepository.findByPlaceId(placeId);
          if (existingPlace) {
            return {
              ...preview,
              validationErrors: ['Ce lieu existe déjà dans la base de données'],
              existingPlace
            };
          }

          // Validation des données obligatoires
          const validationErrors: string[] = [];
          const place = preview.enriched?.place;

          if (!place) {
            return {
              ...preview,
              validationErrors: ['Données enrichies manquantes']
            };
          }

          if (!place.name?.fr) validationErrors.push('Nom français manquant');
          if (!place.location?.coordinates) validationErrors.push('Coordonnées manquantes');
          if (!place.location?.address?.fr) validationErrors.push('Adresse française manquante');
          if (!place.category) validationErrors.push('Catégorie manquante');

          return {
            ...preview,
            validationErrors: validationErrors.length > 0 ? validationErrors : undefined
          };
        } catch (error) {
          console.error('Erreur de validation:', error);
          return {
            ...preview,
            validationErrors: ['Erreur lors de la validation']
          };
        }
      })
    );

    // Statistiques de validation
    const stats = {
      total: validationResults.length,
      valid: validationResults.filter(r => !r.validationErrors).length,
      invalid: validationResults.filter(r => r.validationErrors && r.validationErrors.length > 0).length,
      duplicates: validationResults.filter(r => 'existingPlace' in r).length
    };

    return NextResponse.json({
      results: validationResults,
      stats
    });

  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la validation des données' },
      { status: 500 }
    );
  }
}