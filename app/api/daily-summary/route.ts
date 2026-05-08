import { NextResponse } from "next/server";
import { getTodayDate, isValidDateString } from "@/lib/date";
import { getDailySummary, isDatabaseConfigured } from "@/lib/repository";
import { sampleSummary } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedDate = searchParams.get("date");
  const date = requestedDate && isValidDateString(requestedDate) ? requestedDate : getTodayDate();

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      ...sampleSummary,
      date,
      mode: "mock",
      note: "DATABASE_URL is not configured"
    });
  }

  const summary = await getDailySummary(date);
  if (!summary) {
    return NextResponse.json(
      {
        error: "No daily target found for this date. Save your profile first."
      },
      { status: 404 }
    );
  }

  return NextResponse.json(summary);
}
