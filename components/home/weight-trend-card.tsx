import type { WeightTrendPoint } from "@/lib/types";

function buildPath(
  points: WeightTrendPoint[],
  width: number,
  height: number,
  min: number,
  max: number,
  paddingX: number,
  paddingY: number
) {
  if (points.length === 0) {
    return "";
  }

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

export function WeightTrendCard({ points }: { points: WeightTrendPoint[] }) {
  if (points.length === 0) {
    return null;
  }

  const width = 360;
  const height = 168;
  const paddingX = 20;
  const paddingY = 18;
  const weights = points.map((point) => point.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const path = buildPath(points, width, height, min, max, paddingX, paddingY);
  const delta = Number((points[points.length - 1].weightKg - points[0].weightKg).toFixed(1));
  const hasTrend = points.length > 1;

  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-[0_20px_60px_rgba(26,24,22,0.06)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Weight Trend</p>
          <h2 className="mt-2 text-2xl font-semibold">体重变化</h2>
        </div>
        <p className="text-sm text-ink/55">
          {points[0].weightKg}kg {"->"} {points[points.length - 1].weightKg}kg
        </p>
      </div>

      {hasTrend ? (
        <div className="mt-5 overflow-x-auto">
          <svg className="w-full min-w-[340px]" viewBox={`0 0 ${width} ${height + 28}`} fill="none">
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1={paddingX}
                x2={width - paddingX}
                y1={paddingY + (height - paddingY * 2) * ratio}
                y2={paddingY + (height - paddingY * 2) * ratio}
                stroke="rgba(26,24,22,0.08)"
                strokeDasharray="5 6"
              />
            ))}
            <path d={path} stroke="#6f8b4e" strokeLinecap="round" strokeWidth="4" />
            {points.map((point, index) => {
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
      ) : (
        <div className="mt-5 rounded-[24px] bg-sand/70 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Today Snapshot</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-semibold leading-none">{points[0].weightKg} kg</p>
              <p className="mt-2 text-sm text-ink/60">{points[0].date}</p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white">
              <div className="h-5 w-5 rounded-full bg-moss" />
            </div>
          </div>
          <p className="mt-4 text-sm text-ink/60">目前只有 1 条体重记录，新增更多日期后这里会自动切换成趋势图。</p>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-[22px] bg-sand p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">区间变化</p>
          <p className="mt-2 text-xl font-semibold">{delta <= 0 ? `${delta} kg` : `+${delta} kg`}</p>
        </div>
        <div className="rounded-[22px] bg-sand p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">记录天数</p>
          <p className="mt-2 text-xl font-semibold">{points.length} 天</p>
        </div>
      </div>
    </section>
  );
}
