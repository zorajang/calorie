import { integer, numeric, pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const userProfile = pgTable("user_profile", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  gender: text("gender").notNull(),
  age: integer("age").notNull(),
  heightCm: numeric("height_cm", { precision: 5, scale: 2 }).notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  activityLevel: text("activity_level").notNull(),
  goalType: text("goal_type").notNull(),
  goalAdjustmentKcal: integer("goal_adjustment_kcal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const dailyTargets = pgTable("daily_targets", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  bmrKcal: integer("bmr_kcal").notNull(),
  tdeeKcal: integer("tdee_kcal").notNull(),
  targetIntakeKcal: integer("target_intake_kcal").notNull(),
  goalType: text("goal_type").notNull(),
  goalAdjustmentKcal: integer("goal_adjustment_kcal").notNull(),
  weightKgSnapshot: numeric("weight_kg_snapshot", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const foodEntries = pgTable("food_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  mealType: text("meal_type").notNull(),
  foodName: text("food_name").notNull(),
  amountValue: numeric("amount_value", { precision: 8, scale: 2 }).notNull(),
  amountUnit: text("amount_unit").notNull(),
  caloriesKcal: integer("calories_kcal").notNull(),
  sourceType: text("source_type").notNull(),
  sourceNote: text("source_note"),
  aiConfidence: numeric("ai_confidence", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const foodLibrary = pgTable("food_library", {
  id: uuid("id").defaultRandom().primaryKey(),
  canonicalName: text("canonical_name").notNull(),
  defaultAmountValue: numeric("default_amount_value", { precision: 8, scale: 2 }).notNull(),
  defaultAmountUnit: text("default_amount_unit").notNull(),
  caloriesPerUnitKcal: numeric("calories_per_unit_kcal", { precision: 8, scale: 2 }).notNull(),
  referenceUnit: text("reference_unit").notNull(),
  sourceType: text("source_type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
