import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser, RouteParams } from '@/lib/auth/protect-api';
import { z } from 'zod';
import connectDB from '@/lib/db/connection';
import BlogPost from '@/models/blog.model';

const updateStatusSchema = z.object({
  action: z.enum(['publish', 'archive', 'delete']),
  scheduledDate: z.string().datetime().optional()
});

async function updatePostStatus(
  req: NextRequest,
  session: SessionWithUser,
  routeParams: RouteParams
): Promise<NextResponse> {
  try {
    const resolvedParams = await routeParams.params;
    console.log('ID reçu:', resolvedParams.id);

    await connectDB();
    const post = await BlogPost.findById(resolvedParams.id);
    console.log('Post trouvé:', post);
    
    if (!post) {
      console.log('Post non trouvé dans la DB');
      return NextResponse.json({ error: 'Article non trouvé' }, { status: 404 });
    }

    const body = await req.json();
    const validatedBody = updateStatusSchema.parse(body);
    const { action } = validatedBody;

    switch (action) {
      case 'publish':
        post.status = 'published';
        post.publishedAt = new Date();
        await post.save();
        break;

      case 'archive':
        post.status = 'archived';
        await post.save();
        break;

      case 'delete':
        await BlogPost.deleteOne({ _id: resolvedParams.id });
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Article ${action === 'delete' ? 'supprimé' : action === 'publish' ? 'publié' : 'archivé'} avec succès`
    });

  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

export const PATCH = protectApiRoute(updatePostStatus); 