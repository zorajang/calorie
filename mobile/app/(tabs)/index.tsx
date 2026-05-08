import { useCallback, useEffect, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { createFoodEntries, estimateFood, getFrequentFoods, getTodaySummary, getWeightLogs, saveWeightLog } from "@/lib/api";
import { getTodayDate } from "@/lib/date";
import type { DailySummaryRecord, FoodEstimateItem, FrequentFoodItem, WeightTrendPoint } from "@/lib/types";

const mealLabels = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐"
} as const;

export default function TodayScreen() {
  const today = getTodayDate();
  const [entryMode, setEntryMode] = useState<"ai" | "manual">("ai");
  const [summary, setSummary] = useState<DailySummaryRecord | null>(null);
  const [frequentFoods, setFrequentFoods] = useState<FrequentFoodItem[]>([]);
  const [weightTrend, setWeightTrend] = useState<WeightTrendPoint[]>([]);
  const [foodInput, setFoodInput] = useState("");
  const [estimatedItems, setEstimatedItems] = useState<FoodEstimateItem[]>([]);
  const [mealType, setMealType] = useState<FoodEstimateItem["mealType"]>("snack");
  const [manualFoodName, setManualFoodName] = useState("");
  const [manualAmountValue, setManualAmountValue] = useState("");
  const [manualAmountUnit, setManualAmountUnit] = useState<FoodEstimateItem["amountUnit"]>("g");
  const [manualCaloriesKcal, setManualCaloriesKcal] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [status, setStatus] = useState("");

  const loadTodayData = useCallback(() => {
    Promise.all([getTodaySummary(today), getFrequentFoods(4), getWeightLogs(8, 8)])
      .then(([nextSummary, frequent, weight]) => {
        setSummary(nextSummary);
        setFrequentFoods(frequent.items);
        setWeightTrend(weight.trend);
        setWeightKg(weight.trend[weight.trend.length - 1]?.weightKg ? String(weight.trend[weight.trend.length - 1].weightKg) : "");
      })
      .catch((error) => setStatus(error.message));
  }, [today]);

  useEffect(() => {
    loadTodayData();
  }, [loadTodayData]);

  useFocusEffect(
    useCallback(() => {
      loadTodayData();
    }, [loadTodayData])
  );

  const progress = useMemo(() => {
    if (!summary) return 0;
    return Math.min(100, Math.max(0, Math.round((summary.consumedKcal / Math.max(summary.targetIntakeKcal, 1)) * 100)));
  }, [summary]);

  async function handleEstimate() {
    try {
      const result = await estimateFood(foodInput);
      setEstimatedItems(result.items);
      setStatus(`已估算 ${result.totalCaloriesKcal} kcal`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "估算失败");
    }
  }

  async function handleSaveEstimated(items: FoodEstimateItem[]) {
    if (!summary || items.length === 0) return;

    try {
      const results = await createFoodEntries(
        summary.date,
        items.map((item) => ({ ...item, mealType }))
      );
      const last = results[results.length - 1];
      setSummary(last.summary);
      setEstimatedItems([]);
      setFoodInput("");
      setStatus("已保存到今日记录");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    }
  }

  async function handleSaveManual() {
    if (!summary) return;

    const amountValue = Number(manualAmountValue);
    const caloriesKcal = Number(manualCaloriesKcal);

    if (!manualFoodName.trim() || !Number.isFinite(amountValue) || amountValue <= 0 || !Number.isFinite(caloriesKcal) || caloriesKcal <= 0) {
      setStatus("请填写食物名、数量和 kcal");
      return;
    }

    try {
      const results = await createFoodEntries(summary.date, [
        {
          foodName: manualFoodName.trim(),
          amountValue,
          amountUnit: manualAmountUnit,
          caloriesKcal: Math.round(caloriesKcal),
          sourceNote: "Manual entry",
          confidence: 1,
          mealType,
          sourceType: "manual"
        }
      ]);
      const last = results[results.length - 1];
      setSummary(last.summary);
      setManualFoodName("");
      setManualAmountValue("");
      setManualCaloriesKcal("");
      setManualAmountUnit("g");
      setStatus("已手动保存到今日记录");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "手动保存失败");
    }
  }

  async function handleSaveWeight() {
    try {
      const result = await saveWeightLog(today, Number(weightKg));
      setWeightTrend(result.trend);
      if (summary && result.dailyTarget?.targetIntakeKcal) {
        setSummary({
          ...summary,
          targetIntakeKcal: result.dailyTarget.targetIntakeKcal,
          remainingKcal: result.dailyTarget.targetIntakeKcal - summary.consumedKcal
        });
      }
      setStatus("已记录今日体重");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "体重保存失败");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Daily Fuel</Text>
      <Text style={styles.title}>今天的热量记录</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>今天还能吃</Text>
        <Text style={styles.heroValue}>
          {summary ? `${summary.remainingKcal} kcal` : "--"}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.metricRow}>
          <Metric label="目标" value={summary ? `${summary.targetIntakeKcal} kcal` : "--"} />
          <Metric label="已摄入" value={summary ? `${summary.consumedKcal} kcal` : "--"} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>快速录入</Text>
        <View style={styles.chipsRow}>
          {([
            { value: "ai", label: "AI 估算" },
            { value: "manual", label: "手动录入" }
          ] as const).map((option) => (
            <Pressable key={option.value} onPress={() => setEntryMode(option.value)} style={[styles.chip, entryMode === option.value && styles.chipActive]}>
              <Text style={[styles.chipText, entryMode === option.value && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chipsRow}>
          {(["breakfast", "lunch", "dinner", "snack"] as const).map((option) => (
            <Pressable key={option} onPress={() => setMealType(option)} style={[styles.chip, mealType === option && styles.chipActive]}>
              <Text style={[styles.chipText, mealType === option && styles.chipTextActive]}>{mealLabels[option]}</Text>
            </Pressable>
          ))}
        </View>
        {entryMode === "ai" ? (
          <>
            <TextInput
              multiline
              onChangeText={setFoodInput}
              placeholder="例如：燕麦 50g + 牛奶 250ml"
              style={styles.textarea}
              value={foodInput}
            />
            <View style={styles.actionRow}>
              <PrimaryButton label="AI 估算" onPress={handleEstimate} />
              <SecondaryButton disabled={estimatedItems.length === 0} label="确认保存" onPress={() => handleSaveEstimated(estimatedItems)} />
            </View>
            {estimatedItems.map((item) => (
              <View key={`${item.foodName}-${item.amountValue}`} style={styles.inlineRow}>
                <Text style={styles.inlineTitle}>{item.foodName}</Text>
                <Text style={styles.inlineMeta}>{item.caloriesKcal} kcal</Text>
              </View>
            ))}
          </>
        ) : (
          <>
            <TextInput onChangeText={setManualFoodName} placeholder="食物名，例如：鸡蛋" style={styles.textInput} value={manualFoodName} />
            <View style={styles.manualRow}>
              <TextInput keyboardType="decimal-pad" onChangeText={setManualAmountValue} placeholder="数量" style={[styles.textInput, styles.manualField]} value={manualAmountValue} />
              <View style={[styles.unitPicker, styles.manualField]}>
                {(["g", "ml", "serving", "piece"] as const).map((option) => (
                  <Pressable key={option} onPress={() => setManualAmountUnit(option)} style={[styles.unitOption, manualAmountUnit === option && styles.unitOptionActive]}>
                    <Text style={[styles.unitOptionText, manualAmountUnit === option && styles.unitOptionTextActive]}>{option}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <TextInput keyboardType="number-pad" onChangeText={setManualCaloriesKcal} placeholder="热量 kcal，例如：280" style={styles.textInput} value={manualCaloriesKcal} />
            <View style={styles.actionRow}>
              <PrimaryButton label="手动保存" onPress={handleSaveManual} />
            </View>
          </>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>常吃食物</Text>
        {frequentFoods.map((item) => (
          <Pressable key={`${item.foodName}-${item.amountValue}`} onPress={() => handleSaveEstimated([{ ...item, sourceNote: "Frequent food", confidence: 1, sourceType: item.sourceType }])} style={styles.listItem}>
            <View>
              <Text style={styles.inlineTitle}>{item.foodName}</Text>
              <Text style={styles.inlineMeta}>
                {item.amountValue}
                {item.amountUnit} · {item.caloriesKcal} kcal
              </Text>
            </View>
            <Text style={styles.linkText}>加入</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>记录体重</Text>
        <View style={styles.actionRow}>
          <TextInput onChangeText={setWeightKg} placeholder="59.8" style={styles.weightInput} value={weightKg} />
          <PrimaryButton label="保存体重" onPress={handleSaveWeight} />
        </View>
        <Text style={styles.helper}>{status}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>今日记录</Text>
        {summary?.entries.map((entry) => (
          <View key={entry.id} style={styles.listItem}>
            <View>
              <Text style={styles.inlineTitle}>{entry.foodName}</Text>
              <Text style={styles.inlineMeta}>
                {mealLabels[entry.mealType]} · {entry.amountValue}
                {entry.amountUnit}
              </Text>
            </View>
            <Text style={styles.inlineTitle}>{entry.caloriesKcal} kcal</Text>
          </View>
        ))}
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.secondaryButton, disabled && styles.disabledButton]}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f1e8"
  },
  container: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
    backgroundColor: "#f5f1e8"
  },
  eyebrow: {
    color: "#c86a3c",
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase"
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1a1816"
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: "#f1ebdf",
    gap: 14
  },
  heroLabel: {
    color: "#6f655c",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 2
  },
  heroValue: {
    color: "#1a1816",
    fontSize: 42,
    fontWeight: "700"
  },
  progressTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: "#ffffff"
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#6f8b4e"
  },
  metricRow: {
    flexDirection: "row",
    gap: 12
  },
  metricBox: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#fffaf2",
    padding: 14
  },
  metricLabel: {
    color: "#85796e",
    fontSize: 12
  },
  metricValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1816"
  },
  card: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "#fffdf8",
    gap: 14
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1816"
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8cdbc",
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  chipActive: {
    backgroundColor: "#c86a3c",
    borderColor: "#c86a3c"
  },
  chipText: {
    color: "#6f655c"
  },
  chipTextActive: {
    color: "#ffffff"
  },
  textarea: {
    minHeight: 120,
    borderRadius: 22,
    backgroundColor: "#f6f0e6",
    padding: 14,
    textAlignVertical: "top"
  },
  textInput: {
    borderRadius: 20,
    backgroundColor: "#f6f0e6",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  manualRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "stretch"
  },
  manualField: {
    flex: 1
  },
  unitPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderRadius: 20,
    backgroundColor: "#f6f0e6",
    padding: 8,
    justifyContent: "center"
  },
  unitOption: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  unitOptionActive: {
    backgroundColor: "#c86a3c"
  },
  unitOptionText: {
    color: "#6f655c",
    fontSize: 12
  },
  unitOptionTextActive: {
    color: "#ffffff",
    fontWeight: "600"
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  primaryButton: {
    borderRadius: 999,
    backgroundColor: "#c86a3c",
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600"
  },
  secondaryButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d8cdbc",
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  disabledButton: {
    opacity: 0.45
  },
  secondaryButtonText: {
    color: "#1a1816",
    fontWeight: "600"
  },
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  inlineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1816"
  },
  inlineMeta: {
    color: "#6f655c"
  },
  listItem: {
    borderRadius: 20,
    backgroundColor: "#f6f0e6",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  linkText: {
    color: "#c86a3c",
    fontWeight: "600"
  },
  weightInput: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#f6f0e6",
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  helper: {
    color: "#6f655c",
    fontSize: 13
  }
});
