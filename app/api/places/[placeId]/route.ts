import { NextRequest, NextResponse } from 'next/server';
import { PlaceService } from '@/lib/services/places/PlaceService';

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  const { id } = await params;
  
  try {
    const placeService = new PlaceService();
    const place = await placeService.getPlace(id);

    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);
  } catch (error) {
    console.error('Erreur lors de la récupération du lieu:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 