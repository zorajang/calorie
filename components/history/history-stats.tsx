import type { HistoryPoint } from "@/lib/types";

const numberFormat = new Intl.NumberFormat("zh-CN");

export function HistoryStats({ points }: { points: HistoryPoint[] }) {
  const averageConsumed = Math.round(points.reduce((sum, point) => sum + point.consumedKcal, 0) / Math.max(points.length, 1));
  const averageDeficit = Math.round(points.reduce((sum, point) => sum + point.actualDeficitKcal, 0) / Math.max(points.length, 1));
  const completedDays = points.filter((point) => point.entryCount > 0).length;

  const cards = [
    {
      label: "近 7 天平均摄入",
      value: `${numberFormat.format(averageConsumed)} kcal`,
      note: "看的是实际吃进去的热量，不是目标值。"
    },
    {
      label: "近 7 天平均缺口",
      value: `${numberFormat.format(averageDeficit)} kcal`,
      note: "用于判断减脂节奏是否过猛或过慢。"
    },
    {
      label: "记录完成度",
      value: `${completedDays} / ${points.length} 天`,
      note: "缺记录的日期越多，趋势判断越不稳定。"
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((item) => (
        <article key={item.label} className="rounded-[28px] border border-ink/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
          <p className="text-sm uppercase tracking-[0.2em] text-ink/45">{item.label}</p>
          <p className="mt-4 text-3xl font-semibold">{item.value}</p>
          <p className="mt-2 text-sm text-ink/60">{item.note}</p>
        </article>
      ))}
    </section>
  );
}
