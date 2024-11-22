// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';

// GET /api/admin/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({})
      .select('id name email role status createdAt lastLogin')
      .sort('-createdAt');

    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Créer un nouvel utilisateur
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, role, status, password } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Le mot de passe est requis" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await User.create({
      email,
      name,
      role,
      status,
      password: hashedPassword,
      provider: "credentials",
    });

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(userData);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
