// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import { emailService } from '@/lib/auth/sendEmail';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
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
      verificationTokenExpiry
    });

    await newUser.save();

    // Envoyer l'email de vérification
    try {
      await emailService.sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi de l\'email:', emailError);
      // Supprimer l'utilisateur si l'email n'a pas pu être envoyé
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
      { 
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
        success: false
      },
      { status: 500 }
    );
  }
}