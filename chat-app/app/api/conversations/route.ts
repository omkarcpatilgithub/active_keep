import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/supabase";

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await db()
    .from("conversations")
    .select("id,title,updated_at")
    .eq("clerk_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: "Could not load conversations" }, { status: 500 });
  return NextResponse.json({ conversations: data });
}
