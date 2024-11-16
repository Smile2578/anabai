// app/api/auth/reset-password/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';


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

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return NextResponse.json({ message: 'Mot de passe mis à jour avec succès.' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur inconnue est survenue' }, { status: 500 });
  }
}
