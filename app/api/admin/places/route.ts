// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { Category, Status } from '@/types/common';

type SearchFilter = {
  $regex: string;
  $options: string;
};

interface PlaceFilter {
  isActive: boolean;
  $or?: Array<{
    'name.fr'?: SearchFilter;
    'name.ja'?: SearchFilter;
    'description.fr'?: SearchFilter;
  }>;
  category?: { $in: Category[] };
  'metadata.status'?: Status;
  isGem?: boolean;
}


export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const searchParams = new URL(req.url).searchParams;
    
    // Extraire les paramètres de requête
    const search = searchParams.get('search') || undefined;
    const categories = searchParams.getAll('categories') as Category[] | undefined;
    const status = searchParams.get('status') as Status | undefined;
    const isGem = searchParams.get('isGem') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Construire le filtre
    const filter: PlaceFilter = {
      isActive: true
    };

    if (search) {
      filter.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } },
        { 'description.fr': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (categories?.length) {
      filter.category = { $in: categories };
    }

    if (status) {
      filter['metadata.status'] = status;
    }

    if (isGem) {
      filter.isGem = true;
    }

    // Récupérer les lieux avec le filtre
    const placesData = await placeRepository.find({
      filter,
      page,
      limit,
      sort: { updatedAt: -1 }
    });

    // Calculer les stats pour les lieux actuels
    const statsResults = await placeRepository.getStats();
    const totalPages = Math.ceil(placesData.total / limit);
    
    return NextResponse.json({
      places: placesData.places,
      totalPages: placesData.totalPages,
      currentPage: placesData.page,
      stats: statsResults
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