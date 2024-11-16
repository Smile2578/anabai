// app/api/test/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/connection';
import Place from '@/models/place.model';

export async function GET() {
  try {
    await connectDB();
    
    // Tenter de créer un lieu de test avec tous les champs requis
    const testPlace = new Place({
      name: {
        ja: 'テスト場所',
        en: 'Test Place',
      },
      location: {
        type: 'Point',
        coordinates: [139.7528, 35.6852],
        address: {
          ja: '東京都中央区',
          en: 'Chuo-ku, Tokyo',
        },
      },
      category: 'RESTAURANT',
      description: {
        en: 'A test place in Tokyo',
        ja: 'テスト用の場所',
      },
      metadata: {
        source: 'test',
      },
      images: [],
    });

    // Sauvegarder temporairement
    await testPlace.save();
    
    // Récupérer
    const places = await Place.find({ 'metadata.source': 'test' });
    
    // Nettoyer
    await Place.deleteMany({ 'metadata.source': 'test' });

    return NextResponse.json({
      message: 'Database connection and operations successful',
      testResults: {
        placesFound: places.length,
        operations: ['create', 'read', 'delete'],
        success: true
      }
    });
  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json(
      { 
        error: 'Database operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // S'assurer que la connexion est fermée après le test
    if (process.env.NODE_ENV === 'test') {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
    }
  }
}