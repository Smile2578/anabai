// app/api/places/seed/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Place from '@/models/place.model';

export async function POST() {
  try {
    await connectDB();

    // Données de test
    const testPlaces = [
      {
        name: {
          ja: 'センソウジ',
          en: 'Sensoji Temple',
        },
        location: {
          type: 'Point',
          coordinates: [139.7966, 35.7147],
          address: {
            ja: '東京都台東区浅草2-3-1',
            en: '2-3-1 Asakusa, Taito City, Tokyo',
          },
        },
        category: 'TEMPLE',
        subcategories: ['HISTORICAL', 'CULTURAL'],
        description: {
          en: 'Ancient Buddhist temple in Asakusa, Tokyo',
          ja: '浅草寺は、東京都台東区浅草にある仏教寺院',
        },
        images: ['/images/test/sensoji.jpg'],
        openingHours: {
          monday: [{ open: '06:00', close: '17:00' }],
          tuesday: [{ open: '06:00', close: '17:00' }],
          wednesday: [{ open: '06:00', close: '17:00' }],
          thursday: [{ open: '06:00', close: '17:00' }],
          friday: [{ open: '06:00', close: '17:00' }],
          saturday: [{ open: '06:00', close: '17:00' }],
          sunday: [{ open: '06:00', close: '17:00' }],
        },
        metadata: {
          source: 'test',
          lastUpdated: new Date(),
        },
        isActive: true,
      },
      // Ajoutez d'autres lieux de test ici
    ];

    // Supprimer les données de test existantes
    await Place.deleteMany({ 'metadata.source': 'test' });

    // Insérer les nouvelles données
    const places = await Place.insertMany(testPlaces);

    return NextResponse.json({
      message: 'Test data created successfully',
      count: places.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}