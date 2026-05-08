import Link from "next/link";
import { PageShell } from "@/components/common/page-shell";
import { HomeDashboard } from "@/components/home/home-dashboard";
import { getTodayDate } from "@/lib/date";
import { getDailySummary, getFrequentFoods, getWeightTrend } from "@/lib/repository";
import { sampleFrequentFoods, sampleSummary, sampleWeightTrend } from "@/lib/sample-data";

export default async function HomePage() {
  const summary = (await getDailySummary(getTodayDate())) ?? sampleSummary;
  const frequentFoods = (await getFrequentFoods(4)) || sampleFrequentFoods;
  const safeFrequentFoods = frequentFoods.length > 0 ? frequentFoods : sampleFrequentFoods;
  const weightTrend = (await getWeightTrend(8)) || sampleWeightTrend;
  const safeWeightTrend = weightTrend.length > 0 ? weightTrend : sampleWeightTrend;

  return (
    <PageShell
      actions={
        <nav className="flex gap-3 text-sm">
          <Link className="rounded-full border border-ink/15 bg-white/70 px-4 py-2" href="/settings">
            设置
          </Link>
          <Link className="rounded-full border border-ink/15 bg-white/70 px-4 py-2" href="/history">
            历史
          </Link>
        </nav>
      }
      description="先把目标算准，再把记录做快。核心只盯住今天还能吃多少，其他信息都退到辅助层。"
      eyebrow="Daily Fuel"
      title="今天的热量记录"
    >
      <HomeDashboard frequentFoods={safeFrequentFoods} initialSummary={summary} weightTrend={safeWeightTrend} />
    </PageShell>
  );
}
