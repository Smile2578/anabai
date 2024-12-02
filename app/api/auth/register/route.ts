// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import { emailService } from '@/lib/auth/sendEmail';
import { validatePassword } from '@/lib/auth/passwordUtils';
import { rateLimit } from '@/lib/utils/security';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    if (!rateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        { status: 429 }
      );
    }

    await connectDB();
    const { name, email, password } = await req.json();

    // Validation des champs requis
    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Tous les champs sont requis'
      }, { status: 400 });
    }

    // Validation du mot de passe
    const validation = validatePassword(password);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Mot de passe invalide',
        details: validation.errors
      }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.providers?.google) {
        return NextResponse.json(
          { error: 'Cet email est déjà utilisé avec Google. Veuillez vous connecter avec Google.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Générer le token de vérification
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

    // Créer l'utilisateur
    const newUser = new User({
      name,
      email,
      password,
      status: 'inactive',
      emailVerified: false,
      verificationToken,
      verificationTokenExpiry,
      providers: {
        credentials: {
          lastLogin: new Date()
        }
      }
    });

    await newUser.save();

    // Envoyer l'email de vérification
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      await User.deleteOne({ email });
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email de vérification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
      success: true
    }, { status: 201 });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue' },
      { status: 500 }
    );
  }
}