// models/Questionnaire.ts
import { Schema, model, models } from 'mongoose';
import { QuestionnaireStatus } from '@/types/questionnaire/questionnaire';

const questionnaireSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
    validate: {
      validator: async function(userId: string) {
        const User = models.User;
        const user = await User.findById(userId);
        return !!user;
      },
      message: 'L\'utilisateur spécifié n\'existe pas'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'completed', 'processing', 'error'] as QuestionnaireStatus[],
    default: 'draft',
  },
  basicInfo: {
    duration: { type: Number, required: true, min: 1, max: 90 },
    dateRange: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    groupSize: { type: Number, required: true, min: 1, max: 20 },
    previousVisit: { type: Boolean, required: true },
    visitCount: { type: Number },
    groupType: { 
      type: String, 
      enum: ['solo', 'couple', 'friends', 'group', 'family', 'business'],
      required: true 
    },
    travelType: { type: String, required: true },
    hasChildren: { type: Boolean, required: true },
    childrenCount: { type: Number },
  },
  travelStyle: {
    pace: { 
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      required: true,
    },
    comfort: {
      type: String,
      enum: ['backpacker', 'standard', 'comfort', 'luxury'],
      required: true,
    },
    flexibility: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    culturalImmersion: { 
      type: Number, 
      required: true,
      min: 0,
      max: 100
    },
    preferences: [{ type: String }],
  },
  interests: {
    mainInterests: [{ type: String }],
    specificInterests: [{ type: String }],
    categories: [{ type: String }],
    mustSeeSpots: [{ type: String }],
  },
  budget: {
    total: { type: Number, required: true, min: 0 },
    dailyLimit: { type: Number, required: true, min: 0 },
    priority: {
      type: String,
      enum: ['accommodation', 'food', 'activities', 'undecided'],
      required: true,
    },
  },
  constraints: {
    mobility: { type: Boolean, required: true },
    language: {
      type: String,
      enum: ['none', 'basic', 'intermediate', 'fluent'],
      required: true,
    },
    dietary: [{ type: String }],
    travelBudget: {
      type: String,
      enum: ['low', 'medium', 'high', 'higher', 'undecided'],
      required: true,
    },
    dailyBudget: {
      type: String,
      enum: ['low', 'medium', 'high', 'higher', 'undecided'],
      required: true,
    },
    budgetPriority: {
      type: String,
      enum: ['accommodation', 'food', 'activities', 'undecided'],
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

// Middleware pour la validation des dates
questionnaireSchema.pre('save', function(next) {
  if (this.basicInfo?.dateRange) {
    const { from, to } = this.basicInfo.dateRange;
    if (from && to && from > to) {
      next(new Error('La date de début doit être antérieure à la date de fin'));
    }
  }
  next();
});

// Middleware pour calculer la durée
questionnaireSchema.pre('save', function(next) {
  if (this.basicInfo?.dateRange) {
    const { from, to } = this.basicInfo.dateRange;
    if (from && to) {
      this.basicInfo.duration = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    }
  }
  next();
});

const Questionnaire = models.Questionnaire || model('Questionnaire', questionnaireSchema);

export default Questionnaire;