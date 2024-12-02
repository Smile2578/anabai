// app/api/auth/link-account/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  role: string;
  status: string;
  password?: string;
  metadata?: {
    pendingLinkToken?: string;
    pendingLinkProvider?: string;
    pendingLinkEmail?: string;
    pendingLinkExpiry?: Date;
    pendingLinkId?: string;
    pendingLinkName?: string;
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Données reçues:', body);
    
    const { email, provider, password, token } = body;

    // Vérification des paramètres requis
    if (!email || !provider || !password || !token) {
      console.log('Paramètres manquants:', { email, provider, password, token });
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Recherche de l'utilisateur avec vérification du token de liaison
    const user = await User.findOne({
      email,
      'metadata.pendingLinkToken': token,
      'metadata.pendingLinkExpiry': { $gt: new Date() }
    }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Token de liaison invalide ou expiré' },
        { status: 404 }
      );
    }

    // Vérification que le provider en attente correspond
    if (user.metadata?.pendingLinkProvider !== provider) {
      return NextResponse.json(
        { error: 'Provider invalide' },
        { status: 400 }
      );
    }

    // Vérification du mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password || '');
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Construction de l'objet provider pour Google
    const providerData = {
      id: user.metadata?.pendingLinkId || '',
      email: user.metadata?.pendingLinkEmail || email,
      lastLogin: new Date(),
      isConfigured: true
    };

    // Mise à jour du compte avec le nouveau provider
    const updatedUser = await User.findByIdAndUpdate<IUser>(user._id, {
      $set: {
        [`providers.${provider}`]: providerData,
        // Mise à jour du nom avec celui de Google si disponible
        name: user.metadata?.pendingLinkName || user.name,
        // Nettoyage des métadonnées de liaison
        'metadata.pendingLinkToken': undefined,
        'metadata.pendingLinkProvider': undefined,
        'metadata.pendingLinkEmail': undefined,
        'metadata.pendingLinkExpiry': undefined,
        'metadata.pendingLinkId': undefined,
        'metadata.pendingLinkName': undefined
      }
    }, { new: true });

    return NextResponse.json({
      message: 'Comptes liés avec succès',
      status: 'success',
      user: {
        id: updatedUser?._id.toString(),
        email: updatedUser?.email,
        name: updatedUser?.name,
        role: updatedUser?.role,
        status: updatedUser?.status
      }
    });

  } catch (error) {
    console.error('❌ [API/Link-Account]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la liaison des comptes' },
      { status: 500 }
    );
  }
}