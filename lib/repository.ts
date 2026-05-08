import { and, asc, desc, eq, ilike, sql } from "drizzle-orm";
import { dailyTargets, foodEntries, foodLibrary, userProfile, weightLogs } from "@/db/schema";
import { calculateBmr, calculateDailyMetrics, calculateTargetIntake, calculateTdee, type ProfileInput } from "@/lib/calorie";
import { getTodayDate, shiftDate } from "@/lib/date";
import { getDb } from "@/lib/db";
import type {
  HistoryPoint,
  DailySummaryRecord,
  DailyTargetRecord,
  FoodEntryRecord,
  FoodEstimateItem,
  FrequentFoodItem,
  HistorySearchItem,
  WeightLogRecord,
  WeightTrendPoint,
  UserProfileRecord
} from "@/lib/types";

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number(value);
  }

  return 0;
}

function mapProfile(row: typeof userProfile.$inferSelect): UserProfileRecord {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender as UserProfileRecord["gender"],
    age: row.age,
    heightCm: toNumber(row.heightCm),
    weightKg: toNumber(row.weightKg),
    activityLevel: row.activityLevel as UserProfileRecord["activityLevel"],
    goalType: row.goalType as UserProfileRecord["goalType"],
    goalAdjustmentKcal: row.goalAdjustmentKcal
  };
}

function mapDailyTarget(row: typeof dailyTargets.$inferSelect): DailyTargetRecord {
  return {
    id: row.id,
    date: row.date,
    bmrKcal: row.bmrKcal,
    tdeeKcal: row.tdeeKcal,
    targetIntakeKcal: row.targetIntakeKcal,
    goalType: row.goalType as DailyTargetRecord["goalType"],
    goalAdjustmentKcal: row.goalAdjustmentKcal,
    weightKgSnapshot: toNumber(row.weightKgSnapshot)
  };
}

function mapFoodEntry(row: typeof foodEntries.$inferSelect): FoodEntryRecord {
  return {
    id: row.id,
    date: row.date,
    mealType: row.mealType as FoodEntryRecord["mealType"],
    foodName: row.foodName,
    amountValue: toNumber(row.amountValue),
    amountUnit: row.amountUnit as FoodEntryRecord["amountUnit"],
    caloriesKcal: row.caloriesKcal,
    sourceType: row.sourceType as FoodEntryRecord["sourceType"],
    sourceNote: row.sourceNote,
    aiConfidence: row.aiConfidence == null ? null : toNumber(row.aiConfidence)
  };
}

