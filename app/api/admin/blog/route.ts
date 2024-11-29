import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const posts = await BlogPost.find({})
      .select('title slug excerpt coverImage author category publishedAt status')
      .sort({ createdAt: -1 });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error in GET /api/admin/blog:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Vérification des champs requis
    if (!data.title?.fr || !data.content?.fr || !data.excerpt?.fr || !data.category) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Création de l'article
    const post = new BlogPost({
      ...data,
      author: {
        id: session.user.id,
        name: session.user.name || 'Anonyme',
      },
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
    });
    console.log(post);
    await post.save();

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/blog:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 