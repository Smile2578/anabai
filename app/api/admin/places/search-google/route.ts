// app/api/admin/places/search-google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const googlePlacesService = new GooglePlacesService();
    const results = await googlePlacesService.searchPlaces(query);

    return NextResponse.json({
      places: results.places
    });

  } catch (error) {
    console.error('Google Places search error:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la recherche',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}