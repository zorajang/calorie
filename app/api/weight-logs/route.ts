import { NextResponse } from "next/server";
import { getTodayDate } from "@/lib/date";
import { getRecentWeightLogs, getWeightTrend, isDatabaseConfigured, syncProfileWeightForDate, upsertWeightLog } from "@/lib/repository";
import { sampleRecentWeightLogs, sampleWeightTrend } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || "8");
  const limit = Number(searchParams.get("limit") || "8");

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      trend: sampleWeightTrend,
      items: sampleRecentWeightLogs
    });
  }

  const [trend, items] = await Promise.all([getWeightTrend(days), getRecentWeightLogs(limit)]);

  return NextResponse.json({
    trend,
    items
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const payload = await request.json();
  const date = typeof payload.date === "string" ? payload.date : getTodayDate();
  const weightKg = Number(payload.weightKg);

  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    return NextResponse.json({ error: "weightKg must be a positive number" }, { status: 400 });
  }

  const weightLog = await upsertWeightLog(date, weightKg);
  const dailyTarget = await syncProfileWeightForDate(date, weightKg);
  const trend = await getWeightTrend(8, date);

  return NextResponse.json({
    weightLog,
    trend,
    dailyTarget
  });
}
