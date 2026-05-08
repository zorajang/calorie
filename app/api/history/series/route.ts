import { NextResponse } from "next/server";
import { getHistorySeries, getWeightTrend } from "@/lib/repository";
import { sampleHistorySeries, sampleWeightTrend } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDays = Number(searchParams.get("days") || "7");
  const days = [7, 14, 30].includes(requestedDays) ? requestedDays : 7;

  const [calorieSeries, weightSeries] = await Promise.all([getHistorySeries(days), getWeightTrend(days)]);

  return NextResponse.json({
    calorieSeries: calorieSeries.length > 0 ? calorieSeries : sampleHistorySeries,
    weightSeries: weightSeries.length > 0 ? weightSeries : sampleWeightTrend
  });
}
