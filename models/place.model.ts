// models/place.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Place } from '@/types/places/main';
import type { 
  OpeningHours, 
  PlanningInfo, 
  PracticalInfo,
  PlaceImage,
  PlaceAddress,
  AccessInfo,
  PlacePricing,
  PlaceContact,
  PlaceRating
} from '@/types/places/base';
import type { PlaceMetadata } from '@/types/places/metadata';

// Mettre à jour l'interface PlaceDocument pour inclure tous les champs
export interface PlaceDocument extends Document {
  originalData?: {
    title?: string;
    note?: string;
    url?: string;
    comment?: string;
  };
  name: {
    fr: string;
    ja?: string;
    en?: string;
  };
  _id: string;
  location: {
    point: {
      type: 'Point';
      coordinates: number[];
    };
    address: PlaceAddress;
    access?: AccessInfo;
  };
  category: string;
  subcategories: string[];
  isGem: boolean;
  description: {
    fr: string;
    ja?: string;
    en?: string;
  };
  images: PlaceImage[];
  openingHours?: OpeningHours;
  pricing?: PlacePricing;
  contact?: PlaceContact;
  rating?: PlaceRating;
  planningInfo?: PlanningInfo;
  practicalInfo?: PracticalInfo;
  metadata: PlaceMetadata;
  tags?: string[];
  businessStatus?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: mongoose.Types.ObjectId;
}

const LocalizedStringSchema = {
  fr: { type: String, required: true },
  ja: String,
  en: String,
};

const LocalizedStringRequiredSchema = {
  fr: { type: String, required: true },
  ja: String,
  en: String,
};

