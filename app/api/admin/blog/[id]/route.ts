import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const session = await auth();
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await BlogPost.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in GET /api/admin/blog/[id]:', error);
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
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    const post = await BlogPost.findById(params.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    // Mise à jour des champs
    Object.assign(post, {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      category: data.category,
      tags: data.tags,
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
    });

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in PATCH /api/admin/blog/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 