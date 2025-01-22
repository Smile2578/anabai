import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface BlogCategory {
  id: string;
  parent_id: string | null;
  name: { fr: string; en?: string };
  order_index: number;
  children?: BlogCategory[];
}

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

    const { data: categories, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      throw error;
    }

    // Fonction pour construire l'arbre des catégories
    const buildCategoryTree = (categories: BlogCategory[], parentId: string | null = null): BlogCategory[] => {
      return categories
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          ...cat,
          children: buildCategoryTree(categories, cat.id)
        }));
    };

    return NextResponse.json(buildCategoryTree(categories));
  } catch (error) {
    console.error('Error in GET /api/admin/blog/categories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
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

    const { data: category, error } = await supabase
      .from('blog_categories')
      .insert({
        ...data,
        slug: data.name.fr.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/blog/categories:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 