// app/api/admin/places/enrich/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EnrichmentService } from '@/lib/services/places/EnrichmentService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { ImageService } from '@/lib/services/core/ImageService';

export async function POST(req: NextRequest) {
  try {
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Initialiser les services
    const googlePlacesService = new GooglePlacesService();
    const imageService = new ImageService();
    const enrichmentService = new EnrichmentService(googlePlacesService, imageService);

    // Enrichir les données
    const enrichmentResult = await enrichmentService.enrichBatch(previews);

    // Analyser les résultats
    const analysisResults = {
      fieldCoverage: {} as Record<string, number>,
      commonMissingFields: [] as string[],
      missingFieldsFrequency: {} as Record<string, number>
    };

    // Analyser les logs pour obtenir des statistiques détaillées
    enrichmentResult.stats.logs.forEach((log: { fieldsExtracted: Record<string, boolean>; missingFields: string[] }) => {
      // Calculer la couverture des champs
      Object.entries(log.fieldsExtracted).forEach(([field, extracted]: [string, boolean]) => {
        if (!analysisResults.fieldCoverage[field]) {
          analysisResults.fieldCoverage[field] = 0;
        }
        if (extracted) {
          analysisResults.fieldCoverage[field]++;
        }
      });

      // Compter la fréquence des champs manquants
      log.missingFields.forEach((field: string) => {
        if (!analysisResults.missingFieldsFrequency[field]) {
          analysisResults.missingFieldsFrequency[field] = 0;
        }
        analysisResults.missingFieldsFrequency[field]++;
      });
    });

    // Convertir en pourcentages
    Object.entries(analysisResults.fieldCoverage).forEach(([field, count]) => {
      analysisResults.fieldCoverage[field] = (count / enrichmentResult.stats.total) * 100;
    });

    // Identifier les champs manquants les plus communs
    analysisResults.commonMissingFields = Object.entries(analysisResults.missingFieldsFrequency)
      .sort(([, a], [, b]) => b - a)
      .map(([field]) => field);

    console.log('Analyse de l\'enrichissement:', {
      total: enrichmentResult.stats.total,
      success: enrichmentResult.stats.success,
      failed: enrichmentResult.stats.failed,
      fieldCoverage: analysisResults.fieldCoverage,
      commonMissingFields: analysisResults.commonMissingFields,
      missingFieldsFrequency: analysisResults.missingFieldsFrequency
    });

    return NextResponse.json({
      success: true,
      previews: enrichmentResult.results,
      stats: {
        ...enrichmentResult.stats,
        analysis: analysisResults
      },
      message: `Enrichissement terminé : ${enrichmentResult.stats.success} succès, ${enrichmentResult.stats.failed} erreurs sur ${enrichmentResult.stats.total} lieux`
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}