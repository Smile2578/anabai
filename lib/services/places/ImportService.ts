// lib/services/places/ImportService.ts
import { parse } from 'csv-parse/sync';
import { GooglePlacesService } from '../core/GooglePlacesService';
import { GeocodingService } from '../core/GeocodingService';
import { ImportPreview } from '@/types/import';
import { validateGoogleMapsUrl } from '@/lib/utils/place-utils';

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
    private geocodingService: GeocodingService
  ) {}

  private validateCSVHeaders(headers: string[]): void {
    const requiredHeaders = ['Title', 'URL'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Colonnes manquantes dans le CSV: ${missingHeaders.join(', ')}`);
    }
  }

  private async processRecord(record: { Title: string; URL?: string; Note?: string; Comment?: string; }): Promise<ImportPreview> {
    const preview: ImportPreview = {
      original: {
        Title: record.Title || '',
        URL: record.URL || '',
        Note: record.Note || '',
        Comment: record.Comment || ''
      },
      status: 'pending',
      enriched: {
        success: false
      }
    };

    try {
      if (!record.Title?.trim()) {
        throw new Error('Titre manquant');
      }

      let placeId: string | null = null;

      // Si une URL est fournie, essayer d'abord d'extraire le placeId de l'URL
      if (record.URL) {
        const { isValid, placeId: extractedId } = await validateGoogleMapsUrl(record.URL);
        if (isValid && extractedId) {
          placeId = extractedId;
        }
      }

      // Si pas de placeId via URL, essayer via geocoding
      if (!placeId) {
        const geocodingResult = await this.geocodingService.geocode(record.Title);
        placeId = geocodingResult?.placeId || null;
      }

      // Si toujours pas de placeId, essayer la recherche directe
      if (!placeId) {
        const searchResult = await this.googlePlacesService.searchPlace(record.Title);
        placeId = searchResult?.id || null;
      }

      if (placeId) {
        preview.enriched = {
          success: true,
          placeId
        };
        preview.status = 'success';
      } else {
        preview.status = 'error';
        preview.enriched.error = 'Lieu introuvable';
      }

    } catch (error) {
      console.error(`Erreur lors du traitement de "${record.Title}":`, error);
      preview.status = 'error';
      preview.enriched.error = error instanceof Error ? error.message : 'Erreur inconnue';
    }

    return preview;
  }

  async processCSV(fileContent: string): Promise<ImportResult> {
    try {
      // Analyser le CSV avec les options de base
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true
      });

      // Valider les en-têtes
      const headers = Object.keys(records[0] || {});
      this.validateCSVHeaders(headers);

      console.log(`Traitement de ${records.length} enregistrements`);

      // Traiter les enregistrements en série pour éviter de surcharger l'API
      const previews: ImportPreview[] = [];
      for (const record of records) {
        const preview = await this.processRecord(record);
        previews.push(preview);
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Calculer les statistiques
      const stats = previews.reduce(
        (acc, preview) => ({
          total: acc.total + 1,
          success: acc.success + (preview.status === 'success' ? 1 : 0),
          failed: acc.failed + (preview.status === 'error' ? 1 : 0)
        }),
        { total: 0, success: 0, failed: 0 }
      );

      console.log('Résultats de l\'import:', stats);

      return {
        success: stats.failed === 0,
        previews,
        stats
      };

    } catch (error) {
      console.error('Erreur lors du traitement du CSV:', error);
      throw error;
    }
  }
}