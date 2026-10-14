import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { idSchema, renameSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

async function authorize(ctx: Ctx) {
  const userId = await requireUserId();
  if (!userId) return { res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  const id = idSchema.safeParse((await ctx.params).id);
  if (!id.success) return { res: NextResponse.json({ error: "Invalid id" }, { status: 400 }) } as const;
  return { userId, id: id.data } as const;
}

export async function GET(_req: Request, ctx: Ctx) {
  const a = await authorize(ctx);
  if ("res" in a) return a.res;

  const { data: convo } = await db()
    .from("conversations")
    .select("id")
    .eq("id", a.id)
    .eq("clerk_user_id", a.userId)
    .maybeSingle();
  if (!convo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await db()
    .from("messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", a.id)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: "Could not load messages" }, { status: 500 });
  return NextResponse.json({ messages: data });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const a = await authorize(ctx);
  if ("res" in a) return a.res;
  const parsed = renameSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid title" }, { status: 400 });

  const { data, error } = await db()
    .from("conversations")
    .update({ title: parsed.data.title })
    .eq("id", a.id)
    .eq("clerk_user_id", a.userId)
    .select("id");
  if (error) return NextResponse.json({ error: "Could not rename" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const a = await authorize(ctx);
  if ("res" in a) return a.res;

  const { data, error } = await db()
    .from("conversations")
    .delete()
    .eq("id", a.id)
    .eq("clerk_user_id", a.userId)
    .select("id");
  if (error) return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
