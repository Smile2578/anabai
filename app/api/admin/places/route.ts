// app/api/admin/places/route.ts
import { NextResponse } from 'next/server';
import Place from '@/models/place.model';

export async function GET(req: Request) {
  try {

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    const query: {
      $or?: { [key: string]: { $regex: string, $options: string } }[];
      category?: string;
      'metadata.status'?: string;
    } = {};
    if (search) {
      query.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (status) query['metadata.status'] = status;

    const [places, total] = await Promise.all([
      Place.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ updatedAt: -1 }),
      Place.countDocuments(query),
    ]);

    return NextResponse.json({
      places,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des lieux' },
      { status: 500 }
    );
  }
}
