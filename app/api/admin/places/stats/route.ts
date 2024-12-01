import { NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';
import { placeRepository } from '@/lib/repositories/place-repository';
import connectDB from '@/lib/db/connection';

async function handleGetStats(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] Stats request by:', {
      user: session.user.email,
      role: session.user.role
    });

    await connectDB();

    const [total, published, draft, archived] = await Promise.all([
      placeRepository.count({}),
      placeRepository.count({ 'metadata.status': 'publié' }),
      placeRepository.count({ 'metadata.status': 'brouillon' }),
      placeRepository.count({ 'metadata.status': 'archivé' })
    ]);

    return NextResponse.json({
      total,
      published,
      draft,
      archived
    });

  } catch (error) {
    console.error('Error fetching place stats:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des statistiques',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const GET = protectApiRoute(handleGetStats, 'admin');