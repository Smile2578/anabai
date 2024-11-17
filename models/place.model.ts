// models/place.model.ts
import mongoose, { Schema } from 'mongoose';
import { PlaceDocument } from '@/types/place';

const placeSchema = new Schema<PlaceDocument>(
  {
    originalData: {
      title: String,
      note: String,
      url: String,
      comment: String,
    },
    
    name: {
      ja: String,
      fr: { type: String, required: true },
    },
    
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        ja: String,
        fr: { type: String, required: true },
        prefecture: String,
        city: String,
        postalCode: String,
      },
      accessInfo: {
        nearestStation: String,
        walkingTime: Number,
        transportOptions: [String],
      },
    },
    
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
    
    description: {
      ja: String,
      fr: { type: String, required: true },
    },
    
    images: [{
      url: String,
      source: String,
      isCover: Boolean,
      caption: {
        ja: String,
        fr: String,
      },
    }],
    
    openingHours: {
      periods: [{
        day: Number,
        open: String,
        close: String,
      }],
      weekdayText: {
        ja: [String],
        fr: { type: [String], required: true },
      },
      holidayDates: [Date],
    },
    
    pricing: {
      priceRange: {
        type: Number,
        enum: [1, 2, 3, 4],
      },
      currency: {
        type: String,
        default: 'EUR',
      },
      details: {
        ja: String,
        fr: String,
      },
      budget: {
        min: Number,
        max: Number,
      },
    },
    
    contact: {
      phone: String,
      website: String,
      bookingUrl: String,
      socialMedia: {
        type: Map,
        of: String,
      },
    },
    
    ratings: {
      googleRating: Number,
      googleReviewsCount: Number,
      internalRating: Number,
      internalReviewsCount: Number,
    },
    
    metadata: {
      source: { type: String, required: true },
      placeId: { type: String, sparse: true }, // sparse index permet les doublons null/undefined
      lastEnriched: Date,
      lastVerified: Date,
      verifiedBy: String,
      status: {
        type: String,
        enum: ['brouillon', 'publié', 'archivé'],
        default: 'brouillon',
      },
      tags: [String],
      relatedPlaces: [{
        placeId: { type: Schema.Types.ObjectId, ref: 'Place' },
        relationType: {
          type: String,
          enum: ['parent', 'enfant', 'proche']
        },
      }],
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
placeSchema.index({ 'location.coordinates': '2dsphere' });
placeSchema.index({ 
  'name.ja': 'text',
  'name.fr': 'text',
  'description.ja': 'text',
  'description.fr': 'text'
});

// Index unique sur placeId (s'il existe)
placeSchema.index(
  { 'metadata.placeId': 1 }, 
  { unique: true, sparse: true }
);

export default mongoose.models.Place || mongoose.model<PlaceDocument>('Place', placeSchema);