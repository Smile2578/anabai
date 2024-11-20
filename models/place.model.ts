// models/place.model.ts
import mongoose, { Schema, Document, Model } from 'mongoose';
import type { Place } from '@/types/places/main';

export interface PlaceDocument extends Omit<Place, '_id'>, Document {
  createdAt: Date;
  updatedAt: Date;
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
          required: true  // Ensuring formatted address is required
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
        url: { type: String, required: true },
        source: { type: String, required: true },
        isCover: { type: Boolean, required: true },
        caption: LocalizedStringSchema,
        name: {
          type: String,
          maxlength: 10
        }
      }],
      validate: {
        validator: function(v: { url: string; source: string; isCover: boolean; caption?: string; name?: string }[]) {
          return v.length > 0;  
        },
        message: 'Au moins une image est requise'
      }
    },
    
    // Informations pratiques
    openingHours: {
      required: false,  
      type: new Schema({
        periods: [{
          day: Number,
          open: String,
          close: String,
        }],
        weekdayTexts: new Schema({  
          fr: String, 
          ja: String,
          en: String
        }, { _id: false }),  
        holidayDates: [Date]
      }, { _id: false })  
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
      },
      tags: [String],
      businessStatus: String,
    },
    
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
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