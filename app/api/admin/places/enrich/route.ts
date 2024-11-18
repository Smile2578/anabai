// app/api/admin/places/enrich/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { GoogleMapsService } from '@/lib/services/googleMaps';
import { ImportPreview } from '@/types/place';

// Utilitaire pour ajouter un délai
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  try {
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    const googleMapsService = new GoogleMapsService();
    const enrichedPreviews: ImportPreview[] = [];
    let successCount = 0;
    
    // Traitement de chaque preview avec un délai entre les requêtes
    for (const preview of previews) {
      try {
        // Vérification de l'ID de lieu
        if (!preview.enriched?.placeId) {
          console.warn('Missing place ID for preview:', preview);
          enrichedPreviews.push({
            ...preview,
            status: 'error',
            enriched: {
              success: false,
              error: 'ID de lieu manquant'
            }
          });
          continue;
        }

        // Log pour le debugging
        console.log('Processing place:', {
          title: preview.original.Title,
          placeId: preview.enriched.placeId
        });

        // Ajout d'un délai entre les requêtes pour éviter les limitations
        await delay(500);

        // Enrichissement avec l'API Google Places
        const enrichedPlace = await googleMapsService.getPlaceDetails(preview.enriched.placeId);

        // Vérification des données enrichies
        if (!enrichedPlace || !enrichedPlace.name) {
          throw new Error('Données enrichies invalides');
        }

        // Ajouter les données originales aux données enrichies
        enrichedPreviews.push({
          ...preview,
          status: 'success',
          enriched: {
            success: true,
            place: {
              ...enrichedPlace,
              originalData: {
                title: preview.original.Title,
                note: preview.original.Note,
                url: preview.original.URL,
                comment: preview.original.Comment
              }
            },
            placeId: preview.enriched.placeId
          }
        });
        
        successCount++;
        console.log(`Successfully enriched place: ${preview.original.Title}`);

      } catch (error) {
        console.error('Error enriching place:', {
          title: preview.original.Title,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        enrichedPreviews.push({
          ...preview,
          status: 'error',
          enriched: {
            success: false,
            error: error instanceof Error 
              ? error.message 
              : 'Erreur d\'enrichissement inconnue',
            placeId: preview.enriched?.placeId
          }
        });
      }
    }

    // Statistiques d'enrichissement
    const stats = {
      total: previews.length,
      success: successCount,
      errors: previews.length - successCount
    };

    console.log('Enrichment completed with stats:', stats);

    return NextResponse.json({
      success: true,
      previews: enrichedPreviews,
      stats,
      message: `Enrichissement terminé : ${stats.success} succès, ${stats.errors} erreurs sur ${stats.total} lieux`
    });

  } catch (error) {
    console.error('Fatal error during enrichment:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'enrichissement',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}