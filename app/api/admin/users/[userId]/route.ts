// app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import User from '@/models/User';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';
import mongoose from 'mongoose';


function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    const segments = req.nextUrl.pathname.split('/');
    const userId = segments[segments.length - 1];

    if (!userId || userId === 'undefined') {
      console.log('❌ [API/Users] ID manquant dans l\'URL');
      return null;
    }

    // Vérifions que l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ [API/Users] ID non valide:', userId);
      return null;
    }

    console.log('✅ [API/Users] ID extrait avec succès:', userId);
    return userId;
  } catch (error) {
    console.error('❌ [API/Users] Erreur lors de l\'extraction de l\'ID:', error);
    return null;
  }
}

// PUT - Modifier un utilisateur
async function handleUpdateUser(req: NextRequest, session: SessionWithUser) {
  try {
    await connectDB();
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const { email, name, role, status } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur manquant" },
        { status: 400 }
      );
    }

    // Vérifier l'existence de l'utilisateur
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la modification d'un admin par un non-admin
    if (existingUser.role === 'admin' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour modifier un administrateur" },
        { status: 403 }
      );
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const duplicateEmail = await User.findOne({
      email,
      _id: { $ne: userId }
    });

    if (duplicateEmail) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email, name, role, status },
      { new: true }
    ).select('id name email role status createdAt lastLogin');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la modification:', error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un utilisateur
async function handleDeleteUser(req: NextRequest, session: SessionWithUser) {
  try {
    console.log('🗑️ [API/Users] Tentative de suppression par:', {
      admin: session.user.email,
      role: session.user.role
    });

    await connectDB();
    const userId = getUserIdFromRequest(req);

    // Validation plus stricte de l'ID
    if (!userId) {
      console.log('❌ [API/Users] ID utilisateur invalide ou manquant');
      return NextResponse.json(
        { error: "ID utilisateur invalide ou manquant" },
        { status: 400 }
      );
    }

    // Vérification de la validité de l'ID pour MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log('❌ [API/Users] ID non valide pour MongoDB:', userId);
      return NextResponse.json(
        { error: "Format d'ID utilisateur invalide" },
        { status: 400 }
      );
    }

    // Vérifier l'existence de l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ [API/Users] Utilisateur non trouvé:', userId);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log('✅ [API/Users] Utilisateur trouvé:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Empêcher la suppression d'un admin
    if (user.role === 'admin') {
      console.log('🚫 [API/Users] Tentative de suppression d\'un admin');
      return NextResponse.json(
        { error: "Impossible de supprimer un administrateur" },
        { status: 403 }
      );
    }

    await User.findByIdAndDelete(userId);
    console.log('✅ [API/Users] Suppression réussie:', userId);

    return NextResponse.json({ 
      success: true,
      message: "Utilisateur supprimé avec succès" 
    });
  } catch (error) {
    console.error('❌ [API/Users] Erreur lors de la suppression:', error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la suppression de l'utilisateur",
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

export const PUT = protectApiRoute(
  (req: Request, session: SessionWithUser) => handleUpdateUser(req as NextRequest, session),
  'admin'
);

export const DELETE = protectApiRoute(
  (req: Request, session: SessionWithUser) => handleDeleteUser(req as NextRequest, session),
  'admin'
);