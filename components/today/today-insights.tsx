import type { DailySummaryRecord } from "@/lib/types";

const mealLabels: Record<DailySummaryRecord["entries"][number]["mealType"], string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐"
};

export function TodayInsights({ summary }: { summary: DailySummaryRecord }) {
  const meals = ["breakfast", "lunch", "dinner", "snack"].map((mealType) => {
    const total = summary.entries
      .filter((entry) => entry.mealType === mealType)
      .reduce((sum, entry) => sum + entry.caloriesKcal, 0);

    return {
      mealType: mealType as DailySummaryRecord["entries"][number]["mealType"],
      total,
      ratio: summary.consumedKcal > 0 ? Math.round((total / summary.consumedKcal) * 100) : 0
    };
  });

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <article className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
        <p className="text-sm uppercase tracking-[0.2em] text-clay">Signals</p>
        <h2 className="mt-2 text-2xl font-semibold">今日判断</h2>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-[24px] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">状态</p>
            <p className="mt-2 text-lg font-semibold">{summary.remainingKcal >= 0 ? "还在目标内" : "已经超出目标"}</p>
          </div>
          <div className="rounded-[24px] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">建议</p>
            <p className="mt-2 text-lg font-semibold">
              {summary.remainingKcal >= 250 ? "晚餐仍有空间" : summary.remainingKcal >= 0 ? "控制加餐即可" : "后续餐次要收紧"}
            </p>
          </div>
          <div className="rounded-[24px] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">目标缺口策略</p>
            <p className="mt-2 text-lg font-semibold">优先盯住“剩余可吃”</p>
          </div>
          <div className="rounded-[24px] bg-sand p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">辅助参考</p>
            <p className="mt-2 text-lg font-semibold">按消耗缺口只作估算</p>
          </div>
        </div>
      </article>

      <article className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
        <p className="text-sm uppercase tracking-[0.2em] text-clay">Meal Split</p>
        <h2 className="mt-2 text-2xl font-semibold">餐次热量分布</h2>
        <div className="mt-6 space-y-4">
          {meals.map((meal) => (
            <div key={meal.mealType}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink/70">{mealLabels[meal.mealType]}</span>
                <span className="font-medium text-ink/80">
                  {meal.total} kcal · {meal.ratio}%
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-sand">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-500"
                  style={{ width: `${meal.ratio}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
