// app/api/admin/places/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';


interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);
    const place = await placeRepository.collection.findOne({ 
      id: id, // Changement de _id à id
      isActive: true
    });
    
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
    const { id } = params;
    const updates = await req.json();
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);
    const result = await placeRepository.collection.findOneAndUpdate(
      { id: id }, // Changement de _id à id
      { $set: {
        ...updates,
        updatedAt: new Date()
      }},
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);

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
    const { id } = params;
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    // Vérifier si c'est une suppression douce
    const searchParams = new URL(req.url).searchParams;
    const isSoftDelete = searchParams.get('soft') === 'true';

    if (isSoftDelete) {
      const result = await placeRepository.collection.findOneAndUpdate(
        { id: id }, // Changement de _id à id pour correspondre au type attendu
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          }
          },
        { returnDocument: 'after' }
      );

      if (!result) {
        return NextResponse.json(
          { error: 'Lieu non trouvé' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, place: result });
    }

    // Suppression complète
    const result = await placeRepository.collection.deleteOne({ 
        _id: id, // Correction de la syntaxe et utilisation de _id
    });

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
      { 
        error: 'Erreur lors de la suppression du lieu',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}