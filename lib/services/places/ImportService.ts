import { parse } from 'csv-parse/sync';
import { GooglePlacesService } from '../core/GooglePlacesService';
import { GeocodingService } from '../core/GeocodingService';
import { ImportPreview } from '@/types/import';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';

interface ImportResult {
  success: boolean;
  previews: ImportPreview[];
  stats: {
    total: number;
    success: number;
    failed: number;
    japanOnly: number;
    notFound: number;
  };
}

export class ImportService {
  constructor(
    private googlePlacesService: GooglePlacesService,
    private geocodingService: GeocodingService
  ) {}

  private validateLocation(lat: number, lng: number): boolean {
    const bounds = GOOGLE_MAPS_CONFIG.geocoding.bounds;
    return (
      lat >= bounds.south &&
      lat <= bounds.north &&
      lng >= bounds.west &&
      lng <= bounds.east
    );
  }

  private validateCSVHeaders(headers: string[]): void {
    const requiredHeaders = ['Title', 'URL'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Colonnes manquantes dans le CSV: ${missingHeaders.join(', ')}`);
    }
  }

  private async processRecord(record: { 
    Title: string; 
    URL?: string; 
    Note?: string; 
    Comment?: string; 
  }): Promise<ImportPreview> {
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
        preview.status = 'error';
        preview.enriched.error = 'Titre manquant';
        preview.enriched.details = {
          reason: 'MISSING_TITLE',
          message: 'Le titre est requis pour la recherche'
        };
        return preview;
      }

      // Rechercher directement le lieu par son nom
      const searchResult = await this.googlePlacesService.searchPlace(record.Title);
      
      if (!searchResult) {
        preview.status = 'error';
        preview.enriched.error = 'Lieu introuvable';
        preview.enriched.details = {
          reason: 'NOT_FOUND',
          message: `Impossible de trouver "${record.Title}" sur Google Places`,
          searchQuery: record.Title,
          possibleReasons: [
            'Le nom est peut-être mal orthographié',
            'Le lieu n\'existe plus ou a changé de nom',
            'L\'adresse complète pourrait aider à la recherche'
          ]
        };
        return preview;
      }

      // Récupérer les détails pour vérifier la localisation
      const placeDetails = await this.googlePlacesService.getPlaceDetails(searchResult.id);
      
      if (!placeDetails) {
        preview.status = 'error';
        preview.enriched.error = 'Impossible de récupérer les détails du lieu';
        preview.enriched.details = {
          reason: 'DETAILS_NOT_FOUND',
          message: 'Le lieu existe mais ses détails sont inaccessibles',
          placeId: searchResult.id
        };
        return preview;
      }

      // Vérifier si le lieu est au Japon
      const location = {
        lat: placeDetails.location.latitude,
        lng: placeDetails.location.longitude
      };

      const isInJapan = this.validateLocation(location.lat, location.lng);
      
      if (!isInJapan) {
        preview.status = 'error';
        preview.enriched.error = 'Le lieu n\'est pas au Japon';
        preview.enriched.details = {
          reason: 'OUTSIDE_JAPAN',
          message: 'Les coordonnées du lieu sont en dehors du Japon',
          location: {
            latitude: location.lat,
            longitude: location.lng
          },
          address: placeDetails.formattedAddress
        };
        return preview;
      }

      // Si on arrive ici, le lieu est valide et au Japon
      preview.enriched = {
        success: true,
        placeId: searchResult.id,
        details: {
          foundName: placeDetails.displayName.text,
          address: placeDetails.formattedAddress,
          types: placeDetails.types
        }
      };
      preview.status = 'success';

    } catch (error) {
      console.error(`Erreur lors du traitement de "${record.Title}":`, error);
      preview.status = 'error';
      preview.enriched.error = error instanceof Error ? error.message : 'Erreur inconnue';
      preview.enriched.details = {
        reason: 'PROCESSING_ERROR',
        message: 'Une erreur est survenue lors du traitement',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
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
      const stats = {
        total: records.length,
        success: 0,
        failed: 0,
        japanOnly: 0,
        notFound: 0
      };

      for (const record of records) {
        const preview = await this.processRecord(record);
        previews.push(preview);
        
        if (preview.status === 'success') {
          stats.success++;
        } else {
          stats.failed++;
          if (preview.enriched?.error?.includes('Japon')) {
            stats.japanOnly++;
          }
          if (preview.enriched?.error?.includes('introuvable')) {
            stats.notFound++;
          }
        }
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 200));
      }

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