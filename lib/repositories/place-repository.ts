import { Collection, Db, Filter } from 'mongodb';
import { Place } from '@/types/places/main';
import mongoose from 'mongoose';

type CreatePlaceInput = Omit<Place, '_id' | 'createdAt' | 'updatedAt'>;

export class PlaceRepository {
  collection: Collection<Place>;

  constructor(db: Db) {
    this.collection = db.collection<Place>('places');
  }

  async findAll(query: {
    search?: string;
    category?: string;
    status?: string;
    page: number;
    limit: number;
  }): Promise<{ places: Place[]; total: number }> {
    const filter: Filter<Place> = {};

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

  async create(place: CreatePlaceInput): Promise<Place | null> {
    try {
      console.log('Tentative de création du lieu:', place.name?.fr);
      
      // Validation détaillée
      const requiredFields = {
        name: place.name?.fr && place.name?.ja,
        location: place.location?.point?.coordinates && place.location?.address?.full,
        category: place.category,
        metadata: place.metadata?.source
      };
  
      console.log('Validation des champs requis:', requiredFields);
  
      const missingFields = Object.entries(requiredFields)
        .filter(([, value]) => !value)
        .map(([field]) => field);
  
      if (missingFields.length > 0) {
        console.error('Champs requis manquants:', missingFields);
        throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
      }
  
      // Création du document
      const placeDoc: Place = {
        ...place,
        location: {
          ...place.location,
          point: {
            type: 'Point',
            coordinates: {
              lng: place.location.point.coordinates.lng,
              lat: place.location.point.coordinates.lat
            }
          }
        },
        metadata: {
          ...place.metadata,
          status: place.metadata.status || 'brouillon',
          lastEnriched: new Date()
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: place.metadata.placeId || new mongoose.Types.ObjectId().toString()
      };
  
      console.log('Document à sauvegarder:', JSON.stringify(placeDoc, null, 2));
  
      const result = await this.collection.insertOne(placeDoc);
      console.log('Résultat de la sauvegarde:', result);
  
      return result.insertedId ? { ...placeDoc, _id: result.insertedId.toString() } : null;
    } catch (error) {
      console.error('Erreur détaillée lors de la création:', error);
      throw new Error(`Échec de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  validateCoordinates(coordinates: [number, number]): boolean {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return false;
    }

    const [longitude, latitude] = coordinates;

    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      return false;
    }

    if (longitude < 122 || longitude > 154 || latitude < 20 || latitude > 46) {
      return false;
    }

    return true;
  }

  async findByLocation(coordinates: [number, number], radiusInKm: number): Promise<Place[]> {
    try {
      return await this.collection.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusInKm * 1000
          }
        },
        isActive: true
      }).toArray();
    } catch (error) {
      console.error('Erreur dans findByLocation:', error);
      return [];
    }
  }

  async findByCategory(category: Place['category'], options: {
    limit?: number;
    skip?: number;
    sort?: { [key: string]: 1 | -1 };
  } = {}): Promise<Place[]> {
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
      console.error('Erreur dans findByCategory:', error);
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
  }): Promise<{ places: Place[]; total: number }> {
    const filter: Filter<Place> = { isActive: true };

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

  async findByPlaceId(placeId: string): Promise<Place | null> {
    try {
      const place = await this.collection.findOne({
        'metadata.placeId': placeId,
        isActive: true
      });
      return place;
    } catch (error) {
      console.error('Erreur dans findByPlaceId:', error);
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