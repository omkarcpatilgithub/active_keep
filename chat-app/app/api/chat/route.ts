import { NextResponse } from "next/server";
import { getOrCreateUser, requireUserId } from "@/lib/auth";
import { sendMessage } from "@/lib/chat-api";
import { db } from "@/lib/supabase";
import { chatRequestSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

const HISTORY_LIMIT = 50;

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = chatRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { message } = parsed.data;
  const supabase = db();

  const user = await getOrCreateUser(userId);
  if (!user.mobile_number) {
    return NextResponse.json({ error: "Mobile number required" }, { status: 403 });
  }

  // Resolve or create the conversation, always scoped to the session user.
  let conversationId = parsed.data.conversationId;
  if (conversationId) {
    const { data } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("clerk_user_id", userId)
      .maybeSingle();
    if (!data) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  } else {
    const title = message.length > 60 ? `${message.slice(0, 57)}...` : message;
    const { data, error } = await supabase
      .from("conversations")
      .insert({ clerk_user_id: userId, title })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not create conversation" }, { status: 500 });
    conversationId = data.id as string;
  }

  const { error: insertError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "user", content: message });
  if (insertError) return NextResponse.json({ error: "Could not save message" }, { status: 500 });

  const { data: history } = await supabase
    .from("messages")
    .select("role,content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(HISTORY_LIMIT);
  const messages = (history ?? []).reverse() as { role: "user" | "assistant" | "system"; content: string }[];

  let source: AsyncIterable<string>;
  try {
    source = await sendMessage(
      {
        user: { id: userId, email: user.email, name: user.name, mobileNumber: user.mobile_number },
        conversationId,
        messages,
      },
      req.signal,
    );
  } catch (err) {
    console.error("Chat API error", err);
    return NextResponse.json({ error: "The chat service is unavailable" }, { status: 502 });
  }

  const convoId = conversationId;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";
      try {
        for await (const chunk of source) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        console.error("Chat stream error", err);
      }
      if (full.trim()) {
        await supabase.from("messages").insert({ conversation_id: convoId, role: "assistant", content: full });
        await supabase
          .from("conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", convoId)
          .eq("clerk_user_id", userId);
      }
      try {
        controller.close();
      } catch {
        /* client disconnected */
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Conversation-Id": convoId,
    },
  });
}
