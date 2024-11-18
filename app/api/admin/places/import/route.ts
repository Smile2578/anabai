// app/api/admin/places/import/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { validateGoogleMapsUrl } from '@/lib/utils/place-utils';
import { ImportPreview, CSVPlace } from '@/types/place';
import { ValidationService } from '@/lib/services/validation';

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

    const validationService = new ValidationService();
    const csvContent = await file.text();
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true // Pour gérer les BOM UTF-8
    }) as CSVPlace[];

    console.log(`Processing ${records.length} records from CSV`);

    const previews: ImportPreview[] = [];

    for (const record of records) {
      try {
        console.log('Original URL:', record.URL);

        // Validation basique des données CSV
        if (!record.URL || !record.Title) {
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'URL ou titre manquant'
            },
            validationErrors: [],
            existingPlace: null
          });
          continue;
        }

        // Validation et extraction de l'URL
        const { isValid, placeId } = await validateGoogleMapsUrl(record.URL);
        if (!isValid || !placeId) {
          previews.push({
            original: record,
            status: 'error',
            enriched: {
              success: false,
              error: 'URL Google Maps invalide'
            },
            validationErrors: [], // Ajout du champ manquant
            existingPlace: null,
          });
          continue;
        }

        console.log('Extracted Place ID:', placeId);
        // Création de l'aperçu initial
        const preview: ImportPreview = {
          original: record,
          status: 'pending',
          enriched: {
            success: true,
            placeId
          },
          validationErrors: [],
          existingPlace: null,
        };

        // Validation initiale
        const validationErrors = validationService.validateImportPreview(preview);
        if (validationErrors.length > 0) {
          preview.status = 'error';
          preview.validationErrors = validationErrors;
        }

        previews.push(preview);

      } catch (error) {
        console.error(`Error processing record:`, { 
          title: record.Title, 
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        });
        previews.push({
          original: record,
          status: 'error',
          enriched: {
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          },
          validationErrors: [],
          existingPlace: null // Ajout du champ manquant existingPlace
        });
      }
    }

    // Statistiques d'import
    const stats = {
      total: records.length,
      valid: previews.filter(p => p.status === 'pending').length,
      invalid: previews.filter(p => p.status === 'error').length
    };

    return NextResponse.json({
      success: true,
      previews,
      stats,
      message: `Import initial : ${stats.valid} valides, ${stats.invalid} invalides sur ${stats.total} entrées`
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