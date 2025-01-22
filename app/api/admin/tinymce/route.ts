import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user?.user_metadata?.role || !['admin', 'editor'].includes(user.user_metadata.role)) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    return NextResponse.json({ apiKey: process.env.TINYMCE_API_KEY });
  } catch (error) {
    console.error('Error in GET /api/admin/tinymce:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
} 