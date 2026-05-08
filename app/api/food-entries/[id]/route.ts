import { NextResponse } from "next/server";
import { deleteFoodEntry, getDailySummary, getFoodEntryById, isDatabaseConfigured, updateFoodEntry } from "@/lib/repository";
import { foodEntrySchema } from "@/lib/validation";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Params) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const payload = await request.json();
  const parsed = foodEntrySchema.partial().safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { id } = await context.params;
  const updated = await updateFoodEntry(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Food entry not found" }, { status: 404 });
  }

  const summary = await getDailySummary(updated.date);
  return NextResponse.json({ entry: updated, summary });
}

export async function DELETE(request: Request, context: Params) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const { id } = await context.params;
  const existing = await getFoodEntryById(id);
  const requestedDate = new URL(request.url).searchParams.get("date");
  const summaryDate = existing?.date ?? requestedDate;

  const deleted = await deleteFoodEntry(id);
  if (!deleted) {
    return NextResponse.json({ error: "Food entry not found" }, { status: 404 });
  }

  const summary = summaryDate ? await getDailySummary(summaryDate) : null;

  return NextResponse.json({
    deleted: true,
    id,
    summary
  });
}
