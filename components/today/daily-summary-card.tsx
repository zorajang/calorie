import type { DailySummaryRecord } from "@/lib/types";

const numberFormat = new Intl.NumberFormat("zh-CN");

export function DailySummaryCard({ summary }: { summary: DailySummaryRecord }) {
  const consumedRatio = Math.min(100, Math.max(0, Math.round((summary.consumedKcal / Math.max(summary.targetIntakeKcal, 1)) * 100)));
  const remainingDisplay = summary.remainingKcal >= 0 ? `${numberFormat.format(summary.remainingKcal)} kcal` : `超出 ${numberFormat.format(Math.abs(summary.remainingKcal))} kcal`;
  const withinTarget = summary.remainingKcal >= 0;
  const items = [
    { label: "今日目标", value: `${numberFormat.format(summary.targetIntakeKcal)} kcal` },
    { label: "已摄入", value: `${numberFormat.format(summary.consumedKcal)} kcal` },
    { label: "剩余可吃", value: remainingDisplay }
  ];

  return (
    <section className="rounded-[36px] border border-ink/10 bg-white/75 p-6 shadow-[0_24px_80px_rgba(26,24,22,0.08)] md:p-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Today Summary</p>
          <h2 className="mt-2 text-2xl font-semibold">今天的热量总览</h2>
          <p className="mt-2 text-sm text-ink/60">今日目标 = TDEE - 你在设置中填写的热量缺口目标；剩余可吃 = 今日目标 - 已摄入。</p>
        </div>
        <p className="text-sm text-ink/55">{summary.date}</p>
      </div>

      <div
        className={`rounded-[30px] px-6 py-6 ${withinTarget ? "bg-[linear-gradient(135deg,#eef4e8_0%,#f4eee0_100%)]" : "bg-[linear-gradient(135deg,#f6e6de_0%,#f1ebe4_100%)]"}`}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className={`text-sm uppercase tracking-[0.18em] ${withinTarget ? "text-moss" : "text-clay"}`}>{withinTarget ? "今天还能吃" : "今天已经超出"}</p>
            <p className="mt-3 text-5xl font-semibold leading-none md:text-6xl">{remainingDisplay}</p>
          </div>
          <div className="min-w-[240px] lg:max-w-[380px]">
            <div className="flex items-center justify-between text-sm text-ink/60">
              <span>已吃进度 {consumedRatio}%</span>
              <span>
                {numberFormat.format(summary.consumedKcal)} / {numberFormat.format(summary.targetIntakeKcal)} kcal
              </span>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/75">
              <div
                className={`h-full rounded-full transition-all duration-500 ${withinTarget ? "bg-gradient-to-r from-moss to-clay" : "bg-gradient-to-r from-clay to-ink"}`}
                style={{ width: `${Math.min(consumedRatio, 100)}%` }}
              />
            </div>
            <p className="mt-3 text-sm text-ink/60">
              {summary.remainingKcal >= 250 ? "当前还有比较充足的空间。" : summary.remainingKcal >= 0 ? "接下来控制份量就够了。" : "已经超过今日目标，需要收紧后续摄入。"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.label} className="rounded-[28px] bg-sand p-5">
            <p className="text-sm uppercase tracking-[0.18em] text-ink/45">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold">{item.value}</p>
          </article>
        ))}
      </div>

      <details className="mt-4 rounded-[24px] border border-ink/10 bg-white/60 px-5 py-4">
        <summary className="cursor-pointer text-sm font-medium text-ink/70">查看按消耗估算缺口</summary>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          当前按消耗估算缺口为 {numberFormat.format(summary.actualDeficitKcal)} kcal。
          这个值按 `TDEE - 已摄入` 计算，只作辅助参考；日常更建议盯住“剩余可吃”。
        </p>
      </details>
    </section>
  );
}
