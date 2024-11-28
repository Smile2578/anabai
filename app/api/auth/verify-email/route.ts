// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur avec ce token de vérification
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Mise à jour du statut de l'utilisateur
    user.status = 'active';
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    return NextResponse.json(
      { message: 'Email vérifié avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}