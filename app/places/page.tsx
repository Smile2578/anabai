// app/places/page.tsx
import React from 'react';
import PlaceGrid from '@/components/places/PlaceGrid';
import connectDB from '@/lib/db/connection';
import Place from '@/models/place.model';
import { Place as IPlace, PlaceBase } from '@/types/place';
import { Types } from 'mongoose';

interface RawPlace extends PlaceBase {
  _id: Types.ObjectId;
  __v: number;
}

export default async function PlacesPage() {
  await connectDB();
  
  const rawPlaces = await Place.find().limit(12).lean() as RawPlace[];
  
  const places = rawPlaces.map(doc => ({
    ...doc,
    _id: doc._id.toString(),
    createdAt: new Date(doc.createdAt).toISOString(),
    updatedAt: new Date(doc.updatedAt).toISOString(),
    metadata: {
      ...doc.metadata,
      lastUpdated: new Date(doc.metadata.lastUpdated).toISOString()
    },
    // On s'assure que openingHours est un objet simple
    openingHours: doc.openingHours ? JSON.parse(JSON.stringify(doc.openingHours)) : {}
  })) as IPlace[];

  // Log pour debug
  console.log('First place after transformation:', places[0]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Discover Places</h1>
      <PlaceGrid 
        places={places}
        variant="detailed"
      />
    </div>
  );
}