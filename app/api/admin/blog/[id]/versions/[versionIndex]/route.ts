import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

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
    const session = await auth();
    const resolvedParams = await params;
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    await connectDB();

    const post = await BlogPost.findById(resolvedParams.id);
    if (!post) {
      return NextResponse.json(
        { error: 'Article non trouvé' },
        { status: 404 }
      );
    }

    const versionIndex = parseInt(resolvedParams.versionIndex);
    if (isNaN(versionIndex) || !post.versions?.[versionIndex]) {
      return NextResponse.json(
        { error: 'Version non trouvée' },
        { status: 404 }
      );
    }

    const version = post.versions[versionIndex];
    post.title = version.title;
    post.content = version.content;
    post.excerpt = version.excerpt;
    post.coverImage = version.coverImage;
    post.category = version.category;
    post.tags = version.tags;
    post.seo = version.seo;

    post.$skipVersioning = true;
    await post.save();
    post.$skipVersioning = false;

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error in POST /api/admin/blog/[id]/versions/[versionIndex]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 