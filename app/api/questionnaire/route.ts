import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { data: questionnaire, error } = await supabase
      .from('questionnaires')
      .select()
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ [GET /api/questionnaire] Erreur:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du questionnaire' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: questionnaire });
  } catch (error) {
    console.error('❌ [GET /api/questionnaire] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 