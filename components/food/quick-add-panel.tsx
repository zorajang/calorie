"use client";

import { useState } from "react";
import type { FoodEstimateItem } from "@/lib/types";

type QuickAddPanelProps = {
  onPersistItems: (items: FoodEstimateItem[]) => Promise<void>;
};

export function QuickAddPanel({ onPersistItems }: QuickAddPanelProps) {
  const [mode, setMode] = useState<"ai" | "manual">("ai");
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [items, setItems] = useState<FoodEstimateItem[]>([]);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mealType, setMealType] = useState<FoodEstimateItem["mealType"]>("snack");
  const [manualFoodName, setManualFoodName] = useState("");
  const [manualAmountValue, setManualAmountValue] = useState("");
  const [manualAmountUnit, setManualAmountUnit] = useState<FoodEstimateItem["amountUnit"]>("g");
  const [manualCaloriesKcal, setManualCaloriesKcal] = useState("");

  const mealOptions = [
    { value: "breakfast", label: "早餐" },
    { value: "lunch", label: "午餐" },
    { value: "dinner", label: "晚餐" },
    { value: "snack", label: "加餐" }
  ] as const;

  async function estimate() {
    setIsEstimating(true);
    setStatus("");

    const response = await fetch("/api/ai/estimate-food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    setIsEstimating(false);

    if (!response.ok) {
      setItems([]);
      setStatus(data.error || "估算失败");
      return;
    }

    setItems(data.items);
    setStatus(`已估算 ${data.totalCaloriesKcal} kcal`);
  }

  async function saveEstimate() {
    setIsSaving(true);
    setStatus("");

    try {
      await onPersistItems(items.map((item) => ({ ...item, mealType })));
      setStatus("已保存到今日记录。");
      setItems([]);
      setInput("");
    } catch {
      setStatus("保存失败");
    }

    setIsSaving(false);
  }

  async function saveManualEntry() {
    const amountValue = Number(manualAmountValue);
    const caloriesKcal = Number(manualCaloriesKcal);

    if (!manualFoodName.trim() || !Number.isFinite(amountValue) || amountValue <= 0 || !Number.isFinite(caloriesKcal) || caloriesKcal <= 0) {
      setStatus("请填写食物名、数量和 kcal。");
      return;
    }

    setIsSaving(true);
    setStatus("");

    try {
      await onPersistItems([
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
      setStatus("已手动保存到今日记录。");
      setManualFoodName("");
      setManualAmountValue("");
      setManualCaloriesKcal("");
      setManualAmountUnit("g");
    } catch {
      setStatus("手动保存失败");
    }

    setIsSaving(false);
  }

  return (
    <section className="rounded-[32px] border border-ink/10 bg-ink p-5 text-white shadow-[0_20px_60px_rgba(26,24,22,0.14)] md:p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-white/65">Quick Add</p>
      <h2 className="mt-2 text-2xl font-semibold">快速录入</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-white/72">
        先输入自然语言，再让 AI 拆解成结构化结果。第一版只保留输入和交互位置，下一步再接真实请求。
      </p>

      <form className="mt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "ai", label: "AI 估算" },
            { value: "manual", label: "手动录入" }
          ].map((option) => (
            <button
              key={option.value}
              className={`rounded-full px-4 py-2 text-sm transition ${mode === option.value ? "bg-white text-ink" : "border border-white/15 text-white/75"}`}
              onClick={() => setMode(option.value as "ai" | "manual")}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {mealOptions.map((option) => (
            <button
              key={option.value}
              className={`rounded-full px-4 py-2 text-sm transition ${mealType === option.value ? "bg-clay text-white" : "border border-white/15 text-white/75"}`}
              onClick={() => setMealType(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {mode === "ai" ? (
          <>
            <textarea
              className="min-h-36 w-full rounded-[24px] border border-white/15 bg-white/10 px-4 py-4 text-sm outline-none placeholder:text-white/45 md:min-h-40"
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如：燕麦 50g + 牛奶 250ml"
              value={input}
            />
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-clay px-5 py-3 text-sm font-medium text-white disabled:opacity-60" disabled={isEstimating || !input.trim()} onClick={estimate} type="button">
                {isEstimating ? "估算中..." : "AI 估算"}
              </button>
              <button
                className="rounded-full border border-white/18 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
                disabled={isSaving || items.length === 0}
                onClick={saveEstimate}
                type="button"
              >
                {isSaving ? "保存中..." : "确认保存"}
              </button>
            </div>
          </>
        ) : (
          <>
            <input
              className="w-full rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/45"
              onChange={(event) => setManualFoodName(event.target.value)}
              placeholder="食物名，例如：鸡蛋"
              value={manualFoodName}
            />
            <div className="grid gap-3 md:grid-cols-[1fr_0.8fr_0.8fr]">
              <input
                className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/45"
                inputMode="decimal"
                onChange={(event) => setManualAmountValue(event.target.value)}
                placeholder="数量"
                value={manualAmountValue}
              />
              <select
                className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none"
                onChange={(event) => setManualAmountUnit(event.target.value as FoodEstimateItem["amountUnit"])}
                value={manualAmountUnit}
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="serving">份</option>
                <option value="piece">个</option>
              </select>
              <input
                className="rounded-[20px] border border-white/15 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/45"
                inputMode="numeric"
                onChange={(event) => setManualCaloriesKcal(event.target.value)}
                placeholder="kcal"
                value={manualCaloriesKcal}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-clay px-5 py-3 text-sm font-medium text-white disabled:opacity-60" disabled={isSaving} onClick={saveManualEntry} type="button">
                {isSaving ? "保存中..." : "手动保存"}
              </button>
            </div>
          </>
        )}
      </form>

      <div className="mt-8 rounded-[24px] bg-white/10 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/50">Expected Output</p>
        <p className="mt-2 text-sm text-white/78">{mode === "ai" ? "先选餐次，再把估算结果保存到对应分组。" : "没有 AI 时也能直接手动录入食物、数量和 kcal。"}</p>
        {status ? <p className="mt-3 text-sm text-white">{status}</p> : null}
        {mode === "ai" && items.length > 0 ? (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <article key={`${item.foodName}-${item.amountValue}-${item.amountUnit}`} className="rounded-[20px] bg-white/10 p-3">
                <p className="text-sm font-semibold">
                  {item.foodName} {item.amountValue}
                  {item.amountUnit}
                </p>
                <p className="mt-1 text-sm text-white/78">
                  {item.caloriesKcal} kcal · confidence {item.confidence}
                </p>
                <p className="mt-1 text-xs text-white/60">{item.sourceNote}</p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
