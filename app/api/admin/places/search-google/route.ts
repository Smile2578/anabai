// app/api/admin/places/search-google/route.ts
import { NextResponse } from 'next/server';
import { GooglePlacesService } from '@/lib/services/core/GooglePlacesService';
import { Language } from '@/lib/config/google-maps';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

async function handleSearchGooglePlaces(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] GET request by:', {
      user: session.user.email,
      role: session.user.role
    });
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const language = (searchParams.get('language') || 'fr') as Language;

    if (!query) {
      return NextResponse.json(
        { error: 'Le paramètre query est requis' },
        { status: 400 }
      );
    }

    const googlePlacesService = new GooglePlacesService();
    const results = await googlePlacesService.searchPlacesInteractive(query, language);

    return NextResponse.json({ places: results });

  } catch (error) {
    console.error('Erreur de recherche Google Places:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    );
  }
}

export const GET = protectApiRoute(handleSearchGooglePlaces, 'admin');