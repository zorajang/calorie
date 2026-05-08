export type UserProfileRecord = {
  id: string;
  name: string | null;
  gender: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: "sedentary" | "light" | "moderate" | "high";
  goalType: "cut" | "maintain" | "bulk";
  goalAdjustmentKcal: number;
};

export type FoodEntryRecord = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName: string;
  amountValue: number;
  amountUnit: "g" | "ml" | "serving" | "piece";
  caloriesKcal: number;
  sourceType: "manual" | "database" | "ai";
};

export type DailySummaryRecord = {
  date: string;
  bmrKcal: number;
  tdeeKcal: number;
  targetIntakeKcal: number;
  consumedKcal: number;
  remainingKcal: number;
  actualDeficitKcal: number;
  entries: FoodEntryRecord[];
};

export type FoodEstimateItem = {
  foodName: string;
  amountValue: number;
  amountUnit: "g" | "ml" | "serving" | "piece";
  caloriesKcal: number;
  sourceNote: string;
  confidence: number;
  mealType?: "breakfast" | "lunch" | "dinner" | "snack";
  sourceType?: "manual" | "database" | "ai";
};

export type FrequentFoodItem = {
  foodName: string;
  amountValue: number;
  amountUnit: "g" | "ml" | "serving" | "piece";
  caloriesKcal: number;
  sourceType: "manual" | "database" | "ai";
  lastUsedDate: string;
  useCount: number;
};

export type HistoryPoint = {
  date: string;
  consumedKcal: number;
  targetIntakeKcal: number;
  actualDeficitKcal: number;
  entryCount: number;
};

export type HistorySearchItem = {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foodName: string;
  amountValue: number;
  amountUnit: "g" | "ml" | "serving" | "piece";
  caloriesKcal: number;
  sourceType: "manual" | "database" | "ai";
};

export type WeightTrendPoint = {
  date: string;
  weightKg: number;
};

export type WeightLogRecord = {
  id: string;
  date: string;
  weightKg: number;
};
