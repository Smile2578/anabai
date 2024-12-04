// lib/validations/questionnaire.ts
import { z } from "zod";

const dateRangeSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export const basicInfoSchema = z.object({
  duration: z.number().min(1).max(90),
  dateRange: dateRangeSchema,
  groupSize: z.number().min(1).max(20),
  previousVisit: z.boolean(),
  visitCount: z.number().optional(),
  groupType: z.enum(['solo', 'couple', 'friends', 'group', 'family', 'business']),
  travelType: z.string(),
  hasChildren: z.boolean(),
  childrenCount: z.number().optional(),
});

export const travelStyleSchema = z.object({
  pace: z.enum(['slow', 'moderate', 'fast']),
  comfort: z.enum(['backpacker', 'standard', 'comfort', 'luxury']),
  flexibility: z.number().min(0).max(100),
  culturalImmersion: z.number().min(0).max(100),
  preferences: z.array(z.string()).min(1),
});

export const interestsSchema = z.object({
  mainInterests: z.array(z.string()).min(1),
  specificInterests: z.array(z.string()).optional(),
  categories: z.array(z.string()).min(1),
  mustSeeSpots: z.array(z.string()).optional(),
});

export const budgetSchema = z.object({
  total: z.number().min(0),
  dailyLimit: z.number().min(0),
  priority: z.enum(['accommodation', 'food', 'activities', 'undecided']),
});

export const constraintsSchema = z.object({
  mobility: z.boolean(),
  language: z.enum(['none', 'basic', 'intermediate', 'fluent']),
  dietary: z.array(z.string()).optional().default([]),
  travelBudget: z.enum(['low', 'medium', 'high', 'higher', 'undecided']),
  dailyBudget: z.enum(['low', 'medium', 'high', 'higher', 'undecided']),
  budgetPriority: z.enum(['accommodation', 'food', 'activities', 'undecided']),
});

export const questionnaireSchema = z.object({
  basicInfo: basicInfoSchema,
  travelStyle: travelStyleSchema,
  interests: interestsSchema,
  budget: budgetSchema,
  constraints: constraintsSchema,
  status: z.enum(['draft', 'completed', 'processing', 'error']).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});