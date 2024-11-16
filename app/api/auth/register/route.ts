// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();
    return NextResponse.json({ message: 'Utilisateur créé avec succès' }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Une erreur inconnue est survenue' }, { status: 500 });
  }
}
