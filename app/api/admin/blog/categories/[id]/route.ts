import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
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

    const { data: category, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in GET /api/admin/blog/categories/[id]:', error);
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

    const data = await request.json();

    const { data: category, error } = await supabase
      .from('blog_categories')
      .update(data)
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (error || !category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in PATCH /api/admin/blog/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Vérifier si la catégorie a des articles associés
    const { count: articlesCount, error: articlesError } = await supabase
      .from('blogs')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', resolvedParams.id);

    if (articlesError) {
      throw articlesError;
    }

    if (articlesCount && articlesCount > 0) {
      return NextResponse.json(
        { error: 'Cette catégorie contient des articles et ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie a des sous-catégories
    const { count: childrenCount, error: childrenError } = await supabase
      .from('blog_categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', resolvedParams.id);

    if (childrenError) {
      throw childrenError;
    }

    if (childrenCount && childrenCount > 0) {
      return NextResponse.json(
        { error: 'Cette catégorie contient des sous-catégories et ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', resolvedParams.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/admin/blog/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 