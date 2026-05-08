"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DailySummaryCard } from "@/components/today/daily-summary-card";
import { TodayInsights } from "@/components/today/today-insights";
import { FoodEntryList } from "@/components/food/food-entry-list";
import { QuickAddPanel } from "@/components/food/quick-add-panel";
import { FrequentFoodsPanel } from "@/components/home/frequent-foods-panel";
import { WeightLogPanel } from "@/components/home/weight-log-panel";
import { WeightTrendCard } from "@/components/home/weight-trend-card";
import type { DailySummaryRecord, FoodEntryRecord, FoodEstimateItem, FrequentFoodItem, WeightTrendPoint } from "@/lib/types";

type HomeDashboardProps = {
  initialSummary: DailySummaryRecord;
  frequentFoods: FrequentFoodItem[];
  weightTrend: WeightTrendPoint[];
};

function recalculateSummary(summary: DailySummaryRecord, entries: FoodEntryRecord[]) {
  const consumedKcal = entries.reduce((sum, entry) => sum + entry.caloriesKcal, 0);
  return {
    ...summary,
    entries,
    consumedKcal,
    remainingKcal: summary.targetIntakeKcal - consumedKcal,
    actualDeficitKcal: summary.tdeeKcal - consumedKcal
  };
}

export function HomeDashboard({ initialSummary, frequentFoods, weightTrend }: HomeDashboardProps) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [currentWeightTrend, setCurrentWeightTrend] = useState(weightTrend);

  function applyServerSummary(nextSummary: DailySummaryRecord | null | undefined) {
    if (nextSummary) {
      setSummary(nextSummary);
    }
  }

  function applyTargetIntake(targetIntakeKcal: number) {
    setSummary((current) => ({
      ...current,
      targetIntakeKcal,
      remainingKcal: targetIntakeKcal - current.consumedKcal
    }));
    router.refresh();
  }

  function applyOptimisticEntries(items: FoodEstimateItem[]) {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    const optimisticEntries: FoodEntryRecord[] = items.map((item, index) => ({
      id: `optimistic-${Date.now()}-${index}`,
      date: summary.date,
      mealType: item.mealType ?? "snack",
      foodName: item.foodName,
      amountValue: item.amountValue,
      amountUnit: item.amountUnit,
      caloriesKcal: item.caloriesKcal,
      sourceType: item.sourceType ?? "ai",
      sourceNote: item.sourceNote,
      aiConfidence: item.confidence
    }));

    setSummary((current) => recalculateSummary(current, [...current.entries, ...optimisticEntries]));
  }

  async function persistItems(items: FoodEstimateItem[]) {
    if (!Array.isArray(items) || items.length === 0) {
      return;
    }

    applyOptimisticEntries(items);

    let latestSummary: DailySummaryRecord | null | undefined;
    for (const item of items) {
      const response = await fetch("/api/food-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: summary.date,
          mealType: item.mealType ?? "snack",
          foodName: item.foodName,
          amountValue: item.amountValue,
          amountUnit: item.amountUnit,
          caloriesKcal: item.caloriesKcal,
          sourceType: item.sourceType ?? "ai",
          sourceNote: item.sourceNote,
          aiConfidence: item.sourceType === "manual" ? undefined : item.confidence
        })
      });

      if (!response.ok) {
        router.refresh();
        throw new Error("Failed to persist food entries");
      }

      const data = await response.json();
      latestSummary = data.summary;
    }

    applyServerSummary(latestSummary);
    router.refresh();
  }

  return (
    <>
      <DailySummaryCard summary={summary} />
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TodayInsights summary={summary} />
        <div className="space-y-6">
          <WeightTrendCard points={currentWeightTrend} />
          <WeightLogPanel
            currentDate={summary.date}
            initialWeightKg={currentWeightTrend[currentWeightTrend.length - 1]?.weightKg ?? null}
            onDailyTargetChange={applyTargetIntake}
            onTrendChange={setCurrentWeightTrend}
          />
        </div>
      </section>
      <FrequentFoodsPanel items={frequentFoods} onQuickUse={persistItems} />
      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <QuickAddPanel onPersistItems={persistItems} />
        <FoodEntryList date={summary.date} entries={summary.entries} onSummaryChange={applyServerSummary} />
      </section>
    </>
  );
}
