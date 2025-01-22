import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateStatusSchema = z.object({
  action: z.enum(['publish', 'archive', 'delete']),
  scheduledDate: z.string().datetime().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const resolvedParams = await params;

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le rôle de l'utilisateur depuis la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || !['admin', 'editor'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Non autorisé - Rôle invalide' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedBody = updateStatusSchema.parse(body);
    const { action } = validatedBody;

    switch (action) {
      case 'publish': {
        const { error } = await supabase
          .from('blogs')
          .update({
            status: 'published',
            published_at: new Date().toISOString()
          })
          .eq('id', resolvedParams.id);

        if (error) throw error;
        break;
      }

      case 'archive': {
        const { error } = await supabase
          .from('blogs')
          .update({ status: 'archived' })
          .eq('id', resolvedParams.id);

        if (error) throw error;
        break;
      }

      case 'delete': {
        const { error } = await supabase
          .from('blogs')
          .delete()
          .eq('id', resolvedParams.id);

        if (error) throw error;
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Article ${action === 'delete' ? 'supprimé' : action === 'publish' ? 'publié' : 'archivé'} avec succès`
    });

  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
} 