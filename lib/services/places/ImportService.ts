import { parse } from 'csv-parse/sync';
import { GooglePlacesService } from '../core/GooglePlacesService';
import { GeocodingService } from '../core/GeocodingService';
import { ImportPreview } from '@/types/import';
import { GOOGLE_MAPS_CONFIG } from '@/lib/config/google-maps';
import { GooglePlace } from '@/types/google/place';
import { Place } from '@/types/places/main';
import { Category, Subcategory } from '@/types/common';

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

  private determineCategory(types: string[]): Category {
    // Mapper les types Google vers nos catégories
    const typeMapping: Record<string, Category> = {
      'restaurant': 'Restaurant',
      'food': 'Restaurant',
      'cafe': 'Café & Bar',
      'bar': 'Café & Bar',
      'lodging': 'Hôtel',
      'hotel': 'Hôtel',
      'shopping_mall': 'Shopping',
      'store': 'Shopping',
      'point_of_interest': 'Visite',
      'tourist_attraction': 'Visite'
    };

    for (const type of types) {
      const category = typeMapping[type];
      if (category) {
        return category;
      }
    }

    return 'Visite'; // Catégorie par défaut
  }

  private determineSubcategories(types: string[], category: Category): Subcategory[] {
    // Exemple de mapping pour quelques sous-catégories
    const subcategories = new Set<Subcategory>();

    if (category === 'Restaurant') {
      if (types.includes('ramen_restaurant')) subcategories.add('Ramen');
      if (types.includes('sushi_restaurant')) subcategories.add('Sushi');
    } else if (category === 'Visite') {
      if (types.includes('temple')) subcategories.add('Temple');
      if (types.includes('museum')) subcategories.add('Musée');
    }

    return Array.from(subcategories);
  }

  private transformToPlace(googlePlace: GooglePlace, originalData: ImportPreview['original']): Place {
    const category = this.determineCategory(googlePlace.types);
    const subcategories = this.determineSubcategories(googlePlace.types, category);

    // Conversion du format originalData
    const transformedOriginalData = {
      title: originalData.Title,
      note: originalData.Note,
      url: originalData.URL,
      comment: originalData.Comment
    };

    // Création des URLs des photos sans utiliser getPhotoUrl
    const photos = googlePlace.photos?.map((photo, index) => ({
      url: photo.name,
      source: 'Google Places',
      isCover: index === 0,
      name: `${googlePlace.displayName.text}-${index + 1}`,
      caption: {
        fr: photo.name
      }
    })) || [];

    
    return {
      _id: googlePlace.id,
      originalData: transformedOriginalData,
      name: {
        fr: googlePlace.displayName.text,
        ja: googlePlace.displayName.text // On utilise la même valeur pour le moment
      },
      location: {
        point: {
          type: 'Point',
          coordinates: [
            googlePlace.location.longitude,
            googlePlace.location.latitude
          ]
        },
        address: {
          full: {
            fr: googlePlace.formattedAddress,
            ja: googlePlace.formattedAddress
          },
          formatted: {
            fr: googlePlace.formattedAddress,
            ja: googlePlace.formattedAddress
          },
          prefecture: 'À déterminer', // À extraire des adressComponents
          city: 'À déterminer'
        }
      },
      category,
      subcategories,
      description: {
        fr: googlePlace.editorialSummary?.text || googlePlace.displayName.text,
        ja: googlePlace.displayName.text
      },
      images: photos,
      metadata: {
        source: 'Google Places',
        placeId: googlePlace.id,
        status: 'brouillon',
        businessStatus: googlePlace.businessStatus,
        rating: googlePlace.rating,
        userRatingsTotal: googlePlace.userRatingCount
      },
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      isGem: false
    };
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
        throw new Error('Titre manquant');
      }

      // Rechercher directement le lieu par son nom
      const searchResult = await this.googlePlacesService.searchPlace(record.Title);
      
      if (!searchResult) {
        throw new Error('Lieu introuvable');
      }

      // Récupérer les détails pour vérifier la localisation
      const placeDetails = await this.googlePlacesService.getPlaceDetails(searchResult.id);
      
      if (!placeDetails) {
        throw new Error('Impossible de récupérer les détails du lieu');
      }

      // Vérifier si le lieu est au Japon
      const location = {
        lat: placeDetails.location.latitude,
        lng: placeDetails.location.longitude
      };

      const isInJapan = this.validateLocation(location.lat, location.lng);
      
      if (!isInJapan) {
        throw new Error('Le lieu n\'est pas au Japon');
      }

      // Transformer GooglePlace en notre type Place
      const place = this.transformToPlace(placeDetails, preview.original);

      // Si on arrive ici, le lieu est valide et au Japon
      preview.enriched = {
        success: true,
        placeId: searchResult.id,
        place
      };
      preview.status = 'success';

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