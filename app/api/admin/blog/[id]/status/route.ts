import { NextRequest, NextResponse } from 'next/server';
import { protectApiRoute, SessionWithUser, RouteParams } from '@/lib/auth/protect-api';
import { blogQueue } from '@/lib/queue/queues/blog.queue';
import { z } from 'zod';

const updateStatusSchema = z.object({
  action: z.enum(['publish', 'unpublish', 'schedule']),
  scheduledDate: z.string().datetime().optional()
});

async function updatePostStatus(
  req: NextRequest,
  session: SessionWithUser,
  routeParams: RouteParams
): Promise<NextResponse> {
  try {
    const params = await routeParams.params;
    if (!params.id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const body = await req.json();
    const validatedBody = updateStatusSchema.parse(body);
    const { action, scheduledDate } = validatedBody;

    let job;
    switch (action) {
      case 'publish':
        job = await blogQueue.addPublishJob(params.id, session.user.id);
        break;
      case 'unpublish':
        job = await blogQueue.addUnpublishJob(params.id, session.user.id);
        break;
      case 'schedule':
        if (!scheduledDate) {
          return NextResponse.json(
            { error: 'Date de publication requise pour la planification' },
            { status: 400 }
          );
        }
        job = await blogQueue.addScheduleJob(params.id, session.user.id, new Date(scheduledDate));
        break;
    }

    return NextResponse.json({
      success: true,
      jobId: job?.id,
      message: `Action ${action} ajoutée à la queue avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    );
  }
}

export const PATCH = protectApiRoute(updatePostStatus); 