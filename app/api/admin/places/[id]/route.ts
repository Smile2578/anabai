// app/api/admin/places/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    
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
      { error: 'Erreur lors de la récupération du lieu' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const updates = await req.json();
    
    const place = await placeRepository.update(id, updates);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lieu' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    
    const success = await placeRepository.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lieu' },
      { status: 500 }
    );
  }
}