// app/api/admin/places/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { Category, Status } from '@/types/common';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

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



async function handleGetPlaces(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] GET request by:', {
      user: session.user.email,
      role: session.user.role
    });

    await connectDB();
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.search);
    
    const search = searchParams.get('search') || undefined;
    const categories = searchParams.getAll('categories[]') as Category[] | undefined;
    const status = searchParams.get('status') as Status | undefined;
    const isGem = searchParams.get('isGem') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('Filtres reçus:', { categories, status, search });

    const filter: PlaceFilter = { isActive: true };

    if (search) {
      filter.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } },
        { 'description.fr': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (categories && categories.length > 0) {
      const validCategories = categories.filter(cat => cat && cat.trim().length > 0);
      if (validCategories.length > 0) {
        filter.category = { $in: validCategories };
        console.log('Filtre de catégories appliqué:', filter.category);
      }
    }

    if (status) {
      filter['metadata.status'] = status;
    }

    if (isGem) {
      filter.isGem = true;
    }

    console.log('Filtre final:', JSON.stringify(filter, null, 2));

    const placesData = await placeRepository.find({
      filter,
      page,
      limit,
      sort: { updatedAt: -1 }
    });

    const statsResults = await placeRepository.getStats();
    
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

async function handleCreatePlace(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des lieux" },
        { status: 403 }
      );
    }

    const body = await req.json();
    await connectDB();
    
    const place = await placeRepository.create(body);
    
    return NextResponse.json(place);
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création du lieu" },
      { status: 500 }
    );
  }
}
export const GET = protectApiRoute(handleGetPlaces, 'admin');
export const POST = protectApiRoute(handleCreatePlace, 'admin');
