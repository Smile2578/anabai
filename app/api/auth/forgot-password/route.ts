// app/api/auth/forgot-password/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import crypto from 'crypto';
import { emailService } from '@/lib/auth/sendEmail';
import { checkResetAttempts, getResetAttemptInfo } from '@/lib/auth/passwordUtils';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { email } = await req.json();
    const requestIp = req.headers.get('x-forwarded-for') || 'unknown';

    // Vérifier les tentatives de réinitialisation
    const identifier = `${email}:${requestIp}`;
    if (!checkResetAttempts(identifier)) {
      const attemptInfo = getResetAttemptInfo(identifier);
      const remainingTime = attemptInfo?.blockExpiry ? 
        Math.ceil((attemptInfo.blockExpiry - Date.now()) / 1000 / 60) : 30;

      return NextResponse.json({
        error: `Trop de tentatives. Veuillez réessayer dans ${remainingTime} minutes.`,
        blocked: true,
        remainingTime
      }, { status: 429 });
    }

    const user = await User.findOne({ email });

    // Même si l'utilisateur n'existe pas, nous renvoyons un message générique
    // pour éviter la divulgation d'informations
    if (!user) {
      return NextResponse.json({
        message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.'
      });
    }

    // Vérifier si une demande récente existe déjà
    if (user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
      return NextResponse.json({
        message: 'Un email de réinitialisation a déjà été envoyé. Veuillez vérifier votre boîte de réception ou attendre avant de faire une nouvelle demande.'
      });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // Envoyer l'email avec le nouveau template
    await emailService.sendResetPasswordEmail(user.email, user.name, resetToken);

    return NextResponse.json({ 
      message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.' 
    });
  } catch (error: unknown) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de l\'email.' },
      { status: 500 }
    );
  }
}
