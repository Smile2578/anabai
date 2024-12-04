// app/api/questionnaire/queue/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { initializeQueues } from '@/lib/queue/config/bullmq.server';
import { upstashRedis } from '@/lib/queue/config/redis';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { questionnaireQueue } = initializeQueues();

    await questionnaireQueue.add('process-questionnaire', {
      userId: session.user.id,
      data
    });

    // Mise en cache des données
    await upstashRedis.set(
      `questionnaire:${session.user.id}`,
      JSON.stringify(data),
      { ex: 3600 }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Queue Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}