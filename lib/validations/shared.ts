import { z } from "zod";

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
}, z.date());

export const languageSchema = z.enum(['none', 'basic', 'intermediate', 'fluent'], {
  required_error: "Le niveau de langue est requis",
});

export const budgetSchema = z.object({
  total: z.number().min(0, "Le budget total doit être positif"),
  dailyLimit: z.number().min(0, "Le budget journalier doit être positif"),
  priority: z.enum(['accommodation', 'food', 'activities'], {
    required_error: "La priorité budgétaire est requise",
  }),
});

export const constraintsSchema = z.object({
  mobility: z.boolean().default(false),
  language: languageSchema,
  dietary: z.array(z.string()).default([]),
});

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`Validation error: ${message}`);
    }
    throw error;
  }
} 