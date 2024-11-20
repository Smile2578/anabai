// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { Category, Status } from '@/types/common';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = new URL(req.url).searchParams;
    
    // Récupérer les paramètres de requête
    const search = searchParams.get('search') || undefined;
    const category = searchParams.getAll('categories') as Category[] | undefined;
    const status = searchParams.get('status') as Status | undefined;
    const isGem = searchParams.get('isGem') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') 
      ? JSON.parse(searchParams.get('sort') || '{}')
      : { updatedAt: -1 };
    // Construire le filtre
    const filter: {
      isActive: boolean;
      $or?: { [key: string]: { $regex: string, $options: string } }[];
      category?: { $in: Category[] };
      'metadata.status'?: Status;
      isGem?: boolean;
    } = {
      isActive: true // Toujours inclure les lieux actifs par défaut
    };
    
    if (search) {
      filter.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } },
        { 'description.fr': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category?.length) {
      filter.category = { $in: category };
    }
    
    if (status) {
      filter['metadata.status'] = status;
    }
    
    if (isGem) {
      filter.isGem = true;
    }

    // Récupérer les lieux avec le filtre
    const result = await placeRepository.find({
      filter,
      page,
      limit,
      sort
    });

    // Calculer des statistiques étendues
    const stats = await placeRepository.getStats();

    // Retourner les résultats enrichis
    return NextResponse.json({
      places: result.places,
      totalPages: result.totalPages,
      currentPage: page,
      totalPlaces: result.total,
      stats
    });

  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des lieux',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}