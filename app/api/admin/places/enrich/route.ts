// app/api/admin/places/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';   
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { GoogleMapsService } from '@/lib/services/googleMaps';
import { validateJapanCoordinates } from '@/lib/utils/validation';
import { PlaceDocument } from '@/types/place';

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
  
      const validPreviews = previews.filter(
        preview => preview.status === 'success' && 
                  preview.enriched?.success && 
                  preview.enriched.place
      );
  
      if (validPreviews.length === 0) {
        return NextResponse.json({
          success: true,
          savedCount: 0,
          message: 'Aucun lieu à sauvegarder'
        });
      }
  
      const results = await Promise.all(
        validPreviews.map(async preview => {
          try {
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
  
            return await placeRepository.create(placeData);
          } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            return null;
          }
        })
      );
  
      const savedCount = results.filter(Boolean).length;
  
      return NextResponse.json({
        success: true,
        savedCount,
        message: `${savedCount} lieu(x) importé(s)`
      });
  
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      return NextResponse.json(
        { error: 'Erreur de sauvegarde' },
        { status: 500 }
      );
    }
  }