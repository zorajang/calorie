import { NextResponse } from "next/server";
import { getLatestProfile, isDatabaseConfigured, saveProfile } from "@/lib/repository";
import { profileSchema } from "@/lib/validation";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const profile = await getLatestProfile();
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  }

  const payload = await request.json();
  const parsed = profileSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await saveProfile(parsed.data);

  return NextResponse.json({
    profile: result.profile,
    dailyTarget: result.dailyTarget
  });
}
