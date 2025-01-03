// app/api/admin/users/route.ts
import { protectApiRoute, SessionWithUser } from '@/lib/auth/protect-api';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';
import { SupabaseUser } from '@/types/supabase';

async function handleGetUsers(req: Request, session: SessionWithUser) {
  try {
    console.log("👥 [API/Users] GET request by:", session.user.email);
    
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ [API/Users] Supabase error:', error);
      throw error;
    }

    console.log('✅ [API/Users] Users fetched:', users.users.length);

    // Transformer les données pour correspondre à notre format
    const formattedUsers = users.users.map((user: SupabaseUser) => {
      console.log('🔄 [API/Users] Processing user:', {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        role: user.role,
        ban_duration: user.ban_duration
      });

      return {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Sans nom',
        email: user.email || '',
        role: user.role || 'user',
        status: user.ban_duration ? 'inactive' : 'active',
        createdAt: user.created_at,
        lastLogin: user.last_sign_in_at
      };
    });

    console.log('✅ [API/Users] Users formatted:', formattedUsers.length);
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('❌ [API/Users] Error fetching users:', error);
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

    const body = await req.json();
    const { email, name, role, status, password } = body;

    // Validation des données
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être remplis" },
        { status: 400 }
      );
    }

    // Créer l'utilisateur dans Supabase
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { name, role },
      role: role
    });

    if (createError) {
      throw createError;
    }

    // Si le statut est inactif, bannir l'utilisateur
    if (status === 'inactive') {
      await supabaseAdmin.auth.admin.updateUserById(newUser.user.id, {
        ban_duration: '87600h' // 10 ans
      });
    }

    // Retourner les données formatées
    const userData = {
      id: newUser.user.id,
      name: newUser.user.user_metadata?.name || newUser.user.email?.split('@')[0] || 'Sans nom',
      email: newUser.user.email || '',
      role: newUser.user.role || 'user',
      status: status,
      createdAt: newUser.user.created_at,
      lastLogin: newUser.user.last_sign_in_at
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