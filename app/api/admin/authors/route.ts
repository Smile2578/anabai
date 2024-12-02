// app/api/admin/authors/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import type { IUser } from '@/models/User';
import Place from '@/models/place.model';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';

async function handleGetAuthors(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] GET request by:', {
      user: session.user.email,
      role: session.user.role
    });
    await connectDB();

    const authors = await User.find({
      role: { $in: ['admin', 'editor'] }
    }).lean() as unknown as (IUser & { _id: string })[];

    const formattedAuthors = authors.map(author => ({
      id: author._id,
      name: author.name,
      role: author.role,
      email: author.email
    }));

    return NextResponse.json(formattedAuthors);
    
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des auteurs' },
      { status: 500 }
    );
  }
}

async function handleAddAuthor(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });
    const { placeId, authorId } = await req.json();

    if (!placeId || !authorId) {
      return NextResponse.json(
        { error: 'Place ID et Author ID sont requis' },
        { status: 400 }
      );
    }

    await connectDB();

    const author = await User.findOne({
      _id: authorId,
      role: { $in: ['admin', 'editor'] }
    }).lean() as unknown as (IUser & { _id: string });

    if (!author) {
      return NextResponse.json(
        { error: 'Auteur non trouvé ou non autorisé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      id: author._id,
      name: author.name,
      role: author.role
    });
    
  } catch (error) {
    console.error('Error adding author:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'auteur" },
      { status: 500 }
    );
  }
}

async function handleUpdateAuthors(req: Request, session: SessionWithUser) {
  try {
    console.log('👤 [API/Places] PATCH request by:', {
      user: session.user.email,
      role: session.user.role
    });
    const { placeId, authors } = await req.json();

    if (!placeId || !authors) {
      return NextResponse.json(
        { error: 'Place ID et authors sont requis' },
        { status: 400 }
      );
    }

    await connectDB();

    // Vérifier que tous les auteurs existent et ont les bons rôles
    const authorIds = authors.map((a: { id: string }) => a.id);
    const validAuthors = await User.find({
      _id: { $in: authorIds },
      role: { $in: ['admin', 'editor'] }
    });

    if (validAuthors.length !== authors.length) {
      return NextResponse.json(
        { error: 'Certains auteurs sont invalides ou non autorisés' },
        { status: 400 }
      );
    }

    // Mettre à jour les auteurs du lieu
    const updatedPlace = await Place.findByIdAndUpdate(
      placeId,
      {
        $set: {
          'metadata.authors': authors.map((author: { id: string; name: string; role: string }) => ({
            id: author.id,
            name: author.name,
            role: author.role,
            addedAt: new Date()
          }))
        }
      },
      { new: true }
    );
    
    if (!updatedPlace) {
      return NextResponse.json(
        { error: 'Lieu non trouvé' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      authors: updatedPlace.metadata.authors || []
    });

  } catch (error) {
    console.error('Error updating authors:', error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des auteurs" },
      { status: 500 }
    );
  }
}

export const GET = protectApiRoute(handleGetAuthors, 'editor');
export const POST = protectApiRoute(handleAddAuthor, 'editor');
export const PATCH = protectApiRoute(handleUpdateAuthors, 'editor');