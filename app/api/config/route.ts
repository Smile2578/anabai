// app/api/config/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');

  if (!service) {
    return NextResponse.json({ error: 'Service non spécifié' }, { status: 400 });
  }

  switch (service) {
    case 'google-maps':
      return NextResponse.json({
        apiKey: process.env.GOOGLE_MAPS_API_KEY
      });
    case 'tinymce':
      return NextResponse.json({
        apiKey: process.env.TINYMCE_API_KEY
      });
    default:
      return NextResponse.json({ error: 'Service non reconnu' }, { status: 400 });
  }
}