import type { HistorySearchItem } from "@/lib/types";

const mealLabels: Record<HistorySearchItem["mealType"], string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐"
};

export function HistorySearchResults({ items, query }: { items: HistorySearchItem[]; query: string }) {
  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Search Results</p>
          <h2 className="mt-2 text-2xl font-semibold">历史搜索结果</h2>
        </div>
        <p className="text-sm text-ink/55">{query ? `关键词：${query}` : "输入关键词开始搜索"}</p>
      </div>
      <div className="mt-6 space-y-3">
        {query && items.length === 0 ? <p className="text-sm text-ink/60">没有找到匹配的历史记录。</p> : null}
        {items.map((item) => (
          <article key={item.id} className="grid gap-3 rounded-[24px] border border-ink/10 bg-sand/70 p-4 md:grid-cols-[0.8fr_1fr_0.8fr_0.6fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-ink/40">{item.date}</p>
              <p className="mt-2 text-lg font-semibold">{item.foodName}</p>
            </div>
            <p className="self-end text-sm text-ink/65">
              {item.amountValue}
              {item.amountUnit}
            </p>
            <p className="self-end text-lg font-semibold">{item.caloriesKcal} kcal</p>
            <p className="self-end text-sm uppercase tracking-[0.14em] text-ink/45">
              {mealLabels[item.mealType]} · {item.sourceType}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
