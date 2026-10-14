import type { ChatMessage, Conversation } from "@/lib/types";

/** Browser-side client for this app's own API routes. Contains no chatbot logic. */

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function listConversations(): Promise<Conversation[]> {
  const data = await json<{ conversations: Conversation[] }>(await fetch("/api/conversations"));
  return data.conversations;
}

export async function loadMessages(conversationId: string): Promise<ChatMessage[]> {
  const data = await json<{ messages: ChatMessage[] }>(await fetch(`/api/conversations/${conversationId}`));
  return data.messages;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await json(await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" }));
}

/**
 * Sends a message and streams the assistant reply through onChunk.
 * Returns the conversation id (created server-side for new chats).
 */
export async function streamMessage(
  args: { conversationId?: string; message: string; signal?: AbortSignal },
  onChunk: (text: string) => void,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: args.conversationId, message: args.message }),
    signal: args.signal,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  const conversationId = res.headers.get("X-Conversation-Id") ?? args.conversationId ?? "";
  if (!res.body) throw new Error("Empty response");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onChunk(text);
  }
  return conversationId;
}
