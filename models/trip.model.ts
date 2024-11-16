// models/trip.model.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  userId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  days: Array<{
    date: Date;
    places: Array<{
      placeId: Schema.Types.ObjectId;
      startTime: string;
      duration: number;
      notes?: string;
    }>;
    transport: Array<{
      from: Schema.Types.ObjectId;
      to: Schema.Types.ObjectId;
      mode: 'TRAIN' | 'SUBWAY' | 'BUS' | 'WALK';
      duration: number;
    }>;
  }>;
  preferences: {
    pace: 'RELAXED' | 'MODERATE' | 'INTENSIVE';
    interests: string[];
    transportPreferences: {
      preferredModes: string[];
      maxWalkingTime?: number;
    };
    budget?: {
      currency: string;
      dailyLimit?: number;
      totalBudget?: number;
    };
  };
  status: 'DRAFT' | 'PLANNED' | 'ACTIVE' | 'COMPLETED';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    days: [{
      date: {
        type: Date,
        required: true,
      },
      places: [{
        placeId: {
          type: Schema.Types.ObjectId,
          ref: 'Place',
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
        notes: String,
      }],
      transport: [{
        from: {
          type: Schema.Types.ObjectId,
          ref: 'Place',
          required: true,
        },
        to: {
          type: Schema.Types.ObjectId,
          ref: 'Place',
          required: true,
        },
        mode: {
          type: String,
          enum: ['TRAIN', 'SUBWAY', 'BUS', 'WALK'],
          required: true,
        },
        duration: {
          type: Number,
          required: true,
        },
      }],
    }],
    preferences: {
      pace: {
        type: String,
        enum: ['RELAXED', 'MODERATE', 'INTENSIVE'],
        required: true,
      },
      interests: [String],
      transportPreferences: {
        preferredModes: [String],
        maxWalkingTime: Number,
      },
      budget: {
        currency: String,
        dailyLimit: Number,
        totalBudget: Number,
      },
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PLANNED', 'ACTIVE', 'COMPLETED'],
      default: 'DRAFT',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
tripSchema.index({ userId: 1, startDate: 1 });
tripSchema.index({ isPublic: 1, startDate: -1 });

export default mongoose.models.Trip || mongoose.model<ITrip>('Trip', tripSchema);