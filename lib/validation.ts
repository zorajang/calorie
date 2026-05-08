import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  gender: z.enum(["male", "female"]),
  age: z.number().int().min(10).max(100),
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  activityLevel: z.enum(["sedentary", "light", "moderate", "high"]),
  goalType: z.enum(["cut", "maintain", "bulk"]),
  goalAdjustmentKcal: z.number().int().min(0).max(1500)
});

export const foodEntrySchema = z.object({
  date: z.string().date(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodName: z.string().trim().min(1).max(100),
  amountValue: z.number().positive(),
  amountUnit: z.enum(["g", "ml", "serving", "piece"]),
  caloriesKcal: z.number().int().positive(),
  sourceType: z.enum(["manual", "database", "ai"]),
  sourceNote: z.string().trim().max(200).optional(),
  aiConfidence: z.number().min(0).max(1).optional()
});

export const estimateFoodSchema = z.object({
  input: z.string().trim().min(1).max(300)
});
