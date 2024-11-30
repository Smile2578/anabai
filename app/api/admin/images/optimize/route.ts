import { NextRequest, NextResponse } from 'next/server'
import { protectApiRoute } from '@/lib/auth/protect-api'
import { imageQueue } from '@/lib/queue/queues/image.queue'
import { SessionWithUser } from '@/lib/auth/protect-api'

interface OptimizeRequest {
  imageUrl: string
  quality?: number
  format?: 'jpeg' | 'webp' | 'avif'
}

async function optimizeImage(req: NextRequest, session: SessionWithUser) {
  try {
    const body = await req.json() as OptimizeRequest
    const { imageUrl, quality, format } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL de l\'image requise' },
        { status: 400 }
      )
    }

    const job = await imageQueue.addOptimizeJob(imageUrl, session.user.id, {
      quality,
      format
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: 'Optimisation de l\'image en cours'
    })
  } catch (error) {
    console.error('Error in POST /api/admin/images/optimize:', error)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}

export const POST = protectApiRoute(optimizeImage, 'admin') 