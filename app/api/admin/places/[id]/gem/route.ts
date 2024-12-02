import { NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser, RouteParams } from '@/lib/auth/protect-api';
import { placeRepository } from '@/lib/repositories/place-repository';
import connectDB from '@/lib/db/connection';

async function handleToggleGem(
  req: Request,
  session: SessionWithUser,
  routeParams: RouteParams
) {
  try {
    console.log('👤 [API/Places] Gem toggle request by:', {
      user: session.user.email,
      role: session.user.role
    });

    await connectDB();
    
    const params = await routeParams.params;
    console.log('🔑 [API/Places] Paramètres de route:', params);
    const placeId = params.id;

    // Vérification de l'existence du lieu
    const place = await placeRepository.findById(placeId);
    if (!place) {
      console.error('❌ [API/Places] Lieu non trouvé:', placeId);
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    console.log('📍 [API/Places] Lieu trouvé:', {
      id: place._id,
      isGem: place.isGem
    });

    // Mise à jour du lieu
    const updatedPlace = await placeRepository.update(placeId, {
      isGem: !place.isGem,
      metadata: {
        ...place.metadata,
        lastModifiedAt: new Date(),
        lastModifiedBy: session.user.email
      }
    });

    console.log('✨ [API/Places] Successfully toggled gem status:', {
      placeId,
      oldGemStatus: place.isGem,
      newGemStatus: !place.isGem
    });

    return NextResponse.json({
      success: true,
      data: updatedPlace
    });

  } catch (error) {
    console.error('❌ [API/Places] Error toggling gem status:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du statut gem',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const PATCH = protectApiRoute(handleToggleGem, 'admin'); 