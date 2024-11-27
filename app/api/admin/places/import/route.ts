// app/api/admin/places/import/route.ts
import { NextResponse } from 'next/server';
import { ImportService } from '@/lib/services/places/ImportService';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { GeocodingService } from '@/lib/services/core/GeocodingService';
import connectDB from '@/lib/db/connection';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function handleImportPlaces(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    const formData = await req.formData();
    const file = formData.get('file');

    // Validation du fichier
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Veuillez fournir un fichier CSV' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Le fichier doit être au format CSV' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Le fichier ne doit pas dépasser ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Lecture du fichier
    const fileContent = await file.text();
    if (!fileContent.trim()) {
      return NextResponse.json(
        { error: 'Le fichier est vide' },
        { status: 400 }
      );
    }

    // Services
    const googlePlacesService = new GooglePlacesService();
    const geocodingService = new GeocodingService();
    const importService = new ImportService(googlePlacesService, geocodingService);

    // Traitement du CSV
    const result = await importService.processCSV(fileContent);

    return NextResponse.json({
      success: result.success,
      previews: result.previews,
      stats: result.stats
    });

  } catch (error) {
    console.error('Error importing places:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'import',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const POST = protectApiRoute(handleImportPlaces, 'admin');