// models/place.model.ts

import mongoose, { Schema} from 'mongoose';
import { PlaceDocument } from '@/types/place';

const placeSchema = new Schema<PlaceDocument>(
  {
    name: {
      ja: { type: String, required: true },
      en: { type: String, required: true },
      fr: { type: String },
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
        ja: { type: String, required: true },
        en: { type: String, required: true },
      },
      accessInfo: {
        nearestStation: String,
        walkingTime: Number,
      },
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategories: [{
      type: String,
      index: true,
    }],
    description: {
      ja: String,
      en: { type: String, required: true },
      fr: String,
    },
    images: [String],
    openingHours: {
      type: Map,
      of: [{
        open: String,
        close: String,
      }],
    },
    pricing: {
      priceRange: {
        type: Number,
        enum: [1, 2, 3, 4],
      },
      currency: String,
      details: String,
    },
    contact: {
      phone: String,
      website: String,
      socialMedia: {
        type: Map,
        of: String,
      },
    },
    metadata: {
      source: { type: String, required: true },
      lastUpdated: { type: Date, default: Date.now },
      verifiedBy: String,
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

// Create indexes
placeSchema.index({ 'location.coordinates': '2dsphere' });
placeSchema.index({ 'name.en': 'text', 'name.ja': 'text', 'description.en': 'text', 'description.ja': 'text' });

// Export the model and return your IPlace interface
export default mongoose.models.Place || mongoose.model<PlaceDocument>('Place', placeSchema);