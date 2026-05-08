import Link from "next/link";
import { PageShell } from "@/components/common/page-shell";
import { HistoryChart } from "@/components/history/history-chart";
import { HistorySearchForm } from "@/components/history/history-search-form";
import { HistorySearchResults } from "@/components/history/history-search-results";
import { HistoryStats } from "@/components/history/history-stats";
import { WeightHistoryChart } from "@/components/history/weight-history-chart";
import { getHistorySeries, getWeightTrend, searchHistoryEntries } from "@/lib/repository";
import { sampleHistorySearch, sampleHistorySeries, sampleWeightTrend } from "@/lib/sample-data";

export default async function HistoryPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string; range?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const requestedRange = Number(params?.range ?? "7");
  const days = [7, 14, 30].includes(requestedRange) ? requestedRange : 7;
  const points = (await getHistorySeries(days)) || sampleHistorySeries;
  const safePoints = points.length > 0 ? points : sampleHistorySeries;
  const weightPoints = (await getWeightTrend(days === 30 ? 30 : 14)) || sampleWeightTrend;
  const safeWeightPoints = weightPoints.length > 0 ? weightPoints : sampleWeightTrend;
  const results = query ? await searchHistoryEntries(query, 20) : [];
  const safeResults = query && results.length === 0 ? sampleHistorySearch.filter((item) => item.foodName.includes(query)) : results;

  return (
    <PageShell
      actions={
        <Link className="inline-flex rounded-full border border-ink/15 bg-white/70 px-4 py-2 text-sm" href="/">
          返回首页
        </Link>
      }
      description="这里看近阶段的真实摄入与体重变化，优先用来判断你记录是否稳定、缺口是否过大。"
      eyebrow="Trend"
      title="历史趋势"
    >
      <HistorySearchForm initialRange={days} />
      <HistoryStats points={safePoints} />
      <section className="grid gap-6 xl:grid-cols-2">
        <HistoryChart points={safePoints} />
        <WeightHistoryChart points={safeWeightPoints} />
      </section>
      <HistorySearchResults items={safeResults} query={query} />
    </PageShell>
  );
}
