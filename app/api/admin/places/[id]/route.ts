// app/api/admin/places/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { ObjectId } from 'mongodb';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Récupération d'un lieu spécifique
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    const place = await placeRepository.collection.findOne({ _id: new ObjectId(id) });
    
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
      { error: 'Erreur lors de la récupération du lieu' },
      { status: 500 }
    );
  }
}

// PATCH - Mise à jour d'un lieu spécifique
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const updates = await req.json();
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    const updatedPlace = await placeRepository.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updates,
          metadata: {
            ...updates.metadata,
            lastEnriched: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedPlace) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPlace);

  } catch (error) {
    console.error('Erreur lors de la mise à jour du lieu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lieu' },
      { status: 500 }
    );
  }
}

// DELETE - Suppression d'un lieu
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
        throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    // Vérification si c'est une suppression douce (soft delete)
    const searchParams = new URL(req.url).searchParams;
    const isSoftDelete = searchParams.get('soft') === 'true';

    if (isSoftDelete) {
      const updatedPlace = await placeRepository.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { isActive: false } },
        { returnDocument: 'after' }
      );
      
      if (!updatedPlace) {
        return NextResponse.json(
          { error: 'Lieu non trouvé' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, place: updatedPlace });
    }

    const result = await placeRepository.collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erreur lors de la suppression du lieu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lieu' },
      { status: 500 }
    );
  }
}