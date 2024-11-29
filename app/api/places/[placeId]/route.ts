import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Place from '@/models/place.model';

type RouteContext = {
  params: Promise<{
    placeId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const resolvedParams = await params;
    await connectDB();

    const place = await Place.findById(resolvedParams.placeId);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Error in GET /api/places/[placeId]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 