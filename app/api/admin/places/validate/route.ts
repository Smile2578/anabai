// app/api/admin/places/validate/route.ts
import { NextResponse } from 'next/server';
import { ValidationService } from '@/lib/services/places/ValidationService';
import { LocationService } from '@/lib/services/core/LocationService';
import connectDB from '@/lib/db/connection';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

async function handleValidatePlaces(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
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

export const POST = protectApiRoute(handleValidatePlaces, 'admin');