import { NextRequest, NextResponse } from 'next/server'
import { protectApiRoute } from '@/lib/auth/protect-api'
import { queues } from '@/lib/queue/queues'
import { z } from 'zod'

const getJobsSchema = z.object({
  queueName: z.enum(['blog', 'import', 'image', 'place']),
  status: z.enum(['active', 'completed', 'failed', 'delayed', 'waiting']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10)
})

async function getJobs(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const validatedParams = getJobsSchema.parse({
      queueName: searchParams.get('queueName'),
      status: searchParams.get('status'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit')
    })

    const { queueName, status, page, limit } = validatedParams

    const queue = queues[queueName]
    const jobs = await queue.getJobs([status || 'active'], (page - 1) * limit, page * limit - 1)
    const counts = await queue.getJobCounts()
    const total = counts[status || 'active'] || 0

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des jobs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}

export const GET = protectApiRoute(getJobs) 