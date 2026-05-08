"use client";

import { useState } from "react";
import type { DailySummaryRecord, FoodEntryRecord } from "@/lib/types";

const mealLabels: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐"
};

const mealOrder = ["breakfast", "lunch", "dinner", "snack"] as const;

type FoodEntryListProps = {
  date: string;
  entries: FoodEntryRecord[];
  onSummaryChange?: (summary: DailySummaryRecord | null | undefined) => void;
};

export function FoodEntryList({ date, entries, onSummaryChange }: FoodEntryListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftCalories, setDraftCalories] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: true,
    snack: true
  });

  const groupedEntries = mealOrder.map((mealType) => ({
    mealType,
    items: entries.filter((entry) => entry.mealType === mealType),
    totalKcal: entries.filter((entry) => entry.mealType === mealType).reduce((sum, entry) => sum + entry.caloriesKcal, 0)
  }));

  async function removeEntry(id: string) {
    setBusyId(id);
    const response = await fetch(`/api/food-entries/${id}?date=${date}`, { method: "DELETE" });
    const data = await response.json();
    setBusyId(null);

    if (response.ok) {
      onSummaryChange?.(data.summary);
    }
  }

  async function saveCalories(entry: FoodEntryRecord) {
    const nextCalories = Number(draftCalories[entry.id] ?? entry.caloriesKcal);
    setBusyId(entry.id);

    const response = await fetch(`/api/food-entries/${entry.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        caloriesKcal: nextCalories
      })
    });

    const data = await response.json();
    setBusyId(null);

    if (response.ok) {
      setEditingId(null);
      onSummaryChange?.(data.summary);
    }
  }

  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Entries</p>
          <h2 className="mt-2 text-2xl font-semibold">今日食物记录</h2>
        </div>
        <p className="text-sm text-ink/55">来源保留 manual / database / ai</p>
      </div>

      <div className="mt-6 space-y-3">
        {groupedEntries.map((group) => (
          <section key={group.mealType} className="rounded-[24px] border border-ink/10 bg-sand/35">
            <button
              className="flex w-full items-center justify-between px-4 py-4 text-left"
              onClick={() =>
                setOpenSections((current) => ({
                  ...current,
                  [group.mealType]: !current[group.mealType]
                }))
              }
              type="button"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-ink/40">{mealLabels[group.mealType]}</p>
                <p className="mt-1 text-lg font-semibold">
                  {group.items.length} 条记录 · {group.totalKcal} kcal
                </p>
              </div>
              <span className="text-sm text-ink/55">{openSections[group.mealType] ? "收起" : "展开"}</span>
            </button>

            {openSections[group.mealType] ? (
              <div className="space-y-3 px-4 pb-4">
                {group.items.length === 0 ? (
                  <p className="rounded-[20px] bg-white/70 px-4 py-4 text-sm text-ink/55">这一餐还没有记录。</p>
                ) : null}

                {group.items.map((entry) => (
                  <article
                    key={entry.id}
                    className="grid gap-3 rounded-[24px] border border-ink/10 bg-white/70 p-4 md:grid-cols-[0.8fr_1fr_0.8fr_0.5fr_0.8fr]"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink/40">{mealLabels[entry.mealType]}</p>
                      <p className="mt-2 text-lg font-semibold">{entry.foodName}</p>
                    </div>
                    <p className="self-end text-sm text-ink/65">
                      {entry.amountValue}
                      {entry.amountUnit}
                    </p>
                    {editingId === entry.id ? (
                      <label className="self-end">
                        <input
                          className="w-28 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none"
                          defaultValue={entry.caloriesKcal}
                          onChange={(event) => setDraftCalories((current) => ({ ...current, [entry.id]: event.target.value }))}
                          type="number"
                        />
                      </label>
                    ) : (
                      <p className="self-end text-lg font-semibold">{entry.caloriesKcal} kcal</p>
                    )}
                    <p className="self-end text-sm uppercase tracking-[0.14em] text-ink/45">{entry.sourceType}</p>
                    <div className="flex items-end justify-end gap-2">
                      {editingId === entry.id ? (
                        <button
                          className="rounded-full border border-ink/15 px-3 py-2 text-xs"
                          disabled={busyId === entry.id}
                          onClick={() => saveCalories(entry)}
                          type="button"
                        >
                          保存
                        </button>
                      ) : (
                        <button
                          className="rounded-full border border-ink/15 px-3 py-2 text-xs"
                          onClick={() => setEditingId(entry.id)}
                          type="button"
                        >
                          编辑
                        </button>
                      )}
                      <button
                        className="rounded-full border border-ink/15 px-3 py-2 text-xs text-clay"
                        disabled={busyId === entry.id}
                        onClick={() => removeEntry(entry.id)}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