function mapWeightLog(row: typeof weightLogs.$inferSelect): WeightLogRecord {
  return {
    id: row.id,
    date: row.date,
    weightKg: toNumber(row.weightKg)
  };
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getLatestProfile() {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const rows = await db.select().from(userProfile).orderBy(desc(userProfile.updatedAt)).limit(1);
  return rows[0] ? mapProfile(rows[0]) : null;
}

export async function saveProfile(input: ProfileInput & { name?: string }) {
  const db = getDb();
  const now = new Date();
  const existing = await db.select().from(userProfile).orderBy(desc(userProfile.updatedAt)).limit(1);

  let profileId: string;
  if (existing[0]) {
    profileId = existing[0].id;
    await db
      .update(userProfile)
      .set({
        name: input.name ?? null,
        gender: input.gender,
        age: input.age,
        heightCm: input.heightCm.toString(),
        weightKg: input.weightKg.toString(),
        activityLevel: input.activityLevel,
        goalType: input.goalType,
        goalAdjustmentKcal: input.goalAdjustmentKcal,
        updatedAt: now
      })
      .where(eq(userProfile.id, profileId));
  } else {
    const inserted = await db
      .insert(userProfile)
      .values({
        name: input.name ?? null,
        gender: input.gender,
        age: input.age,
        heightCm: input.heightCm.toString(),
        weightKg: input.weightKg.toString(),
        activityLevel: input.activityLevel,
        goalType: input.goalType,
        goalAdjustmentKcal: input.goalAdjustmentKcal
      })
      .returning({ id: userProfile.id });

    profileId = inserted[0].id;
  }

  const dailyTarget = await upsertDailyTargetForDate(getTodayDate(), input);
  const saved = await getLatestProfile();

  return {
    profileId,
    profile: saved,
    dailyTarget
  };
}

export async function upsertDailyTargetForDate(date: string, profile: ProfileInput) {
  const db = getDb();
  const bmrKcal = calculateBmr(profile);
  const tdeeKcal = calculateTdee(bmrKcal, profile.activityLevel);
  const targetIntakeKcal = calculateTargetIntake(profile, tdeeKcal);
  const existing = await db.select().from(dailyTargets).where(eq(dailyTargets.date, date)).limit(1);

  if (existing[0]) {
    const updated = await db
      .update(dailyTargets)
      .set({
        bmrKcal,
        tdeeKcal,
        targetIntakeKcal,
        goalType: profile.goalType,
        goalAdjustmentKcal: profile.goalAdjustmentKcal,
        weightKgSnapshot: profile.weightKg.toString()
      })
      .where(eq(dailyTargets.id, existing[0].id))
      .returning();

    return mapDailyTarget(updated[0]);
  }

  const inserted = await db
    .insert(dailyTargets)
    .values({
      date,
      bmrKcal,
      tdeeKcal,
      targetIntakeKcal,
      goalType: profile.goalType,
      goalAdjustmentKcal: profile.goalAdjustmentKcal,
      weightKgSnapshot: profile.weightKg.toString()
    })
    .returning();

  return mapDailyTarget(inserted[0]);
}

export async function getDailyTarget(date: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const rows = await db.select().from(dailyTargets).where(eq(dailyTargets.date, date)).limit(1);
  return rows[0] ? mapDailyTarget(rows[0]) : null;
}

export async function listFoodEntries(date: string) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const db = getDb();
  const rows = await db.select().from(foodEntries).where(eq(foodEntries.date, date)).orderBy(asc(foodEntries.createdAt));
  return rows.map(mapFoodEntry);
}

export async function createFoodEntry(entry: Omit<FoodEntryRecord, "id">) {
  const db = getDb();
  const inserted = await db
    .insert(foodEntries)
    .values({
      date: entry.date,
      mealType: entry.mealType,
      foodName: entry.foodName,
      amountValue: entry.amountValue.toString(),
      amountUnit: entry.amountUnit,
      caloriesKcal: entry.caloriesKcal,
      sourceType: entry.sourceType,
      sourceNote: entry.sourceNote ?? null,
      aiConfidence: entry.aiConfidence == null ? null : entry.aiConfidence.toString()
    })
    .returning();

  return mapFoodEntry(inserted[0]);
}

export async function updateFoodEntry(id: string, changes: Partial<Omit<FoodEntryRecord, "id">>) {
  const db = getDb();
  const updates: Partial<typeof foodEntries.$inferInsert> = {};

  if (changes.date) updates.date = changes.date;
  if (changes.mealType) updates.mealType = changes.mealType;
  if (changes.foodName) updates.foodName = changes.foodName;
  if (changes.amountValue != null) updates.amountValue = changes.amountValue.toString();
  if (changes.amountUnit) updates.amountUnit = changes.amountUnit;
  if (changes.caloriesKcal != null) updates.caloriesKcal = changes.caloriesKcal;
  if (changes.sourceType) updates.sourceType = changes.sourceType;
  if (changes.sourceNote !== undefined) updates.sourceNote = changes.sourceNote;
  if (changes.aiConfidence !== undefined) {
    updates.aiConfidence = changes.aiConfidence == null ? null : changes.aiConfidence.toString();
  }
  updates.updatedAt = new Date();

  const updated = await db.update(foodEntries).set(updates).where(eq(foodEntries.id, id)).returning();
  return updated[0] ? mapFoodEntry(updated[0]) : null;
}

export async function getFoodEntryById(id: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const rows = await db.select().from(foodEntries).where(eq(foodEntries.id, id)).limit(1);
  return rows[0] ? mapFoodEntry(rows[0]) : null;
}

