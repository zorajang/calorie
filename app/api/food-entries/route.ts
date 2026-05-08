import { NextResponse } from "next/server";
import { createFoodEntry, getDailySummary, isDatabaseConfigured } from "@/lib/repository";
import { foodEntrySchema } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const payload = await request.json();
  const parsed = foodEntrySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entry = await createFoodEntry(parsed.data);
  const summary = await getDailySummary(parsed.data.date);

  return NextResponse.json(
    {
      entry,
      summary
    },
    { status: 201 }
  );
}
