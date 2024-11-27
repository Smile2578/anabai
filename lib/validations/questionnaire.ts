// lib/validations/questionnaire.ts
import { z } from "zod";

export const questionnaireSchema = z.object({
  basicInfo: z.object({
    duration: z.number().min(1).max(30),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    groupSize: z.number().min(1).max(20),
  }),
  travelStyle: z.object({
    pace: z.enum(['slow', 'moderate', 'fast']),
    travelTypes: z.array(z.string()).min(1),
    comfort: z.enum(['budget', 'moderate', 'luxury']),
    preferences: z.array(z.string()).min(1),
  }),
  interests: z.object({
    categories: z.array(z.string()).min(1),
    specificInterests: z.array(z.string()).optional().default([]),
    mustSeeSpots: z.array(z.string()).optional().default([]),
  }),
  budget: z.object({
    total: z.number().min(0),
    dailyLimit: z.number().min(0),
    priority: z.enum(['accommodation', 'food', 'activities']),
  }),
  constraints: z.object({
    mobility: z.boolean(),
    language: z.enum(['none', 'basic', 'intermediate', 'fluent']),
    dietary: z.array(z.string()).default([]),
  }),
});