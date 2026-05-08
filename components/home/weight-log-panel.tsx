"use client";

import { useState } from "react";

type WeightLogPanelProps = {
  currentDate: string;
  initialWeightKg?: number | null;
  onTrendChange: (trend: Array<{ date: string; weightKg: number }>) => void;
  onDailyTargetChange?: (targetIntakeKcal: number) => void;
};

export function WeightLogPanel({ currentDate, initialWeightKg, onTrendChange, onDailyTargetChange }: WeightLogPanelProps) {
  const [weightKg, setWeightKg] = useState(initialWeightKg ? String(initialWeightKg) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function saveWeight() {
    setIsSaving(true);
    setStatus("");

    const response = await fetch("/api/weight-logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        date: currentDate,
        weightKg: Number(weightKg)
      })
    });

    const data = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setStatus(data.error || "保存失败");
      return;
    }

    onTrendChange(data.trend);
    if (data.dailyTarget?.targetIntakeKcal) {
      onDailyTargetChange?.(data.dailyTarget.targetIntakeKcal);
    }
    setStatus("已记录今日体重。");
  }

  return (
    <section className="rounded-[32px] border border-ink/10 bg-ink p-6 text-white shadow-[0_20px_60px_rgba(26,24,22,0.14)]">
      <p className="text-sm uppercase tracking-[0.2em] text-white/65">Weight Log</p>
      <h2 className="mt-2 text-2xl font-semibold">记录今日体重</h2>
      <p className="mt-3 text-sm leading-6 text-white/72">建议每天固定时间记录，比如起床后、进食前，这样趋势更稳定。</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-base outline-none placeholder:text-white/40"
          onChange={(event) => setWeightKg(event.target.value)}
          placeholder="例如 59.8"
          step="0.1"
          type="number"
          value={weightKg}
        />
        <button
          className="rounded-full bg-clay px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          disabled={isSaving || !weightKg}
          onClick={saveWeight}
          type="button"
        >
          {isSaving ? "保存中..." : "保存体重"}
        </button>
      </div>
      <p className="mt-3 text-sm text-white/72">{status || `记录日期：${currentDate}`}</p>
    </section>
  );
}
