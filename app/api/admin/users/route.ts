import { NextResponse } from "next/server";
import { hash } from "bcrypt";
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
      provider: "credentials"
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

// PUT /api/admin/users/[userId] - Modifier un utilisateur
export async function PUT(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();
    const { userId } = params;
    const body = await req.json();
    const { email, name, role, status } = body;

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId }
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
        status
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
