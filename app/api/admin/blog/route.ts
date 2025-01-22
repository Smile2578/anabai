import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.user_metadata?.role || !['admin', 'editor'].includes(user.user_metadata.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { data: posts, error } = await supabase
      .from('blogs')
      .select('*, author:profiles(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des articles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user?.user_metadata?.role || !['admin', 'editor'].includes(user.user_metadata.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Vérification des champs requis
    if (!data.title?.fr || !data.content?.fr || !data.excerpt?.fr || !data.category) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Création de l'article
    const { data: post, error } = await supabase
      .from('blogs')
      .insert({
        ...data,
        author_id: user.id,
        seo: {
          title: {
            fr: data.seo?.title?.fr || data.title.fr,
            en: data.seo?.title?.en || data.title.en,
          },
          description: {
            fr: data.seo?.description?.fr || data.excerpt.fr,
            en: data.seo?.description?.en || data.excerpt.en,
          },
          keywords: data.seo?.keywords || [],
        },
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/blog:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 