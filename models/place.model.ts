// models/place.model.ts
import mongoose, { Schema, Document } from 'mongoose';
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
          required: true,
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
      address: {
        full: LocalizedStringRequiredSchema,
        prefecture: String,
        city: String,
        postalCode: String,
        formatted: LocalizedStringRequiredSchema,
      },
      access: {
        nearestStation: String,
        walkingTime: Number,
        transportOptions: [String],
      },
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
    
    // Description et médias
    description: LocalizedStringSchema,
    images: [{
      url: String,
      source: String,
      isCover: Boolean,
      caption: LocalizedStringSchema,
      name: {
        type: String,
        maxlength: 10,
      },
    }],
    
    // Informations pratiques
    openingHours: {
      periods: [{
        day: Number,
        open: String,
        close: String,
      }],
      weekdayTexts: LocalizedStringRequiredSchema,
      holidayDates: [Date],
    },
    
    pricing: {
      level: {
        type: Number,
        enum: [1, 2, 3, 4],
      },
      currency: {
        type: String,
        default: 'JPY',
      },
      range: {
        min: Number,
        max: Number,
      },
      details: LocalizedStringSchema,
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
        default: 'brouillon',
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

// Export
const Place = mongoose.models.Place || mongoose.model<PlaceDocument>('Place', placeSchema);
export default Place;