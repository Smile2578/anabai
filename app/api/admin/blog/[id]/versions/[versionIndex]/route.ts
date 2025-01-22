import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{
    id: string;
    versionIndex: string;
  }>;
};

export async function POST(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const resolvedParams = await params;

    if (authError || !user?.user_metadata?.role || !['admin', 'editor'].includes(user.user_metadata.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer l'article et ses versions
    const { data: post, error: postError } = await supabase
      .from('blogs')
      .select('*, blog_versions(*)')
      .eq('id', resolvedParams.id)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    const versionIndex = parseInt(resolvedParams.versionIndex);
    if (isNaN(versionIndex) || !post.blog_versions?.[versionIndex]) {
      return NextResponse.json(
        { error: 'Version non trouvée' },
        { status: 404 }
      );
    }

    const version = post.blog_versions[versionIndex];

    // Mettre à jour l'article avec les données de la version
    const { error: updateError } = await supabase
      .from('blogs')
      .update({
        title: version.version_data.title,
        content: version.version_data.content,
        excerpt: version.version_data.excerpt,
        cover_image: version.version_data.cover_image,
        category: version.version_data.category,
        tags: version.version_data.tags,
        seo: version.version_data.seo,
      })
      .eq('id', resolvedParams.id);

    if (updateError) {
      throw updateError;
    }

    // Récupérer l'article mis à jour
    const { data: updatedPost, error: fetchError } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error in POST /api/admin/blog/[id]/versions/[versionIndex]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 