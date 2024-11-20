// app/api/admin/places/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ValidationService } from '@/lib/services/places/ValidationService';
import { LocationService } from '@/lib/services/core/LocationService';
import connectDB  from '@/lib/db/connection';
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { previews } = await req.json();
    
    if (!Array.isArray(previews)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    // Services
    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);

    // Validation
    const result = await validationService.validateBatch(previews);

    return NextResponse.json({
      success: true,
      results: result.results,
      stats: result.stats
    });

  } catch (error) {
    console.error('Error validating places:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la validation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}