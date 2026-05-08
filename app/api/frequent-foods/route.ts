import { NextResponse } from "next/server";
import { getFrequentFoods } from "@/lib/repository";
import { sampleFrequentFoods } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") || "6");
  const items = await getFrequentFoods(limit);

  return NextResponse.json({
    items: items.length > 0 ? items : sampleFrequentFoods.slice(0, limit)
  });
}
