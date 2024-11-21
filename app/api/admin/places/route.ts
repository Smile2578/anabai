// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { Category, Status } from '@/types/common';

type SearchFilter = {
  'name.fr': { $regex: string; $options: string };
  'name.ja': { $regex: string; $options: string };
  'description.fr': { $regex: string; $options: string };
};

interface PlaceFilter {
  isActive: boolean;
  $or?: SearchFilter[];
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
        {
          'name.fr': { $regex: search, $options: 'i' },
          'name.ja': {
            $regex: '',
            $options: ''
          },
          'description.fr': {
            $regex: '',
            $options: ''
          }
        },
        {
          'name.ja': { $regex: search, $options: 'i' },
          'name.fr': {
            $regex: '',
            $options: ''
          },
          'description.fr': {
            $regex: '',
            $options: ''
          }
        },
        {
          'description.fr': { $regex: search, $options: 'i' },
          'name.fr': {
            $regex: '',
            $options: ''
          },
          'name.ja': {
            $regex: '',
            $options: ''
          }
        }
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

    return NextResponse.json({
      places: placesData.places,
      totalPages: placesData.totalPages,
      currentPage: page,
      stats: {
        total: statsResults.total,
        published: statsResults.published,
        draft: statsResults.draft,
        archived: statsResults.archived
      }
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