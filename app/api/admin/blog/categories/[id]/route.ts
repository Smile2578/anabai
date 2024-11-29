import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogCategory from '@/models/blog-category.model';
import connectDB from '@/lib/db/connection';

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
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const category = await BlogCategory.findById(resolvedParams.id);
    if (!category) {
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
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    const category = await BlogCategory.findById(resolvedParams.id);

    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
    }

    Object.assign(category, data);
    await category.save();

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
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    // Vérifier si la catégorie a des articles associés
    const hasArticles = await BlogCategory.exists({ category: resolvedParams.id });
    if (hasArticles) {
      return NextResponse.json(
        { error: 'Cette catégorie contient des articles et ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    // Vérifier si la catégorie a des sous-catégories
    const hasChildren = await BlogCategory.exists({ parent: resolvedParams.id });
    if (hasChildren) {
      return NextResponse.json(
        { error: 'Cette catégorie contient des sous-catégories et ne peut pas être supprimée' },
        { status: 400 }
      );
    }

    const category = await BlogCategory.findByIdAndDelete(resolvedParams.id);
    if (!category) {
      return NextResponse.json(
        { error: 'Catégorie non trouvée' },
        { status: 404 }
      );
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