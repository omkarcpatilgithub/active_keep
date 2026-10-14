import "server-only";
import type { ChatMessage } from "@/lib/types";

/**
 * Chat API abstraction (server-side).
 *
 * The Next.js app knows nothing about LLMs, RAG or prompts. It hands the chatbot
 * service the authenticated user, the conversation id and the message history,
 * and streams back whatever text the service returns.
 *
 * To connect the real chatbot: set CHAT_API_URL (and optionally CHAT_API_KEY).
 * Contract expected from the external service:
 *   POST {CHAT_API_URL}
 *   Request JSON:  { user: {id,email,name,mobileNumber}, conversationId, messages: [{role,content}] }
 *   Response:      either a streamed text body (chunked, text/plain), or JSON { "reply": "..." }
 */

export interface ChatApiRequest {
  user: { id: string; email: string | null; name: string | null; mobileNumber: string | null };
  conversationId: string;
  messages: Pick<ChatMessage, "role" | "content">[];
}

export type ChatStream = AsyncIterable<string>;

export async function sendMessage(req: ChatApiRequest, signal?: AbortSignal): Promise<ChatStream> {
  const url = process.env.CHAT_API_URL?.trim();
  return url ? sendToExternalApi(url, req, signal) : mockSendMessage(req, signal);
}

async function sendToExternalApi(url: string, req: ChatApiRequest, signal?: AbortSignal): Promise<ChatStream> {
  const apiKey = process.env.CHAT_API_KEY?.trim();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(req),
    signal,
  });
  if (!res.ok) throw new Error(`Chat API responded with ${res.status}`);

  if ((res.headers.get("content-type") ?? "").includes("application/json")) {
    const json = (await res.json()) as { reply?: unknown };
    if (typeof json.reply !== "string") throw new Error("Chat API returned no 'reply'");
    return singleChunk(json.reply);
  }
  if (!res.body) throw new Error("Chat API returned an empty body");
  return decodeStream(res.body);
}

async function* singleChunk(text: string): ChatStream {
  yield text;
}

async function* decodeStream(body: ReadableStream<Uint8Array>): ChatStream {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) yield text;
    }
  } finally {
    reader.releaseLock();
  }
}

/** Local mock: echoes back word by word to exercise the streaming UI. */
async function* mockSendMessage(req: ChatApiRequest, signal?: AbortSignal): ChatStream {
  const last = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const reply = `This is a mock reply${req.user.name ? ` for ${req.user.name}` : ""}. You said: "${last}". Set CHAT_API_URL to connect the real chatbot.`;
  for (const word of reply.split(/(?<=\s)/)) {
    if (signal?.aborted) return;
    await new Promise((r) => setTimeout(r, 40));
    yield word;
  }
}
