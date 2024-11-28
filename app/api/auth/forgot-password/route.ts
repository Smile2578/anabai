// app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import crypto from 'crypto';
import { sendEmail } from '@/lib/auth/sendEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "Aucun utilisateur trouvé avec cet email." },
        { status: 400 }
      );
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // Envoyer l'email avec le lien de réinitialisation
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    const message = `
      <p>Vous avez demandé une réinitialisation de mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">Réinitialiser le mot de passe</a>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe',
      html: message,
    });
    return NextResponse.json({ message: 'Email envoyé' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur inconnue est survenue' }, { status: 500 });
  }
}
