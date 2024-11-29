import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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
    const post = await BlogPost.findById(resolvedParams.id);

    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    post.status = data.status;
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