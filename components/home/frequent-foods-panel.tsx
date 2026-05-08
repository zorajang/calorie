"use client";

import { useEffect, useMemo, useState } from "react";
import type { FoodEstimateItem, FrequentFoodItem } from "@/lib/types";

type FrequentFoodsPanelProps = {
  items: FrequentFoodItem[];
  onQuickUse: (items: FoodEstimateItem[]) => Promise<void> | void;
};

const pinnedStorageKey = "calorie-pinned-foods";

export function FrequentFoodsPanel({ items, onQuickUse }: FrequentFoodsPanelProps) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pinnedKeys, setPinnedKeys] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(pinnedStorageKey);
    if (!stored) {
      return;
    }

    try {
      setPinnedKeys(JSON.parse(stored));
    } catch {
      setPinnedKeys([]);
    }
  }, []);

  const sortedItems = useMemo(() => {
    return [...items].sort((left, right) => {
      const leftKey = `${left.foodName}-${left.amountValue}-${left.amountUnit}`;
      const rightKey = `${right.foodName}-${right.amountValue}-${right.amountUnit}`;
      const leftPinned = pinnedKeys.includes(leftKey) ? 1 : 0;
      const rightPinned = pinnedKeys.includes(rightKey) ? 1 : 0;
      if (leftPinned !== rightPinned) {
        return rightPinned - leftPinned;
      }
      return right.useCount - left.useCount;
    });
  }, [items, pinnedKeys]);

  async function handleUse(item: FrequentFoodItem) {
    const key = `${item.foodName}-${item.amountValue}-${item.amountUnit}`;
    setBusyKey(key);
    await onQuickUse([
      {
        foodName: item.foodName,
        amountValue: item.amountValue,
        amountUnit: item.amountUnit,
        caloriesKcal: item.caloriesKcal,
        sourceNote: `Quick add from frequent foods`,
        confidence: 1,
        sourceType: item.sourceType
      }
    ]);
    setBusyKey(null);
  }

  function togglePinned(item: FrequentFoodItem) {
    const key = `${item.foodName}-${item.amountValue}-${item.amountUnit}`;
    setPinnedKeys((current) => {
      const next = current.includes(key) ? current.filter((value) => value !== key) : [key, ...current];
      window.localStorage.setItem(pinnedStorageKey, JSON.stringify(next));
      return next;
    });
  }

  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/75 p-5 shadow-[0_20px_60px_rgba(26,24,22,0.06)] md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Frequent</p>
          <h2 className="mt-2 text-2xl font-semibold">常吃食物</h2>
        </div>
        <p className="text-sm text-ink/55">支持置顶</p>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {sortedItems.map((item) => {
          const key = `${item.foodName}-${item.amountValue}-${item.amountUnit}`;
          return (
            <article key={key} className="rounded-[24px] border border-ink/10 bg-sand/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{item.foodName}</p>
                  <p className="mt-2 text-sm text-ink/65">
                    {item.amountValue}
                    {item.amountUnit} · {item.caloriesKcal} kcal
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-ink/40">
                    used {item.useCount} · last {item.lastUsedDate}
                  </p>
                </div>
                <button
                  className={`rounded-full px-3 py-1 text-xs ${pinnedKeys.includes(key) ? "bg-ink text-white" : "border border-ink/15 text-ink/60"}`}
                  onClick={() => togglePinned(item)}
                  type="button"
                >
                  {pinnedKeys.includes(key) ? "已置顶" : "置顶"}
                </button>
              </div>
              <button
                className="mt-4 rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm"
                disabled={busyKey === key}
                onClick={() => handleUse(item)}
                type="button"
              >
                一键加入今天
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
