// app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

function getUserIdFromRequest(req: NextRequest): string | null {
  try {
    const segments = req.nextUrl.pathname.split('/');
    const userId = segments[segments.length - 1];

    if (!userId || userId === 'undefined') {
      console.log('❌ [API/Users] ID manquant dans l\'URL');
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
    const userId = getUserIdFromRequest(req);
    const body = await req.json();
    const { email, name, role, status } = body;

    console.log('📝 [API/Users] Tentative de modification:', {
      userId,
      email,
      name,
      role,
      status,
      by: session.user.email
    });

    if (!userId) {
      return NextResponse.json(
        { error: "ID utilisateur manquant" },
        { status: 400 }
      );
    }

    // Vérifier l'existence de l'utilisateur
    const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError || !existingUser.user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log('✅ [API/Users] Utilisateur existant:', {
      id: existingUser.user.id,
      email: existingUser.user.email,
      currentRole: existingUser.user.role,
      newRole: role
    });

    // Empêcher la modification d'un admin par un non-admin
    if (existingUser.user.role === 'admin' && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour modifier un administrateur" },
        { status: 403 }
      );
    }

    // Préserver les métadonnées existantes
    const currentMetadata = existingUser.user.user_metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      name,
      role,
      status
    };

    console.log('📝 [API/Users] Métadonnées à mettre à jour:', updatedMetadata);

    // Mise à jour de l'utilisateur
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        email,
        user_metadata: updatedMetadata,
        role: role
      }
    );

    if (updateError) {
      console.error('❌ [API/Users] Erreur lors de la mise à jour:', updateError);
      throw updateError;
    }

    console.log('✅ [API/Users] Utilisateur mis à jour:', {
      id: updatedUser.user.id,
      email: updatedUser.user.email,
      metadata: updatedUser.user.user_metadata,
      role: updatedUser.user.role
    });

    // Gérer le statut (actif/inactif) via le bannissement
    if (status === 'inactive') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '87600h' // 10 ans
      });
    } else {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '0' // Débannir
      });
    }

    // Retourner les données formatées
    const userData = {
      id: updatedUser.user.id,
      name: updatedUser.user.user_metadata?.name || updatedUser.user.email?.split('@')[0] || 'Sans nom',
      email: updatedUser.user.email || '',
      role: updatedUser.user.role || 'user',
      status: status,
      createdAt: updatedUser.user.created_at,
      lastLogin: updatedUser.user.last_sign_in_at
    };

    console.log('✅ [API/Users] Données formatées retournées:', userData);
    return NextResponse.json(userData);
  } catch (error) {
    console.error('❌ [API/Users] Erreur lors de la modification:', error);
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

    const userId = getUserIdFromRequest(req);

    if (!userId) {
      console.log('❌ [API/Users] ID utilisateur invalide ou manquant');
      return NextResponse.json(
        { error: "ID utilisateur invalide ou manquant" },
        { status: 400 }
      );
    }

    // Vérifier l'existence de l'utilisateur
    const { data: user, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (fetchError || !user.user) {
      console.log('❌ [API/Users] Utilisateur non trouvé:', userId);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log('✅ [API/Users] Utilisateur trouvé:', {
      id: user.user.id,
      email: user.user.email,
      role: user.user.role
    });

    // Empêcher la suppression d'un admin
    if (user.user.role === 'admin') {
      console.log('🚫 [API/Users] Tentative de suppression d\'un admin');
      return NextResponse.json(
        { error: "Impossible de supprimer un administrateur" },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw deleteError;
    }

    console.log('✅ [API/Users] Suppression réussie:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [API/Users] Erreur lors de la suppression:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}

export const PUT = protectApiRoute(handleUpdateUser, 'admin');
export const DELETE = protectApiRoute(handleDeleteUser, 'admin');