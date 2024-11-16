// app/api/places/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Place from '@/models/place.model';

export async function GET() {
  try {
    await connectDB();
    const places = await Place.find({ isActive: true }).limit(10);
    return NextResponse.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}