export async function deleteFoodEntry(id: string) {
  const db = getDb();
  const deleted = await db.delete(foodEntries).where(eq(foodEntries.id, id)).returning({ id: foodEntries.id });
  return deleted[0] ?? null;
}

export async function getDailySummary(date: string): Promise<DailySummaryRecord | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const [target, entries] = await Promise.all([getDailyTarget(date), listFoodEntries(date)]);
  if (!target) {
    return null;
  }

  const consumedKcal = entries.reduce((total, entry) => total + entry.caloriesKcal, 0);
  const metrics = calculateDailyMetrics(target.tdeeKcal, target.targetIntakeKcal, consumedKcal);

  return {
    date,
    bmrKcal: target.bmrKcal,
    tdeeKcal: target.tdeeKcal,
    targetIntakeKcal: target.targetIntakeKcal,
    consumedKcal: metrics.consumedKcal,
    remainingKcal: metrics.remainingKcal,
    actualDeficitKcal: metrics.actualDeficitKcal,
    entries
  };
}

export async function searchFoodLibrary(query: string) {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(foodLibrary)
    .where(ilike(foodLibrary.canonicalName, `%${query}%`))
    .orderBy(asc(foodLibrary.canonicalName))
    .limit(5);

  return rows.map((row) => ({
    id: row.id,
    canonicalName: row.canonicalName,
    defaultAmountValue: toNumber(row.defaultAmountValue),
    defaultAmountUnit: row.defaultAmountUnit,
    caloriesPerUnitKcal: toNumber(row.caloriesPerUnitKcal),
    referenceUnit: row.referenceUnit,
    sourceType: row.sourceType
  }));
}

export async function saveFoodLibraryEstimate(item: FoodEstimateItem) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const db = getDb();
  const existing = await db
    .select()
    .from(foodLibrary)
    .where(and(eq(foodLibrary.canonicalName, item.foodName), eq(foodLibrary.referenceUnit, `per ${item.amountValue}${item.amountUnit}`)))
    .limit(1);

  if (existing[0]) {
    return existing[0];
  }

  const inserted = await db
    .insert(foodLibrary)
    .values({
      canonicalName: item.foodName,
      defaultAmountValue: item.amountValue.toString(),
      defaultAmountUnit: item.amountUnit,
      caloriesPerUnitKcal: item.caloriesKcal.toString(),
      referenceUnit: `per ${item.amountValue}${item.amountUnit}`,
      sourceType: "ai_verified"
    })
    .returning();

  return inserted[0];
}

export async function countEntriesByDate(date: string) {
  if (!isDatabaseConfigured()) {
    return 0;
  }

  const db = getDb();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(foodEntries)
    .where(eq(foodEntries.date, date));

  return Number(result[0]?.count ?? 0);
}

export async function getHistorySeries(days = 7, endDate = getTodayDate()): Promise<HistoryPoint[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const dates = Array.from({ length: days }, (_, index) => shiftDate(endDate, -(days - 1 - index)));
  const summaries = await Promise.all(dates.map((date) => getDailySummary(date)));

  return dates.map((date, index) => {
    const summary = summaries[index];
    return {
      date,
      consumedKcal: summary?.consumedKcal ?? 0,
      targetIntakeKcal: summary?.targetIntakeKcal ?? 0,
      actualDeficitKcal: summary?.actualDeficitKcal ?? 0,
      entryCount: summary?.entries.length ?? 0
    };
  });
}

