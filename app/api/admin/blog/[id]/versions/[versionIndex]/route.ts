import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import BlogPost from '@/models/blog.model';
import connectDB from '@/lib/db/connection';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; versionIndex: string } }
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

    const versionIndex = parseInt(params.versionIndex);
    await post.restoreVersion(versionIndex);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/admin/blog/[id]/versions/[versionIndex]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 