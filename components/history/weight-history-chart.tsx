import type { WeightTrendPoint } from "@/lib/types";

function buildWeightPath(points: WeightTrendPoint[], width: number, height: number, paddingX: number, paddingY: number) {
  const weights = points.map((point) => point.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(max - min, 0.1);
  const usableWidth = width - paddingX * 2;
  const usableHeight = height - paddingY * 2;

  return points
    .map((point, index) => {
      const x = paddingX + (index / Math.max(points.length - 1, 1)) * usableWidth;
      const y = paddingY + usableHeight - ((point.weightKg - min) / range) * usableHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function WeightHistoryChart({ points }: { points: WeightTrendPoint[] }) {
  if (points.length === 0) {
    return null;
  }

  const width = 640;
  const height = 200;
  const paddingX = 22;
  const paddingY = 20;
  const path = buildWeightPath(points, width, height, paddingX, paddingY);

  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(26,24,22,0.06)] md:p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-clay">Weight</p>
        <h2 className="mt-2 text-2xl font-semibold">近阶段体重变化</h2>
      </div>
      <div className="mt-6 overflow-x-auto">
        <svg className="w-full min-w-[620px]" viewBox={`0 0 ${width} ${height + 28}`} fill="none">
          <path d={path} stroke="#6f8b4e" strokeLinecap="round" strokeWidth="4" />
          {points.map((point, index) => {
            const weights = points.map((item) => item.weightKg);
            const min = Math.min(...weights);
            const max = Math.max(...weights);
            const range = Math.max(max - min, 0.1);
            const usableWidth = width - paddingX * 2;
            const usableHeight = height - paddingY * 2;
            const x = paddingX + (index / Math.max(points.length - 1, 1)) * usableWidth;
            const y = paddingY + usableHeight - ((point.weightKg - min) / range) * usableHeight;

            return (
              <g key={point.date}>
                <circle cx={x} cy={y} fill="#6f8b4e" r="4" />
                <text x={x} y={height + 18} fill="rgba(26,24,22,0.55)" fontSize="11" textAnchor="middle">
                  {point.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-4 text-sm text-ink/60">把它和左边的热量趋势一起看，才能判断当前缺口策略是否真的有效。</p>
    </section>
  );
}
