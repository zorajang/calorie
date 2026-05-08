import type { WeightLogRecord } from "@/lib/types";

export function RecentWeightList({ items }: { items: WeightLogRecord[] }) {
  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/75 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-clay">Weight History</p>
        <h2 className="mt-2 text-2xl font-semibold">最近体重记录</h2>
      </div>
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <article key={item.id} className="flex items-center justify-between rounded-[22px] border border-ink/10 bg-sand/70 px-4 py-4">
            <p className="text-sm text-ink/60">{item.date}</p>
            <p className="text-lg font-semibold">{item.weightKg} kg</p>
          </article>
        ))}
      </div>
    </section>
  );
}
