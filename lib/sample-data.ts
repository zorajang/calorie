import { calculateDailyMetrics } from "@/lib/calorie";

const consumedKcal = 1060;
const tdeeKcal = 2310;
const targetIntakeKcal = 1810;

export const sampleSummary = {
  date: "2026-05-08",
  bmrKcal: 1490,
  tdeeKcal,
  targetIntakeKcal,
  ...calculateDailyMetrics(tdeeKcal, targetIntakeKcal, consumedKcal),
  entries: [
    {
      id: "1",
      mealType: "breakfast",
      foodName: "燕麦",
      amountValue: 50,
      amountUnit: "g",
      caloriesKcal: 194,
      sourceType: "database"
    },
    {
      id: "2",
      mealType: "breakfast",
      foodName: "纯牛奶",
      amountValue: 250,
      amountUnit: "ml",
      caloriesKcal: 135,
      sourceType: "database"
    },
    {
      id: "3",
      mealType: "lunch",
      foodName: "鸡胸肉",
      amountValue: 200,
      amountUnit: "g",
      caloriesKcal: 330,
      sourceType: "ai"
    },
    {
      id: "4",
      mealType: "lunch",
      foodName: "米饭",
      amountValue: 180,
      amountUnit: "g",
      caloriesKcal: 401,
      sourceType: "manual"
    }
  ]
};

export const sampleHistory = [
  {
    label: "近 7 天平均摄入",
    value: "1,842 kcal",
    note: "比目标高 63 kcal，先把晚餐估算误差压小。"
  },
  {
    label: "近 7 天平均缺口",
    value: "418 kcal",
    note: "已经接近常规减脂区间，可以继续观察体重变化。"
  },
  {
    label: "本周记录完成度",
    value: "6 / 7 天",
    note: "缺的那一天建议补录，否则趋势判断会失真。"
  }
];

export const sampleHistorySeries = [
  { date: "2026-05-02", consumedKcal: 1760, targetIntakeKcal: 1810, actualDeficitKcal: 550, entryCount: 5 },
  { date: "2026-05-03", consumedKcal: 1680, targetIntakeKcal: 1810, actualDeficitKcal: 640, entryCount: 4 },
  { date: "2026-05-04", consumedKcal: 1920, targetIntakeKcal: 1810, actualDeficitKcal: 380, entryCount: 6 },
  { date: "2026-05-05", consumedKcal: 1840, targetIntakeKcal: 1810, actualDeficitKcal: 470, entryCount: 5 },
  { date: "2026-05-06", consumedKcal: 1710, targetIntakeKcal: 1810, actualDeficitKcal: 610, entryCount: 4 },
  { date: "2026-05-07", consumedKcal: 1880, targetIntakeKcal: 1810, actualDeficitKcal: 420, entryCount: 5 },
  { date: "2026-05-08", consumedKcal: 1060, targetIntakeKcal: 1810, actualDeficitKcal: 1250, entryCount: 4 }
];

export const sampleFrequentFoods = [
  { foodName: "乌冬面", amountValue: 300, amountUnit: "g", caloriesKcal: 360, sourceType: "ai", lastUsedDate: "2026-05-08", useCount: 3 },
  { foodName: "燕麦", amountValue: 50, amountUnit: "g", caloriesKcal: 194, sourceType: "database", lastUsedDate: "2026-05-07", useCount: 6 },
  { foodName: "纯牛奶", amountValue: 250, amountUnit: "ml", caloriesKcal: 135, sourceType: "database", lastUsedDate: "2026-05-07", useCount: 5 },
  { foodName: "鸡胸肉", amountValue: 200, amountUnit: "g", caloriesKcal: 330, sourceType: "ai", lastUsedDate: "2026-05-06", useCount: 4 }
];

export const sampleHistorySearch = [
  { id: "s1", date: "2026-05-08", mealType: "snack", foodName: "乌冬面", amountValue: 300, amountUnit: "g", caloriesKcal: 360, sourceType: "ai" },
  { id: "s2", date: "2026-05-05", mealType: "lunch", foodName: "乌冬面", amountValue: 280, amountUnit: "g", caloriesKcal: 340, sourceType: "manual" }
];

export const sampleWeightTrend = [
  { date: "2026-05-01", weightKg: 60.8 },
  { date: "2026-05-02", weightKg: 60.6 },
  { date: "2026-05-03", weightKg: 60.5 },
  { date: "2026-05-04", weightKg: 60.4 },
  { date: "2026-05-05", weightKg: 60.3 },
  { date: "2026-05-06", weightKg: 60.1 },
  { date: "2026-05-07", weightKg: 60.0 },
  { date: "2026-05-08", weightKg: 59.9 }
];

export const sampleRecentWeightLogs = [
  { id: "w1", date: "2026-05-08", weightKg: 59.9 },
  { id: "w2", date: "2026-05-07", weightKg: 60.0 },
  { id: "w3", date: "2026-05-06", weightKg: 60.1 },
  { id: "w4", date: "2026-05-05", weightKg: 60.3 }
];