export async function getFrequentFoods(limit = 6): Promise<FrequentFoodItem[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select({
      foodName: foodEntries.foodName,
      amountValue: foodEntries.amountValue,
      amountUnit: foodEntries.amountUnit,
      caloriesKcal: foodEntries.caloriesKcal,
      sourceType: foodEntries.sourceType,
      lastUsedDate: sql<string>`max(${foodEntries.date})`,
      useCount: sql<number>`count(*)`
    })
    .from(foodEntries)
    .groupBy(
      foodEntries.foodName,
      foodEntries.amountValue,
      foodEntries.amountUnit,
      foodEntries.caloriesKcal,
      foodEntries.sourceType
    )
    .orderBy(sql`count(*) desc`, sql`max(${foodEntries.date}) desc`)
    .limit(limit);

  return rows.map((row) => ({
    foodName: row.foodName,
    amountValue: toNumber(row.amountValue),
    amountUnit: row.amountUnit as FrequentFoodItem["amountUnit"],
    caloriesKcal: row.caloriesKcal,
    sourceType: row.sourceType as FrequentFoodItem["sourceType"],
    lastUsedDate: row.lastUsedDate,
    useCount: Number(row.useCount)
  }));
}

export async function searchHistoryEntries(query: string, limit = 20): Promise<HistorySearchItem[]> {
  if (!isDatabaseConfigured() || !query.trim()) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(foodEntries)
    .where(ilike(foodEntries.foodName, `%${query.trim()}%`))
    .orderBy(desc(foodEntries.date), desc(foodEntries.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    date: row.date,
    mealType: row.mealType as HistorySearchItem["mealType"],
    foodName: row.foodName,
    amountValue: toNumber(row.amountValue),
    amountUnit: row.amountUnit as HistorySearchItem["amountUnit"],
    caloriesKcal: row.caloriesKcal,
    sourceType: row.sourceType as HistorySearchItem["sourceType"]
  }));
}

export async function getWeightTrend(days = 14, endDate = getTodayDate()): Promise<WeightTrendPoint[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const startDate = shiftDate(endDate, -(days - 1));
  const db = getDb();

  const loggedWeights = await db
    .select({
      date: weightLogs.date,
      weightKg: weightLogs.weightKg
    })
    .from(weightLogs)
    .where(and(sql`${weightLogs.date} >= ${startDate}`, sql`${weightLogs.date} <= ${endDate}`))
    .orderBy(asc(weightLogs.date));

  if (loggedWeights.length > 0) {
    return loggedWeights.map((row) => ({
      date: row.date,
      weightKg: toNumber(row.weightKg)
    }));
  }

  const targetSnapshots = await db
    .select({
      date: dailyTargets.date,
      weightKg: dailyTargets.weightKgSnapshot
    })
    .from(dailyTargets)
    .where(and(sql`${dailyTargets.date} >= ${startDate}`, sql`${dailyTargets.date} <= ${endDate}`))
    .orderBy(asc(dailyTargets.date));

  return targetSnapshots.map((row) => ({
    date: row.date,
    weightKg: toNumber(row.weightKg)
  }));
}

export async function upsertWeightLog(date: string, weightKg: number) {
  const db = getDb();
  const existing = await db.select().from(weightLogs).where(eq(weightLogs.date, date)).limit(1);

  if (existing[0]) {
    const updated = await db
      .update(weightLogs)
      .set({
        weightKg: weightKg.toString()
      })
      .where(eq(weightLogs.id, existing[0].id))
      .returning();

    return mapWeightLog(updated[0]);
  }

  const inserted = await db
    .insert(weightLogs)
    .values({
      date,
      weightKg: weightKg.toString()
    })
    .returning();

  return mapWeightLog(inserted[0]);
}

export async function syncProfileWeightForDate(date: string, weightKg: number) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const profile = await getLatestProfile();
  if (!profile) {
    return null;
  }

  const db = getDb();
  await db
    .update(userProfile)
    .set({
      weightKg: weightKg.toString(),
      updatedAt: new Date()
    })
    .where(eq(userProfile.id, profile.id));

  return upsertDailyTargetForDate(date, {
    gender: profile.gender,
    age: profile.age,
    heightCm: profile.heightCm,
    weightKg,
    activityLevel: profile.activityLevel,
    goalType: profile.goalType,
    goalAdjustmentKcal: profile.goalAdjustmentKcal
  });
}

export async function getRecentWeightLogs(limit = 8): Promise<WeightLogRecord[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const db = getDb();
  const rows = await db.select().from(weightLogs).orderBy(desc(weightLogs.date)).limit(limit);
  return rows.map(mapWeightLog);
}
