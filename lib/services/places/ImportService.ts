import { parse } from 'csv-parse/sync';
import { GooglePlacesService } from '../core/GooglePlacesService';
import { ImportPreview } from '@/types/import';
import { Place } from '@/types/places/main';
import { Category } from '@/types/common';

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
    private googlePlacesService: GooglePlacesService
  ) {}

  private validateCSVHeaders(headers: string[]): void {
    const requiredHeaders = ['Title'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Colonnes manquantes dans le CSV: ${missingHeaders.join(', ')}`);
    }
  }

  private determineCategory(types: string[]): Category {
    const typeMapping: Record<string, Category> = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'cafe': 'Café & Bar',
      'bar': 'Café & Bar',
      'lodging': 'Hôtel',
      'store': 'Shopping',
      'shopping_mall': 'Shopping'
    };

    for (const type of types) {
      if (type in typeMapping) {
        return typeMapping[type];
      }
    }

    return 'Visite';
  }

  private async processRecord(record: { Title: string; Note?: string; URL?: string; Comment?: string; }): Promise<ImportPreview> {
    const preview: ImportPreview = {
      original: {
        Title: record.Title || '',
        Note: record.Note || '',
        URL: record.URL || '',
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

      // Recherche directe par titre
      console.log(`Recherche du lieu: "${record.Title}"`);
      const placeInfo = await this.googlePlacesService.searchPlaceByTitle(record.Title);

      if (placeInfo) {
        console.log(`Lieu trouvé: ${placeInfo.name} (ID: ${placeInfo.id})`);
        
        // Récupérer les détails complets
        const googlePlace = await this.googlePlacesService.getPlaceDetails(placeInfo.id);
        
        // Convertir GooglePlace en Place
        const place: Place = {
          name: {
            fr: googlePlace.displayName?.text || '',
            ja: googlePlace.displayName?.text || ''
          },
          location: {
            point: {
              type: 'Point',
              coordinates: {
                lng: googlePlace.location.longitude,
                lat: googlePlace.location.latitude
              },
            },
            
            address: {
              full: {
                fr: googlePlace.formattedAddress,
                ja: googlePlace.formattedAddress
              },
              prefecture: googlePlace.addressComponents.find(
                c => c.types.includes('administrative_area_level_1')
              )?.longText,
              city: googlePlace.addressComponents.find(
                c => c.types.includes('locality')
              )?.longText
            }
          },
          category: this.determineCategory(googlePlace.types),
          subcategories: googlePlace.types || [],
          description: googlePlace.editorialSummary ? {
            fr: googlePlace.editorialSummary.text
          } : undefined,
          images: googlePlace.photos ? [{
            url: `${this.googlePlacesService.baseUrl}/${googlePlace.photos[0].name}/media`,
            source: 'Google Places',
            isCover: true,
            caption: googlePlace.photos[0].authorAttributions?.[0] ? {
              fr: googlePlace.photos[0].authorAttributions[0].displayName
            } : undefined
          }] : [],
        
          // Ajouter les horaires
          openingHours: googlePlace.currentOpeningHours || googlePlace.regularOpeningHours ? {
            weekdayTexts: {
              fr: (googlePlace.currentOpeningHours || googlePlace.regularOpeningHours)!.weekdayDescriptions.join('\n'),
              ja: (googlePlace.currentOpeningHours || googlePlace.regularOpeningHours)!.weekdayDescriptions.join('\n')
            },
            periods: (googlePlace.currentOpeningHours || googlePlace.regularOpeningHours)!.periods.map(period => ({
              day: period.open.day,
              open: `${period.open.hour}:${period.open.minute.toString().padStart(2, '0')}`,
              close: period.close ? 
                `${period.close.hour}:${period.close.minute.toString().padStart(2, '0')}` :
                '23:59'
            }))
          } : undefined,
        
          // Ajouter le prix
          pricing: googlePlace.priceLevel ? {
            level: parseInt(googlePlace.priceLevel) as 1 | 2 | 3 | 4,
            currency: 'JPY'
          } : undefined,
        
          // Ajouter les contacts
          contact: {
            phone: googlePlace.internationalPhoneNumber,
            website: googlePlace.websiteUri,
            googleMapsUrl: googlePlace.googleMapsUri
          },
          metadata: {
            source: 'Google Places',
            placeId: placeInfo.id,
            status: 'brouillon',
            lastEnriched: new Date(),
            rating: googlePlace.rating,
            ratingCount: googlePlace.userRatingCount,
            businessStatus: googlePlace.businessStatus
          },
          originalData: {
            title: record.Title,
            note: record.Note,
            url: record.URL,
            comment: record.Comment
          },
          isActive: true,
          updatedAt: new Date(),
          createdAt: new Date(),
          _id: placeInfo.id
        };

        // Mettre à jour le preview
        preview.enriched = {
          success: true,
          placeId: placeInfo.id,
          place
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