// app/api/admin/places/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { PlaceRepository } from '@/lib/repositories/place-repository';
import { Category, Status } from '@/types/common';

interface Query {
  isActive: boolean;
  $or?: Array<Record<string, unknown>>;
  category?: { $in: Category[] };
  'metadata.status'?: { $in: Status[] };
  'pricing.level'?: { $in: number[] };
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = new URL(req.url).searchParams;
    
    // Récupérer les paramètres de requête
    const search = searchParams.get('search');
    const categories = searchParams.get('category')?.split(',') as Category[];
    const statuses = searchParams.get('status')?.split(',') as Status[];
    const priceRange = searchParams.get('priceRange')?.split(',').map(Number);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Connexion à la base de données
    const mongoose = await connectDB();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const placeRepository = new PlaceRepository(db);

    // Construire la requête
    const query: Query = { isActive: true };

    // Ajouter les filtres
    if (search) {
      query.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } },
        { 'location.address.prefecture': { $regex: search, $options: 'i' } },
        { 'location.address.city': { $regex: search, $options: 'i' } }
      ];
    }

    if (categories?.length) {
      query.category = { $in: categories };
    }

    if (statuses?.length) {
      query['metadata.status'] = { $in: statuses };
    }

    if (priceRange?.length) {
      query['pricing.level'] = { $in: priceRange };
    }

    // Récupérer les lieux
    const { places, total } = await placeRepository.findAll({
      search: search || undefined,
      category: categories?.length ? categories[0] : undefined,
      status: statuses?.length ? statuses[0] : undefined,
      page,
      limit
    });

    // Calculer les statistiques
    const stats = {
      total: places.length,
      published: places.filter(p => p.metadata.status === 'publié').length,
      draft: places.filter(p => p.metadata.status === 'brouillon').length,
      archived: places.filter(p => p.metadata.status === 'archivé').length,
      withImages: places.filter(p => p.images?.length > 0).length,
      withoutImages: places.filter(p => !p.images?.length).length,
      totalRatings: places.reduce((acc, p) => acc + (p.metadata.userRatingsTotal || 0), 0),
      averageRating: places.reduce((acc, p) => {
        return acc + ((p.metadata.rating || 0) / places.length);
      }, 0),
      byCategory: places.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPrefecture: places.reduce((acc, p) => {
        if (p.location.address.prefecture) {
          acc[p.location.address.prefecture] = (acc[p.location.address.prefecture] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    };

    return NextResponse.json({
      places,
      stats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
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
