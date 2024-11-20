// app/api/admin/places/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { ValidationService } from '@/lib/services/places/ValidationService';
import { LocationService } from '@/lib/services/core/LocationService';
import { StorageService } from '@/lib/services/places/StorageService';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    
    const place = await placeRepository.findById(id);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);

  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération du lieu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    const updates = await req.json();
    
    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);
    const storageService = new StorageService(placeRepository, validationService);

    const result = await storageService.updatePlace(id, updates);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'Lieu non trouvé' ? 404 : 400 }
      );
    }

    return NextResponse.json(result.place);

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du lieu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = params;
    
    // Vérifier si c'est une suppression douce
    const searchParams = new URL(req.url).searchParams;
    const isSoftDelete = searchParams.get('soft') !== 'false';

    const locationService = new LocationService();
    const validationService = new ValidationService(locationService);
    const storageService = new StorageService(placeRepository, validationService);

    const result = await storageService.deletePlace(id, isSoftDelete);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du lieu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}