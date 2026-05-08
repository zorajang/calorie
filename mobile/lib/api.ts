import type {
  DailySummaryRecord,
  FoodEstimateItem,
  FrequentFoodItem,
  HistoryPoint,
  HistorySearchItem,
  UserProfileRecord,
  WeightLogRecord,
  WeightTrendPoint
} from "@/lib/types";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL is not configured");
  }

  return API_BASE_URL.replace(/\/$/, "");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

export function getTodaySummary(date: string) {
  return request<DailySummaryRecord>(`/api/daily-summary?date=${date}`);
}

export function estimateFood(input: string) {
  return request<{ items: FoodEstimateItem[]; totalCaloriesKcal: number }>("/api/ai/estimate-food", {
    method: "POST",
    body: JSON.stringify({ input })
  });
}

export function createFoodEntries(date: string, items: FoodEstimateItem[]) {
  return Promise.all(
    items.map((item) =>
      request<{ summary: DailySummaryRecord }>("/api/food-entries", {
        method: "POST",
        body: JSON.stringify({
          date,
          mealType: item.mealType ?? "snack",
          foodName: item.foodName,
          amountValue: item.amountValue,
          amountUnit: item.amountUnit,
          caloriesKcal: item.caloriesKcal,
          sourceType: item.sourceType ?? "ai",
          sourceNote: item.sourceNote,
          aiConfidence: item.sourceType === "manual" ? undefined : item.confidence
        })
      })
    )
  );
}

export function getFrequentFoods(limit = 6) {
  return request<{ items: FrequentFoodItem[] }>(`/api/frequent-foods?limit=${limit}`);
}

export function getHistorySeries(days = 7) {
  return request<{ calorieSeries: HistoryPoint[]; weightSeries: WeightTrendPoint[] }>(`/api/history/series?days=${days}`);
}

export function searchHistory(query: string, limit = 20) {
  return request<{ items: HistorySearchItem[] }>(`/api/history/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export function getProfile() {
  return request<{ profile: UserProfileRecord | null }>("/api/profile");
}

export function saveProfile(payload: Omit<UserProfileRecord, "id">) {
  return request<{ profile: UserProfileRecord; dailyTarget: { targetIntakeKcal: number } }>("/api/profile", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getWeightLogs(days = 8, limit = 8) {
  return request<{ trend: WeightTrendPoint[]; items: WeightLogRecord[] }>(`/api/weight-logs?days=${days}&limit=${limit}`);
}

export function saveWeightLog(date: string, weightKg: number) {
  return request<{ trend: WeightTrendPoint[]; dailyTarget?: { targetIntakeKcal: number } }>("/api/weight-logs", {
    method: "POST",
    body: JSON.stringify({ date, weightKg })
  });
}
