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
  console.log('🔍 GET /api/admin/blog/[id] - Début de la requête');
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
        author:users!blogs_author_id_fkey (
          id,
          name,
          email
        ),
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

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  console.log('🔄 PATCH /api/admin/blog/[id] - Début de la requête');
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

    const body = await request.json();
    console.log('📝 Données reçues:', body);

    const { data: post, error } = await supabase
      .from('blogs')
      .update({
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        category_id: body.category_id,
        cover_image: body.cover_image,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'article:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'article' },
        { status: 500 }
      );
    }

    if (!post) {
      console.error('❌ Article non trouvé avec l\'ID:', resolvedParams.id);
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    console.log('✅ Article mis à jour avec succès:', post);
    return NextResponse.json(post);
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  console.log('🗑️ DELETE /api/admin/blog/[id] - Début de la requête');
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

    if (!user?.user_metadata?.role || !['admin'].includes(user.user_metadata.role)) {
      console.error('❌ Rôle non autorisé:', user?.user_metadata?.role);
      return NextResponse.json(
        { error: 'Non autorisé - Seuls les administrateurs peuvent supprimer des articles' },
        { status: 401 }
      );
    }

    // Vérifier si l'article existe avant de le supprimer
    const { data: existingPost, error: checkError } = await supabase
      .from('blogs')
      .select('id')
      .eq('id', resolvedParams.id)
      .single();

    if (checkError || !existingPost) {
      console.error('❌ Article non trouvé:', checkError || 'Aucun article avec cet ID');
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Supprimer l'article
    const { error: deleteError } = await supabase
      .from('blogs')
      .delete()
      .eq('id', resolvedParams.id);

    if (deleteError) {
      console.error('❌ Erreur lors de la suppression:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'article' },
        { status: 500 }
      );
    }

    console.log('✅ Article supprimé avec succès');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur serveur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 