import { Place } from '@/types/places/main';
import PlaceModel from '@/models/place.model';
import connectDB from '@/lib/db/connection';
import { Types } from 'mongoose';

export class PlaceService {
  async getPlace(id: string): Promise<Place | null> {
    try {
      await connectDB();
      const place = await PlaceModel.findById(new Types.ObjectId(id)).lean();

      if (!place) {
        return null;
      }

      const placeWithCorrectCoords = {
        ...place,
        location: {
          ...place.location,
          point: {
            ...place.location.point,
            coordinates: [place.location.point.coordinates[0], place.location.point.coordinates[1]] as [number, number]
          }
        }
      };

      return placeWithCorrectCoords as Place;
    } catch (error) {
      console.error('Erreur lors de la récupération du lieu:', error);
      throw error;
    }
  }
} 