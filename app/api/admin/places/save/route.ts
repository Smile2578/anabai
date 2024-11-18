// app/api/admin/places/save/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { ImageCacheService } from '@/lib/services/imageCache';
import { LocationService } from '@/lib/services/location';
import fs from 'fs/promises';
import path from 'path';

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
    const imageCacheService = new ImageCacheService();
    const locationService = new LocationService();

    // Filtrer uniquement les lieux valides
    const validPreviews = previews.filter(
      preview => preview.status === 'success' && 
                preview.enriched?.success && 
                preview.enriched.place &&
                !preview.validationErrors?.length
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

        try {
          // Mise en cache des images
          const cachedImages = await Promise.all(
            preview.enriched.place.images.slice(0, 3).map(async (image: { url: string }) => {
              try {
                // S'assurer que le dossier de cache existe
                const cacheDir = path.dirname(imageCacheService.getCachePath(image.url));
                await fs.mkdir(cacheDir, { recursive: true });
                
                const cachedUrl = await imageCacheService.cacheImage(image.url);
                return {
                  ...image,
                  url: cachedUrl
                };
              } catch (error) {
                console.error('Erreur lors de la mise en cache de l\'image:', error);
                return image; // Retourner l'image originale en cas d'erreur
              }
            })
          );

          // Préparation des données du lieu
          const placeData = {
            ...preview.enriched.place,
            images: cachedImages,
            metadata: {
              ...preview.enriched.place.metadata,
              placeId: preview.enriched.placeId,
              lastEnriched: new Date(),
              status: 'brouillon'
            },
            isActive: true
          };
          // Valider les coordonnées avec LocationService
          if (!LocationService.validateCoordinates(placeData.location.coordinates)) {
            throw new Error('Coordonnées invalides');
          }

          return await placeRepository.create(placeData);
        } catch (error) {
          console.error('Error saving place:', error);
          return null;
        }
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