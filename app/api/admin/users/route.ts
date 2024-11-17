import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
import { hash } from "bcrypt";

// GET /api/admin/users - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

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
    const body = await req.json();
    const { email, name, role, status, password } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await db.user.findUnique({
      where: { email }
    });

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

    const user = await db.user.create({
      data: {
        email,
        name,
        role,
        status,
        password: hashedPassword,
        provider: "credentials"
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });

    return NextResponse.json(user);
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
    const { userId } = params;
    const body = await req.json();
    const { email, name, role, status } = body;

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const existingUser = await db.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId
        }
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: {
        email,
        name,
        role,
        status
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        lastLogin: true
      }
    });

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
    const { userId } = params;

    await db.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