const placeSchema = new Schema<PlaceDocument>(
  {
    // Données d'origine
    originalData: {
      title: String,
      note: String,
      url: String,
      comment: String,
    },
    
    // Informations principales
    name: {
      type: LocalizedStringRequiredSchema,
      required: true,
    },

    _id: {
      type: String,
      required: true,
    },
    
    location: {
      point: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number], // MongoDB geospatial format
          required: true,
          validate: {
            validator: function(v: number[]) {
              return v.length === 2 && 
                     v[0] >= -180 && v[0] <= 180 && // longitude
                     v[1] >= -90 && v[1] <= 90;     // latitude
            },
            message: 'Invalid coordinates format or values'
          }
        }
      },
      address: {
        full: LocalizedStringRequiredSchema,
        prefecture: String,
        city: String,
        postalCode: String,
        formatted: {
          type: LocalizedStringRequiredSchema,
          required: true
        }
      },
      access: {
        nearestStation: String,
        walkingTime: Number,
        transportOptions: [String]
      }
    },
    
    // Catégorisation
    category: {
      type: String,
      required: true,
      enum: ['Restaurant', 'Hôtel', 'Visite', 'Shopping', 'Café & Bar'],
      index: true,
    },
    subcategories: [{
      type: String,
      index: true,
    }],
    isGem: {
      type: Boolean,
      default: false,
    },
    
    // Description et médias
    description: {
      type: LocalizedStringRequiredSchema,
      required: true
    },
    images: {
      type: [{
        url: { type: String },
        source: { type: String },
        isCover: { type: Boolean, default: false },
        caption: LocalizedStringSchema,
        name: {
          type: String,
          maxlength: 10
        }
      }],
      required: false,
      default: []
    },
    
    // Informations pratiques
    openingHours: {
      type: new Schema({
        periods: [{
          day: { type: Number, required: true },
          open: { type: String, required: true },
          close: { type: String, required: true }
        }],
        weekdayTexts: {
          type: LocalizedStringRequiredSchema,
          required: true
        },
        holidayDates: [Date],
        specialHours: [{
          date: Date,
          open: String,
          close: String,
          description: LocalizedStringSchema
        }]
      }, { _id: false }),
      required: false
    },

    pricing: {
      level: {
        type: Number,
        enum: [1, 2, 3, 4]
      },
      currency: {
        type: String,
        default: 'JPY'
      },
      range: {
        min: Number,
        max: Number
      },
      details: {
        type: LocalizedStringRequiredSchema,
        required: true 
      }
    },
    
    // Contact
    contact: {
      phone: String,
      website: String,
      bookingUrl: String,
      googleMapsUrl: String,
      instagramUrl: String,
      socialMedia: {
        type: Map,
        of: String,
      },
    },
    
    // Notes et avis
    rating: {
      google: {
        rating: Number,
        reviewCount: Number,
      },
      internal: {
        rating: Number,
        reviewCount: Number,
      },
    },

    // Informations de planification
    planningInfo: {
      type: new Schema({
        recommendedDuration: {
          min: Number,
          max: Number
        },
        peakHours: [{
          day: { type: Number, required: true },
          start: { type: String, required: true },
          end: { type: String, required: true }
        }],
        bestTiming: {
          type: String,
          enum: ['morning', 'afternoon', 'evening', 'night', 'any']
        },
        seasonality: [{
          season: {
            type: String,
            enum: ['spring', 'summer', 'autumn', 'winter'],
            required: true
          },
          recommended: { type: Boolean, required: true },
          details: { type: LocalizedStringSchema }
        }],
        tips: { type: LocalizedStringSchema },
        warnings: { type: LocalizedStringSchema }
      }, { _id: false }),
      required: false
    },

    practicalInfo: {
      type: new Schema({
        bookingRequired: Boolean,
        englishSupport: Boolean,
        paymentMethods: [String],
        delivery: Boolean,
        dineIn: Boolean,
        takeout: Boolean,
        parkingOptions: {
          freeParking: Boolean,
          paidParking: Boolean,
          streetParking: Boolean,
          valetParking: Boolean,
          parkingAvailable: Boolean
        },
        accessibilityOptions: {
          wheelchairAccessibleParking: Boolean,
          wheelchairAccessibleEntrance: Boolean,
          wheelchairAccessibleRestroom: Boolean,
          wheelchairAccessibleSeating: Boolean
        }
      }, { _id: false }),
      required: false
    },
    
    // Métadonnées
    metadata: {
      source: { type: String, required: true },
      placeId: { type: String, sparse: true },
      lastEnriched: Date,
      lastVerified: Date,
      verifiedBy: String,
      status: {
        type: String,
        enum: ['brouillon', 'publié', 'archivé'],
        default: 'publié',
        required: true,
        index: true,
      },
      tags: [String],
      businessStatus: String,
      authors: [{
        id: { type: String },
        name: { type: String },
        role: { 
          type: String,
          enum: ['admin', 'editor']
        },
        addedAt: { type: Date, default: Date.now }
      }]
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      validate: {
        validator: async function(authorId: string) {
          const User = mongoose.models.User;
          const author = await User.findById(authorId);
          return author && (author.role === 'admin' || author.role === 'editor');
        },
        message: 'L\'auteur doit avoir le rôle admin ou editor'
      }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
placeSchema.index({ 'location.point': '2dsphere' });
placeSchema.index({ 
  'name.fr': 'text',
  'name.ja': 'text', 
  'description.fr': 'text',
  'description.ja': 'text'
}, {
  weights: {
    'name.fr': 10,
    'name.ja': 10,
    'description.fr': 5,
    'description.ja': 5
  }
});

placeSchema.index(
  { 'metadata.placeId': 1 }, 
  { unique: true, sparse: true }
);

placeSchema.pre('validate', function(next) {
  if (this.openingHours) {
    if (!this.openingHours.weekdayTexts || !this.openingHours.periods || this.openingHours.periods.length === 0) {
      this.openingHours = undefined;
    }
  }
  next();
});

// Correction de l'export du modèle
let Place: Model<PlaceDocument>;

try {
  Place = mongoose.model<PlaceDocument>('Place');
} catch {
  Place = mongoose.model<PlaceDocument>('Place', placeSchema);
}

export default Place;