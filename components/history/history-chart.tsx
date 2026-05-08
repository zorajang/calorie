import type { HistoryPoint } from "@/lib/types";

function buildLine(points: number[], width: number, height: number, maxValue: number) {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - (value / Math.max(maxValue, 1)) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function HistoryChart({ points }: { points: HistoryPoint[] }) {
  const width = 640;
  const height = 220;
  const maxValue = Math.max(...points.flatMap((point) => [point.consumedKcal, point.targetIntakeKcal, 1]));
  const consumedPath = buildLine(
    points.map((point) => point.consumedKcal),
    width,
    height,
    maxValue
  );
  const targetPath = buildLine(
    points.map((point) => point.targetIntakeKcal),
    width,
    height,
    maxValue
  );

  return (
    <section className="rounded-[32px] border border-ink/10 bg-white/80 p-5 shadow-[0_20px_60px_rgba(26,24,22,0.06)] md:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-clay">Calories</p>
          <h2 className="mt-2 text-2xl font-semibold">摄入 vs 目标</h2>
        </div>
        <div className="flex gap-4 text-sm text-ink/60">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-clay" />摄入</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-moss" />目标</span>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg className="w-full min-w-[620px]" viewBox={`0 0 ${width} ${height + 36}`} fill="none">
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={height - height * ratio}
              y2={height - height * ratio}
              stroke="rgba(26,24,22,0.08)"
              strokeDasharray="6 6"
            />
          ))}
          <path d={targetPath} stroke="#6f8b4e" strokeWidth="4" strokeLinecap="round" />
          <path d={consumedPath} stroke="#c86a3c" strokeWidth="4" strokeLinecap="round" />
          {points.map((point, index) => {
            const x = (index / Math.max(points.length - 1, 1)) * width;
            const consumedY = height - (point.consumedKcal / Math.max(maxValue, 1)) * height;
            return (
              <g key={point.date}>
                <circle cx={x} cy={consumedY} fill="#c86a3c" r="5" />
                <text x={x} y={height + 24} fill="rgba(26,24,22,0.65)" fontSize="12" textAnchor="middle">
                  {point.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-4 text-sm text-ink/60">看这条图主要是确认自己有没有长期吃超或吃太少，而不是看某一天的波动。</p>
    </section>
  );
}
