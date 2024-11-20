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
    const categories = searchParams.get('category')?.split(',') as Category[] | undefined;
    const status = searchParams.get('status') as Status | undefined;
    const isGem = searchParams.get('isGem') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sort = searchParams.get('sort') 
      ? JSON.parse(searchParams.get('sort') || '{}')
      : { updatedAt: -1 };

    // Récupérer les lieux avec les nouvelles options
    const result = await placeRepository.find({
      search,
      category: categories?.[0],
      status,
      isGem,
      page,
      limit,
      sort
    });

    // Retourner les résultats
    return NextResponse.json(result);

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