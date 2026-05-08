export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";
export type GoalType = "cut" | "maintain" | "bulk";

export type ProfileInput = {
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalAdjustmentKcal: number;
};

const activityFactors: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725
};

export function calculateBmr(input: Pick<ProfileInput, "gender" | "age" | "heightCm" | "weightKg">) {
  const base = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age;
  return Math.round(input.gender === "male" ? base + 5 : base - 161);
}

export function calculateTdee(bmrKcal: number, activityLevel: ActivityLevel) {
  return Math.round(bmrKcal * activityFactors[activityLevel]);
}

export function calculateTargetIntake(input: Pick<ProfileInput, "goalType" | "goalAdjustmentKcal">, tdeeKcal: number) {
  if (input.goalType === "cut") {
    return tdeeKcal - input.goalAdjustmentKcal;
  }

  if (input.goalType === "bulk") {
    return tdeeKcal + input.goalAdjustmentKcal;
  }

  return tdeeKcal;
}

export function calculateDailyMetrics(tdeeKcal: number, targetIntakeKcal: number, consumedKcal: number) {
  return {
    consumedKcal,
    remainingKcal: targetIntakeKcal - consumedKcal,
    actualDeficitKcal: tdeeKcal - consumedKcal
  };
}
