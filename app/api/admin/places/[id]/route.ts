// app/api/admin/places/[id]/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import { placeRepository } from '@/lib/repositories/place-repository';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

async function handleGetPlace(req: Request, session: SessionWithUser, { params }: RouteParams) {
  try {
    console.log('👤 [API/Places] GET request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    const { id } = await params;
    
    const place = await placeRepository.findById(id);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);

  } catch (error) {
    console.error('Error fetching place:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du lieu' },
      { status: 500 }
    );
  }
}

async function handleUpdatePlace(req: Request, session: SessionWithUser, { params }: RouteParams) {
  try {
    console.log('👤 [API/Places] PATCH request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    const { id } = await params;
    const updates = await req.json();
    
    const place = await placeRepository.update(id, updates);
    if (!place) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(place);

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lieu' },
      { status: 500 }
    );
  }
}

async function handleDeletePlace(req: Request, session: SessionWithUser, { params }: RouteParams) {
  try {
    console.log('👤 [API/Places] DELETE request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();
    const { id } = await params;
    
    const success = await placeRepository.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting place:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du lieu' },
      { status: 500 }
    );
  }
}

export const GET = protectApiRoute((req: Request, session: SessionWithUser) => handleGetPlace(req, session, { params: Promise.resolve({ id: req.url.split('/').pop()! }) }), 'admin');
export const PATCH = protectApiRoute((req: Request, session: SessionWithUser) => handleUpdatePlace(req, session, { params: Promise.resolve({ id: req.url.split('/').pop()! }) }), 'admin');
export const DELETE = protectApiRoute((req: Request, session: SessionWithUser) => handleDeletePlace(req, session, { params: Promise.resolve({ id: req.url.split('/').pop()! }) }), 'admin');