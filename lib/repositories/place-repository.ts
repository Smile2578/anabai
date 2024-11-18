// lib/repositories/place-repository.ts
import { Collection, Db, Filter, ObjectId, Document, WithId } from 'mongodb';
import { PlaceDocument, Place } from '@/types/place';
import { FilterQuery } from 'mongoose';

type CreatePlaceInput = Omit<Place, '_id' | 'createdAt' | 'updatedAt'>;
type PlaceDocumentInput = Omit<PlaceDocument, '_id' | 'createdAt' | 'updatedAt'>;

export class PlaceRepository {
  bulkUpdate(places: any[]) {
    throw new Error('Method not implemented.');
  }
  collection: Collection<PlaceDocument>;

  constructor(db: Db) {
    this.collection = db.collection<PlaceDocument>('places');
  }

  async findAll(query: {
    search?: string;
    category?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ places: PlaceDocument[]; total: number }> {
    const filter: Filter<PlaceDocument> = {};
  
    if (query.search) {
      filter.$or = [
        { 'name.fr': { $regex: query.search, $options: 'i' } },
        { 'name.ja': { $regex: query.search, $options: 'i' } },
        { 'description.fr': { $regex: query.search, $options: 'i' } },
        { 'description.ja': { $regex: query.search, $options: 'i' } }
      ];
    }
  
    if (query.category) {
      filter.category = query.category as "Restaurant" | "Hôtel" | "Visite" | "Shopping" | "Café & Bar";
    }
  
    if (query.status) {
      filter['metadata.status'] = query.status;
    }
  
    const skip = (query.page - 1) * query.limit;
  
    const [places, total] = await Promise.all([
      this.collection
        .find(filter)
        .skip(skip)
        .limit(query.limit)
        .toArray(),
      this.collection.countDocuments(filter)
    ]);
  
    return { places, total };
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
        throw new Error('Coordonnées invalides');
      }

      // Vérification de l'existence d'un lieu similaire
      const existingPlace = await this.collection.findOne({
        'metadata.placeId': place.metadata.placeId || ''
      });
      if (existingPlace) {
        console.warn('Un lieu similaire existe déjà:', existingPlace._id);
        return null;
      }

      const placeDoc: PlaceDocumentInput = {
        ...place,
        location: {
          ...place.location,
          type: 'Point',
          coordinates: [
            place.location.coordinates[0],
            place.location.coordinates[1]
          ]
        },
        // Garantir les champs requis
        category: place.category,
        subcategories: place.subcategories || [],
        description: {
          fr: place.description?.fr || '',
          ja: place.description?.ja
        },
        images: place.images || [],
        metadata: {
          ...place.metadata,
          status: place.metadata.status || 'brouillon',
        }
      };

      const result = await this.collection.insertOne(placeDoc as PlaceDocument);
      
      if (result.insertedId) {
        return {
          ...placeDoc,
          _id: result.insertedId,
          createdAt: new Date(),
          updatedAt: new Date()
        } as PlaceDocument;
      }
      
      return null;

    } catch (error) {
      console.error('Erreur lors de la création du lieu:', error);
      throw error;
    }
  }

  validateCoordinates(coordinates: [number, number]): boolean {
    // Validation basique des coordonnées
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }

    const [longitude, latitude] = coordinates;

    // Vérification que les coordonnées sont des nombres
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return false;
    }

    // Vérification des plages valides pour le Japon
    // Longitude: environ 122° à 154° E
    // Latitude: environ 20° à 46° N
    if (longitude < 122 || longitude > 154 || latitude < 20 || latitude > 46) {
      return false;
    }

    return true;
  }

  async findByLocation(coordinates: [number, number], radiusInKm: number): Promise<PlaceDocument[]> {
    try {
      return await this.collection.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusInKm * 1000 // Conversion en mètres
          }
        },
        isActive: true
      }).toArray();
    } catch (error) {
      console.error('Error in findByLocation:', error);
      return [];
    }
  }

  async findByCategory(category: Place['category'], options: {
    limit?: number;
    skip?: number;
    sort?: { [key: string]: 1 | -1 };
  } = {}): Promise<PlaceDocument[]> {
    try {
      return await this.collection.find({
        category,
        isActive: true
      })
      .skip(options.skip || 0)
      .limit(options.limit || 20)
      .sort(options.sort || { createdAt: -1 })
      .toArray();
    } catch (error) {
      console.error('Error in findByCategory:', error);
      return [];
    }
  }

  async search(query: {
    search?: string;
    category?: Place['category'][];
    prefecture?: string;
    city?: string;
    status?: ('brouillon' | 'publié' | 'archivé')[];
    priceRange?: number[];
    hasImages?: boolean;
    page?: number;
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<{ places: PlaceDocument[]; total: number }> {
    const filter: Filter<PlaceDocument> = { isActive: true };
    
    if (query.search) {
      filter.$or = [
        { 'name.fr': { $regex: query.search, $options: 'i' } },
        { 'name.ja': { $regex: query.search, $options: 'i' } },
        { 'description.fr': { $regex: query.search, $options: 'i' } },
        { 'description.ja': { $regex: query.search, $options: 'i' } }
      ];
    }
    
    if (query.category?.length) {
      filter.category = { $in: query.category };
    }
    
    if (query.prefecture) {
      filter['location.address.prefecture'] = query.prefecture;
    }
    
    if (query.city) {
      filter['location.address.city'] = query.city;
    }
    
    if (query.status?.length) {
      filter['metadata.status'] = { $in: query.status };
    }
    
    if (query.priceRange?.length) {
      filter['pricing.priceRange'] = { $in: query.priceRange };
    }
    
    if (query.hasImages) {
      filter.images = { $exists: true, $ne: [] };
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 10);
    
    const [places, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort(query.sort || { createdAt: -1 })
        .skip(skip)
        .limit(query.limit || 10)
        .toArray(),
      this.collection.countDocuments(filter)
    ]);

    return { places, total };
  }

  async findByPlaceId(placeId: string): Promise<PlaceDocument | null> {
    try {
      const place = await this.collection.findOne({
        'metadata.placeId': placeId,
        isActive: true
      });
      return place;
    } catch (error) {
      console.error('Error in findByPlaceId:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      const [
        total,
        published,
        draft,
        archived,
        byCategory,
        byPrefecture,
        withImages,
        withoutImages
      ] = await Promise.all([
        this.collection.countDocuments({ isActive: true }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'publié' }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'brouillon' }),
        this.collection.countDocuments({ isActive: true, 'metadata.status': 'archivé' }),
        this.collection.aggregate<{ _id: string, count: number }>([
          { $match: { isActive: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ]).toArray(),
        this.collection.aggregate<{ _id: string, count: number }>([
          { $match: { isActive: true } },
          { $group: { _id: '$location.address.prefecture', count: { $sum: 1 } } }
        ]).toArray(),
        this.collection.countDocuments({ 
          isActive: true,
          images: { $exists: true, $not: { $size: 0 } }
        }),
        this.collection.countDocuments({ 
          isActive: true,
          $or: [
            { images: { $exists: false } },
            { images: { $size: 0 } }
          ]
        })
      ]);
  
      return {
        total,
        published,
        draft,
        archived,
        byCategory: Object.fromEntries(byCategory.map(c => [c._id, c.count])),
        byPrefecture: Object.fromEntries(byPrefecture.map(p => [p._id, p.count])),
        images: {
          with: withImages,
          without: withoutImages
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return null;
    }
  }
}