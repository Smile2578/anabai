// app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';

// Fonction utilitaire pour extraire userId de l'URL
function getUserIdFromRequest(req: NextRequest): string | null {
  const pathname = req.nextUrl.pathname; // Ex: /api/admin/users/123
  const parts = pathname.split('/');
  const userId = parts.pop() || parts.pop(); // Récupère le dernier segment non vide

  return userId || null;
}

// PUT /api/admin/users/[userId] - Modifier un utilisateur
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, role, status } = body;

    // Extraire userId de l'URL
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur introuvable dans l'URL" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        email,
        name,
        role,
        status,
      },
      { new: true }
    ).select('id name email role status createdAt lastLogin');

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Supprimer un utilisateur
export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    // Extraire userId de l'URL
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur introuvable dans l'URL" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
