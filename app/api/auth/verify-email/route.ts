// app/api/auth/verify-email/route.ts
import { NextResponse } from 'next/server';
import { emailService } from '@/lib/auth/sendEmail';
import { generateVerificationToken, isTokenExpired } from '@/lib/auth/tokens';
import User from '@/models/User';
import dbConnect from '@/lib/db/connection';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (user.status === 'active') {
      return NextResponse.json(
        { error: 'Email déjà vérifié' },
        { status: 400 }
      );
    }

    // Générer un nouveau token de vérification
    const { token, hashedToken, expires } = generateVerificationToken();

    // Mettre à jour l'utilisateur avec le nouveau token
    user.verificationToken = hashedToken;
    user.verificationTokenExpiry = expires;
    await user.save();

    // Envoyer l'email de vérification
    await emailService.sendVerificationEmail(user.email, user.name, token);

    return NextResponse.json({
      message: 'Email de vérification envoyé',
      email: user.email
    });
  } catch (error) {
    console.error('❌ [API/Verify-Email]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email de vérification' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() }
    });

    if (!user || isTokenExpired(user.verificationTokenExpiry as Date)) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Activer le compte
    user.status = 'active';
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      message: 'Email vérifié avec succès',
      status: 'active'
    });
  } catch (error) {
    console.error('❌ [API/Verify-Email]:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification de l\'email' },
      { status: 500 }
    );
  }
}