// lib/services/places/ImportService.ts
import { parse } from 'csv-parse/sync';
import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImageService } from '../core/ImageService';
import { validateGoogleMapsUrl } from '@/lib/utils/place-utils';
import { ImportPreview } from '@/types/import';

interface ImportResult {
  success: boolean;
  previews: ImportPreview[];
  stats: {
    total: number;
    success: number;
    failed: number;
  };
}

export class ImportService {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private imageService: ImageService
  ) {}

  async processCSV(fileContent: string): Promise<ImportResult> {
    try {
      // Parser le CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      console.log(`Processing ${records.length} records from CSV`);

      const previews: ImportPreview[] = [];
      let successCount = 0;
      let failedCount = 0;

      // Traiter chaque ligne
      for (const record of records) {
        try {
          if (!record.URL || !record.Title) {
            throw new Error('URL ou titre manquant');
          }

          // Valider et extraire l'URL
          const { isValid, placeId } = await validateGoogleMapsUrl(record.URL);
          if (!isValid || !placeId) {
            throw new Error('URL Google Maps invalide');
          }

          // Créer l'aperçu initial
          const preview: ImportPreview = {
            original: {
              Title: record.Title,
              Note: record.Note,
              URL: record.URL,
              Comment: record.Comment
            },
            status: 'pending',
            enriched: {
              success: false,
              placeId
            }
          };

          previews.push(preview);
          successCount++;

        } catch (error) {
          console.error('Error processing record:', error);
          failedCount++;
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

      return {
        success: failedCount === 0,
        previews,
        stats: {
          total: records.length,
          success: successCount,
          failed: failedCount
        }
      };

    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  }
}