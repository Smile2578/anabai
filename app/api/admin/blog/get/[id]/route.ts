import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  console.log('🔍 GET /api/admin/blog/get/[id] - Début de la requête');
  console.log('Params reçus:', params);

  try {
    const supabase = await createClient();
    console.log('✅ Client Supabase créé');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Utilisateur:', user);

    const resolvedParams = await params;
    console.log('🔑 ID de l\'article:', resolvedParams.id);

    if (authError) {
      console.error('❌ Erreur d\'authentification:', authError);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    if (!user?.user_metadata?.role || !['admin', 'editor'].includes(user.user_metadata.role)) {
      console.error('❌ Rôle non autorisé:', user?.user_metadata?.role);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    console.log('🔍 Recherche de l\'article dans la base de données');
    const { data: post, error } = await supabase
      .from('blogs')
      .select(`
        *,
        category:blog_categories!blogs_category_id_fkey (
          id,
          name,
          slug
        )
      `)
      .eq('id', resolvedParams.id)
      .single();

    if (error) {
      console.error('❌ Erreur lors de la récupération de l\'article:', error);
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    if (!post) {
      console.error('❌ Article non trouvé avec l\'ID:', resolvedParams.id);
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Article trouvé:', post);
    return NextResponse.json(post);
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 