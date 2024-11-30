import { NextRequest, NextResponse } from 'next/server'
import { protectApiRoute } from '@/lib/auth/protect-api'
import { queues } from '@/lib/queue/queues'
import { z } from 'zod'

const statusSchema = z.object({
  queueName: z.enum(['blog', 'import', 'image', 'place']).optional()
})

async function getQueueStatus(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const validatedParams = statusSchema.parse({
      queueName: searchParams.get('queueName')
    })

    const { queueName } = validatedParams
    const status: Record<string, { isPaused: boolean; counts: Record<string, number> }> = {}

    if (queueName) {
      const queue = queues[queueName]
      const isPaused = await queue.isPaused()
      const counts = await queue.getJobCounts()
      status[queueName] = {
        isPaused,
        counts
      }
    } else {
      for (const [name, queue] of Object.entries(queues)) {
        const isPaused = await queue.isPaused()
        const counts = await queue.getJobCounts()
        status[name] = {
          isPaused,
          counts
        }
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erreur lors de la récupération du statut des queues:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}

export const GET = protectApiRoute(getQueueStatus) 