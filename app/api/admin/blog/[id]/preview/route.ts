import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  console.log('📝 [GET] /api/admin/blog/[id]/preview - Chargement de l\'article:', resolvedParams.id);

  try {
    const supabase = await createClient();

    // Vérifier l'authentification de l'utilisateur
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Utilisateur non authentifié');
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le rôle de l'utilisateur
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Erreur lors de la récupération du rôle:', userError);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin ou éditeur
    if (!['admin', 'editor'].includes(userData.role)) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Rôle insuffisant:', userData.role);
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'article
    const { data: post, error: postError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (postError) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Erreur lors de la récupération de l\'article:', postError);
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer l'auteur
    const { data: author, error: authorError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('id', post.author_id)
      .single();

    if (authorError) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Erreur lors de la récupération de l\'auteur:', authorError);
    }

    // Récupérer la catégorie
    const { data: category, error: categoryError } = await supabase
      .from('blog_categories')
      .select('id, name_fr, name_en, slug')
      .eq('id', post.category_id)
      .single();

    if (categoryError) {
      console.error('❌ [GET] /api/admin/blog/[id]/preview - Erreur lors de la récupération de la catégorie:', categoryError);
    }

    // Combiner les données
    const enrichedPost = {
      ...post,
      author: author || null,
      category: category || null
    };

    console.log('✅ [GET] /api/admin/blog/[id]/preview - Article chargé avec succès');
    return NextResponse.json(enrichedPost);
  } catch (error) {
    console.error('❌ [GET] /api/admin/blog/[id]/preview - Erreur inattendue:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement de l\'article' },
      { status: 500 }
    );
  }
} 