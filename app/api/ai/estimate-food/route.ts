import { NextResponse } from "next/server";
import { estimateFood } from "@/lib/food-estimation";
import { estimateFoodSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = estimateFoodSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await estimateFood(parsed.data.input);
    return NextResponse.json({
      input: parsed.data.input,
      ...result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to estimate food calories";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
