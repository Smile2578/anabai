// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import { emailService } from '@/lib/auth/sendEmail';
import { validatePassword } from '@/lib/auth/passwordUtils';
import { getIpLocation } from '@/lib/auth/geoip';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { password, token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token invalide ou manquant.' },
        { status: 400 }
      );
    }

    // Valider le mot de passe
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Mot de passe invalide',
        details: validation.errors,
        score: validation.score
      }, { status: 400 });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré.' },
        { status: 400 }
      );
    }

    // Vérifier si le nouveau mot de passe est différent de l'ancien
    const isSamePassword = await user.comparePassword(password);
    if (isSamePassword) {
      return NextResponse.json({
        error: 'Le nouveau mot de passe doit être différent de l\'ancien.',
      }, { status: 400 });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Envoyer l'email de confirmation
    await emailService.sendPasswordChangedEmail(user.email, user.name);

    // Si l'IP est différente de la dernière connexion, envoyer une alerte
    const requestIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (user.lastLoginIp && user.lastLoginIp !== requestIp) {
      const location = await getIpLocation(requestIp);
      await emailService.sendSuspiciousActivityEmail(user.email, user.name, {
        activity: 'password_reset',
        ip: requestIp,
        timestamp: new Date(),
        location: `${location.city}, ${location.region}, ${location.country}`
      });
    }

    return NextResponse.json({ 
      message: 'Mot de passe mis à jour avec succès. Un email de confirmation vous a été envoyé.',
      score: validation.score
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation du mot de passe.' },
      { status: 500 }
    );
  }
}
