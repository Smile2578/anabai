import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { action } = await request.json();

    const post = await BlogPost.findById(params.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'publish':
        post.status = 'published';
        post.publishedAt = new Date();
        break;
      case 'archive':
        post.status = 'archived';
        break;
      case 'delete':
        await post.deleteOne();
        return NextResponse.json({ success: true });
      default:
        return NextResponse.json(
          { error: 'Action non valide' },
          { status: 400 }
        );
    }

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in PATCH /api/admin/blog/[id]/status:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 