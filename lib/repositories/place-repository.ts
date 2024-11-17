// lib/repositories/place-repository.ts
import { Collection, Db, Filter, ObjectId } from 'mongodb';
import { PlaceDocument, Place } from '@/types/place';
import { FilterQuery } from 'mongoose';

type CreatePlaceInput = Omit<Place, '_id' | 'createdAt' | 'updatedAt'>;
type PlaceDocumentInput = Omit<PlaceDocument, '_id' | 'createdAt' | 'updatedAt'>;

export class PlaceRepository {
    private collection: Collection<PlaceDocument>;
  
    constructor(db: Db) {
      this.collection = db.collection<PlaceDocument>('places');
    }
  
    private validateCoordinates(coordinates: number[]): boolean {
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
      }
  
      const [longitude, latitude] = coordinates;
  
      // Validation des plages de coordonnées
      return (
        typeof longitude === 'number' &&
        typeof latitude === 'number' &&
        longitude >= -180 &&
        longitude <= 180 &&
        latitude >= -90 &&
        latitude <= 90
      );
    }
  
  
    async create(place: CreatePlaceInput): Promise<PlaceDocument | null> {
        try {
          console.log('Tentative de création du lieu:', place.name?.fr);
    
          if (!place.name?.fr || !place.location?.address?.fr) {
            console.error('Données obligatoires manquantes:', {
              name: place.name,
              address: place.location?.address
            });
            return null;
          }
    
          // Validation des coordonnées
          if (!this.validateCoordinates(place.location.coordinates)) {
            console.error('Coordonnées invalides:', place.location.coordinates);
            throw new Error('Format de coordonnées invalide');
          }
    
          const placeDoc: PlaceDocumentInput = {
            ...place,
            location: {
              ...place.location,
              type: 'Point',
              coordinates: [
                place.location.coordinates[0], // longitude
                place.location.coordinates[1]  // latitude
              ]
            },
            metadata: {
              ...place.metadata,
              lastEnriched: place.metadata.lastEnriched ? new Date(place.metadata.lastEnriched) : new Date(),
              lastVerified: place.metadata.lastVerified ? new Date(place.metadata.lastVerified) : undefined,
              relatedPlaces: place.metadata.relatedPlaces?.map(related => ({
                ...related,
                placeId: new ObjectId(related.placeId)
              }))
            }
          };
    
          const result = await this.collection.insertOne(placeDoc as PlaceDocument);
          
          if (result.insertedId) {
            console.log('Lieu créé avec succès:', {
              id: result.insertedId,
              name: place.name.fr
            });
            
            return {
              ...placeDoc,
              _id: result.insertedId,
              createdAt: new Date(),
              updatedAt: new Date()
            } as PlaceDocument;
          }
          
          console.error('Échec de la création du lieu:', place.name.fr);
          return null;
    
        } catch (error) {
          console.error('Erreur lors de la création du lieu:', error);
          throw error;
        }
      }

  async findById(id: string): Promise<PlaceDocument | null> {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error('Error in findById:', error);
      return null;
    }
  }

  async findByPlaceId(placeId: string): Promise<PlaceDocument | null> {
    try {
      return await this.collection.findOne({ 'metadata.placeId': placeId });
    } catch (error) {
      console.error('Error in findByPlaceId:', error);
      return null;
    }
  }

  async update(id: string, place: Partial<PlaceDocumentInput>): Promise<PlaceDocument | null> {
    try {
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...place,
            updatedAt: new Date(),
            metadata: place.metadata ? {
              ...place.metadata,
              lastEnriched: place.metadata.lastEnriched ? new Date(place.metadata.lastEnriched) : undefined,
              lastVerified: place.metadata.lastVerified ? new Date(place.metadata.lastVerified) : undefined
            } : undefined
          }
        },
        { returnDocument: 'after' }
      );
      
      return result || null;
    } catch (error) {
      console.error('Error in update:', error);
      return null;
    }
  }

  async findAll(query: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ places: PlaceDocument[]; total: number }> {
    const { search, category, status, page = 1, limit = 10 } = query;
    
    const filter: FilterQuery<PlaceDocument> = { isActive: true };
    
    if (category) filter.category = category;
    if (status) filter['metadata.status'] = status;
    if (search) {
      filter.$or = [
        { 'name.fr': { $regex: search, $options: 'i' } },
        { 'name.ja': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [places, total] = await Promise.all([
      this.collection
        .find(filter as Filter<PlaceDocument>)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter as Filter<PlaceDocument>)
    ]);

    return { places, total };
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.error('Error in delete:', error);
      return false;
    }
  }

  async softDelete(id: string): Promise<PlaceDocument | null> {
    return this.update(id, { 
      isActive: false,
      metadata: {
        source: 'Google Maps',
        status: 'archivé'
      }
    });
  }

  async findDuplicates(placeId: string): Promise<PlaceDocument[]> {
    const place = await this.findByPlaceId(placeId);
    if (!place) return [];

    return this.collection.find({
      _id: { $ne: place._id },
      $or: [
        { 'metadata.placeId': placeId },
        {
          'location.coordinates': place.location.coordinates,
          'name.ja': place.name.ja
        }
      ]
    }).toArray();
  }

  async bulkCreate(places: CreatePlaceInput[]): Promise<{
    success: PlaceDocument[];
    errors: Array<{ place: CreatePlaceInput; error: string }>;
  }> {
    const results = {
      success: [] as PlaceDocument[],
      errors: [] as Array<{ place: CreatePlaceInput; error: string }>
    };

    for (const place of places) {
      try {
        const created = await this.create(place);
        if (created) {
          results.success.push(created);
        } else {
          throw new Error('Failed to create place');
        }
      } catch (error) {
        results.errors.push({
          place,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async bulkUpdate(updates: Array<{
    id: string;
    place: Partial<PlaceDocumentInput>;
  }>): Promise<{
    success: PlaceDocument[];
    errors: Array<{ id: string; error: string }>;
  }> {
    const results = {
      success: [] as PlaceDocument[],
      errors: [] as Array<{ id: string; error: string }>
    };

    for (const { id, place } of updates) {
      try {
        const updated = await this.update(id, place);
        if (updated) {
          results.success.push(updated);
        } else {
          throw new Error('Place not found');
        }
      } catch (error) {
        results.errors.push({
          id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async getStats() {
    try {
      const [
        total,
        published,
        draft,
        archived
      ] = await Promise.all([
        this.collection.countDocuments({ isActive: true }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'publié' }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'brouillon' }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'archivé' })
      ]);
  
      return {
        total,
        published,
        draft,
        archived
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0
      };
    }
  }
}