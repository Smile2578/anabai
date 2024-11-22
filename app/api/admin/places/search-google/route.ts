// app/api/admin/places/search-google/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { Language } from '@/lib/config/google-maps';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const language = (searchParams.get('language') || 'fr') as Language;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const googlePlacesService = new GooglePlacesService();
    const results = await googlePlacesService.searchPlacesInteractive(query, language);

    return NextResponse.json({ places: results });

  } catch (error) {
    console.error('Google Places search error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}