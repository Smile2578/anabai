import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  console.log('🔑 [TINYMCE] API Key:', process.env.TINYMCE_API_KEY);
  try {
    const session = await auth();
    
    if (!session?.user?.role || !['admin', 'editor'].includes(session.user.role)) {
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