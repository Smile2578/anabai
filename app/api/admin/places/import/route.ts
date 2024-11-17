// app/api/admin/places/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { GoogleMapsService } from '@/lib/services/googleMaps';
import { extractPlaceIdFromUrl, validatePlaceId } from '@/lib/utils/place-utils';
import { validatePlaceResult } from '@/lib/utils/validation';
import { ImportPreview, CSVPlace } from '@/types/place';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Lecture et parsing du CSV
    const csvContent = await file.text();
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVPlace[];

    console.log(`Processing ${records.length} records from CSV`);

    const googleMapsService = new GoogleMapsService();
    const previews: ImportPreview[] = [];
    let processedCount = 0;

    // Traitement de chaque entrée
    for (const record of records) {
      try {
        processedCount++;
        console.log(`Processing record ${processedCount}/${records.length}: ${record.Title}`);

        console.log('Original URL:', record.URL);
        const placeId = extractPlaceIdFromUrl(record.URL);
        console.log('Extracted Place ID:', placeId);

        if (!placeId) {
          console.warn('Failed to extract Place ID from URL:', record.URL);
          console.warn(`No Place ID found for: ${record.Title}`);
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'ID de lieu non trouvé dans l\'URL'
            }
          });
          continue;
        }

        // Validation de l'ID de lieu
        if (!validatePlaceId(placeId)) {
          console.warn(`Invalid Place ID format: ${placeId}`);
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'Format d\'ID de lieu invalide'
            }
          });
          continue;
        }

        console.log(`Fetching details for Place ID: ${placeId}`);

        // Enrichissement avec l'API Google Places
        const enrichedPlace = await googleMapsService.getPlaceDetails(placeId, record.Title);

        function isLocationInJapan(coordinates: number[]): boolean {
            const [lng, lat] = coordinates;
            return (
              lat >= 24.0 && // Sud d'Okinawa
              lat <= 45.7 && // Nord d'Hokkaido
              lng >= 122.0 && // Ouest des îles Yonaguni
              lng <= 154.0 // Est des îles Ogasawara
            );
          }
          
        // Vérification supplémentaire des coordonnées
            if (!enrichedPlace || !isLocationInJapan(enrichedPlace.location.coordinates)) {
                console.warn(`Location not in Japan for: ${record.Title}`);
                previews.push({
                original: record,
                status: 'error',
                enriched: {
                    success: false,
                    error: 'Location not in Japan'
                }
                });
                continue;
            }
        
        if (enrichedPlace === null || enrichedPlace === undefined) {
          console.warn(`No enriched data returned for: ${placeId}`);
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'Impossible d\'obtenir les détails du lieu'
            }
          });
          continue;
        }

        // Validation des données enrichies
        if (!validatePlaceResult(enrichedPlace)) {
          console.warn(`Invalid enriched data for: ${placeId}`);
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'Données enrichies invalides ou incomplètes'
            }
          });
          continue;
        }

        // Ajout des données originales
        const completePlace = {
          ...(enrichedPlace as object),
          originalData: {
            title: record.Title,
            note: record.Note,
            url: record.URL,
            comment: record.Comment
          }
        };

        // Création de l'aperçu réussi
        previews.push({
          original: record,
          status: 'success',
          enriched: {
            success: true,
            place: {
              ...(enrichedPlace as {
                location: {
                  coordinates: number[]
                }
              }),
              location: {
                ...(enrichedPlace as {location: any}).location,
                coordinates: [(enrichedPlace as any).location?.coordinates?.[0] || 0, (enrichedPlace as any).location?.coordinates?.[1] || 0]
              },
              metadata: {
                lastEnriched: new Date().toISOString(),
                status: "brouillon", // Force status to be one of the valid enum values
                source: ''
              }
            },
            placeId
          }
        });

        console.log(`Successfully processed: ${record.Title}`);

      } catch (error) {
        console.error(`Error processing record: ${record.Title}`, error);
        previews.push({
          original: record,
          status: 'error',
          enriched: {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          }
        });
      }
    }

    // Calcul des statistiques
    const stats = {
      total: records.length,
      success: previews.filter(p => p.status === 'success').length,
      errors: previews.filter(p => p.status === 'error').length
    };

    console.log('Import complete. Stats:', stats);

    // Retour de la réponse
    return NextResponse.json({
      success: true,
      previews,
      stats,
      message: `Traitement terminé : ${stats.success} succès, ${stats.errors} erreurs sur ${stats.total} entrées`
    });

  } catch (error) {
    console.error('Fatal error during import:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du traitement du fichier',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}