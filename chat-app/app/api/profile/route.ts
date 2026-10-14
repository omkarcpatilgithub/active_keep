import { NextResponse } from "next/server";
import { getOrCreateUser, requireUserId } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { profileSchema } from "@/lib/validation";

export async function PUT(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  await getOrCreateUser(userId);
  const { error } = await db()
    .from("users")
    .update({ mobile_number: parsed.data.mobileNumber })
    .eq("clerk_user_id", userId);
  if (error) return NextResponse.json({ error: "Could not save mobile number" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
