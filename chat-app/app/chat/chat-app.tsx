"use client";

import { UserButton } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteConversation,
  listConversations,
  loadMessages,
  streamMessage,
} from "@/lib/chat-client";
import type { ChatMessage, Conversation } from "@/lib/types";

export default function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshConversations = useCallback(async () => {
    try {
      setConversations(await listConversations());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load conversations");
    }
  }, []);

  useEffect(() => {
    void refreshConversations();
  }, [refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function openConversation(id: string) {
    setSidebarOpen(false);
    setActiveId(id);
    setError(null);
    try {
      setMessages(await loadMessages(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages");
    }
  }

  function newChat() {
    setActiveId(undefined);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  }

  async function removeConversation(id: string) {
    try {
      await deleteConversation(id);
      if (id === activeId) newChat();
      await refreshConversations();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    try {
      const id = await streamMessage({ conversationId: activeId, message: text }, (chunk) =>
        setMessages((m) => {
          const copy = [...m];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = { ...last, content: last.content + chunk };
          return copy;
        }),
      );
      if (id) setActiveId(id);
      await refreshConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((m) => (m[m.length - 1]?.content === "" ? m.slice(0, -1) : m));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-neutral-200 bg-neutral-50 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            + New chat
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded-lg ${c.id === activeId ? "bg-neutral-200" : "hover:bg-neutral-100"}`}
            >
              <button
                onClick={() => void openConversation(c.id)}
                className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm"
                title={c.title}
              >
                {c.title}
              </button>
              <button
                onClick={() => void removeConversation(c.id)}
                aria-label={`Delete ${c.title}`}
                className="px-2 text-neutral-400 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
          {conversations.length === 0 && <p className="px-3 py-2 text-sm text-neutral-500">No conversations yet</p>}
        </nav>
        <div className="border-t border-neutral-200 p-3">
          <UserButton />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-neutral-200 px-3 py-2 md:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open conversations" className="rounded p-2 hover:bg-neutral-100">
            ☰
          </button>
          <span className="text-sm font-medium">Chat</span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {messages.length === 0 && (
              <p className="pt-24 text-center text-neutral-500">How can I help you today?</p>
            )}
            {messages.map((m, i) => (
              <div key={m.id ?? i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-900"
                  }`}
                >
                  {m.content || (sending && i === messages.length - 1 ? <span className="animate-pulse">Thinking…</span> : null)}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-neutral-200 p-3">
          <div className="mx-auto max-w-3xl">
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <form onSubmit={onSubmit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
                rows={1}
                maxLength={4000}
                placeholder="Send a message"
                className="max-h-40 min-h-[42px] flex-1 resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
