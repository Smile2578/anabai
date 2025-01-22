// app/api/questionnaire/queue/route.ts
import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();

    // Sauvegarder les données dans la table questionnaires_queue
    const { error } = await supabase
      .from('questionnaires_queue')
      .insert([{
        user_id: user.id,
        data,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
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