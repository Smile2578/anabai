// lib/repositories/place-repository.ts
import { FilterQuery } from 'mongoose';
import Place, { PlaceDocument } from '@/models/place.model';
import { Category, Status } from '@/types/common';
import { Place as PlaceType } from '@/types/places/main';

interface PlaceStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  withImages: number;
  withoutImages: number;
  totalRatings: number;
  averageRating: number;
  byCategory: Record<string, number>;
  byPrefecture: Record<string, number>;
}

interface FindOptions {
  filter?: FilterQuery<PlaceDocument>;  // Ajout d'un filtre générique
  category?: Category;
  categories?: Category[];  // Support des catégories multiples
  status?: Status;
  isActive?: boolean;
  search?: string;
  isGem?: boolean;
  near?: {
    coordinates: [number, number];
    maxDistance?: number;
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
        filter = {},
        category,
        categories,
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
      const query: FilterQuery<PlaceDocument> = {
        isActive,
        ...filter
      };

      // Gestion des catégories
      if (categories?.length) {
        query.category = { $in: categories };
      } else if (category) {
        query.category = category;
      }

      if (status) {
        query['metadata.status'] = status;
      }

      if (isGem !== undefined) {
        query.isGem = isGem;
      }

      // Recherche textuelle améliorée
      if (search) {
        query.$or = [
          { 'name.fr': { $regex: search, $options: 'i' } },
          { 'name.ja': { $regex: search, $options: 'i' } },
          { 'description.fr': { $regex: search, $options: 'i' } }
        ];
      }

      if (near) {
        query['location.point'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: near.coordinates
            },
            $maxDistance: near.maxDistance || 5000
          }
        };
      }

      // Exécuter la requête
      const skip = (page - 1) * limit;
      const [results, total] = await Promise.all([
        Place.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Place.countDocuments(query)
      ]);
      return {
        places: results.map(p => this.documentToPlace(p as unknown as PlaceDocument)),
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

  async getStats(): Promise<PlaceStats> {
    try {
      const [
        total,
        statusCounts,
        imageCounts,
        categoryStats,
        prefectureStats,
        ratingStats
      ] = await Promise.all([
        Place.countDocuments({ isActive: true }),
        Place.aggregate([
          { $match: { isActive: true } },
          { $group: { 
            _id: '$metadata.status',
            count: { $sum: 1 }
          }}
        ]),
        Place.aggregate([
          { $match: { isActive: true } },
          { $group: {
            _id: null,
            withImages: { 
              $sum: { $cond: [{ $gt: [{ $size: '$images' }, 0] }, 1, 0] }
            },
            total: { $sum: 1 }
          }}
        ]),
        Place.aggregate([
          { $match: { isActive: true } },
          { $group: {
            _id: '$category',
            count: { $sum: 1 }
          }}
        ]),
        Place.aggregate([
          { $match: { isActive: true } },
          { $group: {
            _id: '$location.address.prefecture',
            count: { $sum: 1 }
          }}
        ]),
        Place.aggregate([
          { $match: { 
            isActive: true,
            'metadata.rating': { $exists: true }
          }},
          { $group: {
            _id: null,
            totalRatings: { $sum: '$metadata.ratingCount' },
            averageRating: { $avg: '$metadata.rating' }
          }}
        ])
      ]);

      const statusMap = statusCounts.reduce((acc, {_id, count}) => {
        acc[_id] = count;
        return acc;
      }, {} as Record<string, number>);

      const imageStats = imageCounts[0] || { withImages: 0, total };
      const ratingData = ratingStats[0] || { totalRatings: 0, averageRating: 0 };

      const categoryMap = categoryStats.reduce((acc, {_id, count}) => {
        if (_id) acc[_id] = count;
        return acc;
      }, {} as Record<string, number>);

      const prefectureMap = prefectureStats.reduce((acc, {_id, count}) => {
        if (_id) acc[_id] = count;
        return acc;
      }, {} as Record<string, number>);

      return {
        total,
        published: statusMap['publié'] || 0,
        draft: statusMap['brouillon'] || 0,
        archived: statusMap['archivé'] || 0,
        withImages: imageStats.withImages,
        withoutImages: total - imageStats.withImages,
        totalRatings: ratingData.totalRatings,
        averageRating: ratingData.averageRating,
        byCategory: categoryMap,
        byPrefecture: prefectureMap
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        withImages: 0,
        withoutImages: 0,
        totalRatings: 0,
        averageRating: 0,
        byCategory: {},
        byPrefecture: {}
      };
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

  private documentToPlace(doc: PlaceDocument | Record<string, unknown>): PlaceType {
    // Si le document est déjà un objet plat (from lean())
    const place = 'toObject' in doc && typeof doc.toObject === 'function' ? doc.toObject() : doc;
    
    return {
      ...place,
      _id: place._id.toString(),
      createdAt: new Date(place.createdAt),
      updatedAt: new Date(place.updatedAt)
    };
  }
}

// Export singleton instance
export const placeRepository = new PlaceRepository();