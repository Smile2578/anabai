import { NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser, RouteParams } from '@/lib/auth/protect-api';
import { placeRepository } from '@/lib/repositories/place-repository';
import connectDB from '@/lib/db/connection';
import { Status } from '@/types/common';

async function handleUpdateStatus(
  req: Request,
  session: SessionWithUser,
  routeParams: RouteParams
) {
  try {
    console.log('👤 [API/Places] Status update request by:', {
      user: session.user.email,
      role: session.user.role
    });

    await connectDB();
    
    // Validation du body de la requête
    const body = await req.json();
    const status = body.status as Status;
    console.log('📦 [API/Places] Body reçu:', body);

    const params = await routeParams.params;
    console.log('🔑 [API/Places] Paramètres de route:', params);
    const placeId = params.id; // Utiliser id au lieu de placeId

    console.log('🎯 [API/Places] Paramètres extraits:', {
      status,
      placeId
    });

    // Vérification des paramètres requis
    if (!status || !placeId) {
      console.error('❌ [API/Places] Paramètres manquants:', { status, placeId });
      return NextResponse.json(
        { error: 'Status et ID du lieu sont requis' },
        { status: 400 }
      );
    }

    // Vérification que le status est valide
    const validStatuses: Status[] = ['publié', 'brouillon', 'archivé'];
    if (!validStatuses.includes(status)) {
      console.error('❌ [API/Places] Status invalide:', status);
      return NextResponse.json(
        { error: 'Status invalide' },
        { status: 400 }
      );
    }

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
      currentStatus: place.metadata.status
    });

    // Mise à jour du lieu
    const updatedPlace = await placeRepository.update(placeId, {
      metadata: {
        ...place.metadata,
        status,
        lastModifiedAt: new Date(),
        lastModifiedBy: session.user.email
      }
    });

    console.log('✨ [API/Places] Successfully updated place status:', {
      placeId,
      oldStatus: place.metadata.status,
      newStatus: status
    });

    return NextResponse.json({
      success: true,
      data: updatedPlace
    });

  } catch (error) {
    console.error('❌ [API/Places] Error updating place status:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const PATCH = protectApiRoute(handleUpdateStatus, 'admin'); 