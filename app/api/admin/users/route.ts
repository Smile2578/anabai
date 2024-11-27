// app/api/admin/users/route.ts
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectDB from '@/lib/db/connection';
import User, { IUser } from '@/models/User';

async function handleGetUsers(req: Request, session: SessionWithUser) {
  try {
    console.log('👥 [API/Users] GET request by:', {
      user: session.user.email,
      role: session.user.role
    });

    await connectDB();
    
    const users = await User.find({})
      .select('id name email role status createdAt lastLogin')
      .sort('-createdAt');

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la récupération des utilisateurs",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

async function handleCreateUser(req: Request, session: SessionWithUser) {
  try {
    console.log('👥 [API/Users] POST request by:', {
      user: session.user.email,
      role: session.user.role
    });

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Seuls les administrateurs peuvent créer des utilisateurs" },
        { status: 403 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { email, name, role, status, password } = body;

    // Validation des données
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être remplis" },
        { status: 400 }
      );
    }

    // Vérification de l'email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    // Création de l'utilisateur
    const hashedPassword = await hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      name,
      role,
      status,
      password: hashedPassword,
      provider: "credentials",
    }) as IUser;

    // Retourner les données sans le mot de passe
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la création de l'utilisateur",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const GET = protectApiRoute(handleGetUsers, 'admin');
export const POST = protectApiRoute(handleCreateUser, 'admin');