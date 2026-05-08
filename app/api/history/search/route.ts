import { NextResponse } from "next/server";
import { searchHistoryEntries } from "@/lib/repository";
import { sampleHistorySearch } from "@/lib/sample-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Number(searchParams.get("limit") || "20");

  if (!q) {
    return NextResponse.json({ items: [] });
  }

  const items = await searchHistoryEntries(q, limit);
  return NextResponse.json({
    items: items.length > 0 ? items : sampleHistorySearch.filter((item) => item.foodName.includes(q)).slice(0, limit)
  });
}
