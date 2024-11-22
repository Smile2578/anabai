// app/api/admin/users/[userId]/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';

// PUT /api/admin/users/[userId] - Modifier un utilisateur
export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, name, role, status } = body;
    const { userId } = params;

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
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[userId] - Supprimer un utilisateur
export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const { userId } = params;

    await User.findByIdAndDelete(userId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
