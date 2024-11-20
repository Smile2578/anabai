// lib/repositories/place-repository.ts
import { FilterQuery, PipelineStage } from 'mongoose';
import Place, { PlaceDocument } from '@/models/place.model';
import { Category, Status } from '@/types/common';
import { Place as PlaceType } from '@/types/places/main';

interface FindOptions {
  category?: Category;
  status?: Status;
  isActive?: boolean;
  search?: string;
  isGem?: boolean;
  near?: {
    coordinates: [number, number];
    maxDistance?: number; // en mètres
  };
  sort?: {
    [key: string]: 1 | -1;
  };
  page?: number;
  limit?: number;
}

interface FindResult {
  places: PlaceType[];
  total: number;
  page: number;
  totalPages: number;
}

export class PlaceRepository {
  async create(place: Omit<PlaceType, '_id' | 'createdAt' | 'updatedAt'>): Promise<PlaceType | null> {
    try {
      const newPlace = new Place(place);
      const saved = await newPlace.save();
      return this.documentToPlace(saved);
    } catch (error) {
      console.error('Error creating place:', error);
      return null;
    }
  }

  async update(id: string, updates: Partial<PlaceType>): Promise<PlaceType | null> {
    try {
      const updated = await Place.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      return updated ? this.documentToPlace(updated) : null;
    } catch (error) {
      console.error('Error updating place:', error);
      return null;
    }
  }

  async updateStatus(id: string, status: Status): Promise<boolean> {
    try {
      const result = await Place.updateOne(
        { _id: id },
        {
          $set: {
            'metadata.status': status,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await Place.deleteOne({ _id: id });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting place:', error);
      return false;
    }
  }

  async findById(id: string): Promise<PlaceType | null> {
    try {
      const place = await Place.findById(id);
      return place ? this.documentToPlace(place) : null;
    } catch (error) {
      console.error('Error finding place by id:', error);
      return null;
    }
  }

  async findByPlaceIds(placeIds: string[]): Promise<PlaceType[]> {
    try {
      const places = await Place.find({
        'metadata.placeId': { $in: placeIds }
      });
      return places.map(p => this.documentToPlace(p));
    } catch (error) {
      console.error('Error finding places by placeIds:', error);
      return [];
    }
  }

  async find(options: FindOptions = {}): Promise<FindResult> {
    try {
      const {
        category,
        status,
        isActive = true,
        search,
        isGem,
        near,
        sort = { updatedAt: -1 },
        page = 1,
        limit = 20
      } = options;

      // Construire la requête
      const query: FilterQuery<PlaceDocument> = { isActive };

      if (category) {
        query.category = category;
      }

      if (status) {
        query['metadata.status'] = status;
      }

      if (isGem !== undefined) {
        query.isGem = isGem;
      }

      if (search) {
        query.$text = { $search: search };
      }

      if (near) {
        query['location.point'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: near.coordinates
            },
            $maxDistance: near.maxDistance || 5000 // 5km par défaut
          }
        };
      }

      // Exécuter la requête
      const skip = (page - 1) * limit;
      const [results, total] = await Promise.all([
        Place.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit),
        Place.countDocuments(query)
      ]);

      return {
        places: results.map(p => this.documentToPlace(p)),
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error finding places:', error);
      return {
        places: [],
        total: 0,
        page: 1,
        totalPages: 0
      };
    }
  }

  async findNear(
    coordinates: [number, number],
    options: {
      maxDistance?: number;
      categories?: Category[];
      limit?: number;
    } = {}
  ): Promise<PlaceType[]> {
    try {
      const {
        maxDistance = 5000, // 5km par défaut
        categories,
        limit = 20
      } = options;

      const aggregation: PipelineStage[] = [
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates
            },
            distanceField: 'distance',
            maxDistance,
            spherical: true
          }
        },
        {
          $match: {
            isActive: true,
            'metadata.status': 'publié'
          }
        }
      ];

      if (categories && categories.length > 0) {
        aggregation.push({
          $match: {
            category: { $in: categories }
          }
        });
      }

      aggregation.push({ $limit: limit });

      const places = await Place.aggregate(aggregation);
      return places.map(p => ({
        ...this.documentToPlace(p),
        distance: p.distance
      }));

    } catch (error) {
      console.error('Error finding nearby places:', error);
      return [];
    }
  }

  async search(
    query: string,
    options: {
      categories?: Category[];
      limit?: number;
    } = {}
  ): Promise<PlaceType[]> {
    try {
      const { categories, limit = 20 } = options;

      const searchQuery: FilterQuery<PlaceDocument> = {
        isActive: true,
        'metadata.status': 'publié',
        $text: { $search: query }
      };

      if (categories && categories.length > 0) {
        searchQuery.category = { $in: categories };
      }

      const places = await Place.find(searchQuery)
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);

      return places.map(p => this.documentToPlace(p));

    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  async findByIds(ids: string[]): Promise<PlaceType[]> {
    try {
      const places = await Place.find({
        _id: { $in: ids }
      });
      return places.map(p => this.documentToPlace(p));
    } catch (error) {
      console.error('Error finding places by ids:', error);
      return [];
    }
  }

  private documentToPlace(doc: PlaceDocument): PlaceType {
    const place = doc.toObject();
    return {
      ...place,
      _id: place._id.toString(),
      createdAt: place.createdAt,
      updatedAt: place.updatedAt
    };
  }
}

// Export singleton instance
export const placeRepository = new PlaceRepository();