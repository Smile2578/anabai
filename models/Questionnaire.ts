// models/Questionnaire.ts
import { Schema, model, models, Types, CallbackError } from 'mongoose';

const questionnaireSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'processing', 'error'],
    default: 'draft',
  },
  basicInfo: {
    duration: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    groupSize: { type: Number, required: true },
  },
  travelStyle: {
    pace: {
      type: String,
      enum: ['relaxed', 'moderate', 'intensive'],
      required: true,
    },
    comfort: {
      type: String,
      enum: ['budget', 'standard', 'luxury'],
      required: true,
    },
    flexibility: { type: Number, required: true },
    culturalImmersion: { type: Number, required: true },
  },
  interests: {
    mainInterests: [{ type: String }],
    subcategories: [{ type: String }],
    mustSeeSpots: [{ type: String }],
    categories: [{ type: String }],
    specificInterests: [{ type: String }],
  },
  budget: {
    total: { type: Number, required: true },
    dailyLimit: { type: Number, required: true },
    priority: {
      type: String,
      enum: ['accommodation', 'food', 'activities'],
      required: true,
    },
  },
  constraints: {
    dietary: [{ type: String }],
    mobility: { type: Boolean, default: false },
    language: {
      type: String,
      enum: ['none', 'basic', 'intermediate', 'fluent'],
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index pour améliorer les performances des requêtes
questionnaireSchema.index({ userId: 1, createdAt: -1 });

// Middleware pour mettre à jour la date de modification
questionnaireSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Middleware pour peupler automatiquement le userName
questionnaireSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('userId')) {
    try {
      const User = models.User;
      const user = await User.findById(this.userId);
      if (user) {
        this.userName = user.name;
      }
    } catch (error) {
      next(error as CallbackError);
    }
  }
  next();
});

export default models.Questionnaire || model('Questionnaire', questionnaireSchema);