// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';

// GET - Liste des lieux avec filtres et pagination
export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    // S'assurer que la connexion est établie avant de créer le repository
    await mongoose.connection.asPromise();
    
    const placeRepository = new PlaceRepository(db);

    // Vérifier que la collection est définie avant d'appeler findAll
    if (!placeRepository.collection) {
      throw new Error('Collection not initialized');
    }

    const { places, total } = await placeRepository.findAll({
      search,
      category,
      status,
      page,
      limit
    });

    return NextResponse.json({
      places,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des lieux:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lieux' },
      { status: 500 }
    );
  }
}

// POST - Création d'un nouveau lieu
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    // S'assurer que la connexion est établie avant de créer le repository
    await mongoose.connection.asPromise();
    
    const placeRepository = new PlaceRepository(db);

    // Vérification si le lieu existe déjà 
    if (data.metadata?.placeId) {
      const existing = await placeRepository.findByPlaceId(data.metadata.placeId);
      if (existing) {
        return NextResponse.json(
          { error: 'Ce lieu existe déjà' },
          { status: 400 }
        );
      }
    }

    const place = await placeRepository.create({
      ...data,
      isActive: true,
      metadata: {
        ...data.metadata,
        lastEnriched: new Date(),
        status: data.metadata?.status || 'brouillon'
      }
    });

    return NextResponse.json(place, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du lieu:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du lieu' },
      { status: 500 }
    );
  }
}

// PUT - Mise à jour en masse
export async function PUT(req: NextRequest) {
  try {
    const { places } = await req.json();
    
    if (!Array.isArray(places)) {
      return NextResponse.json(
        { error: 'Format de données invalide' },
        { status: 400 }
      );
    }

    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }

    // S'assurer que la connexion est établie avant de créer le repository
    await mongoose.connection.asPromise();
    
    const placeRepository = new PlaceRepository(db);

    const results = await placeRepository.bulkUpdate(places);

    return NextResponse.json(results);

  } catch (error) {
    console.error('Erreur lors de la mise à jour en masse:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour en masse' },
      { status: 500 }
    );
  }
}