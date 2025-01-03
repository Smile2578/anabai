// app/api/questionnaire/queue/route.ts
import { NextResponse } from 'next/server';
import { auth } from "@/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const supabase = await createClient();

    // Sauvegarder les données dans la table questionnaires_queue
    const { error } = await supabase
      .from('questionnaires_queue')
      .insert([{
        user_id: session.user.id,
        data,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }]);

    if (error) {
      console.error('Queue Error:', error);
      return NextResponse.json({ error: "Erreur lors de l'ajout à la file d'attente" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Queue Error:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}