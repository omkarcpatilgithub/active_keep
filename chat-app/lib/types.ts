export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id?: string;
  role: Role;
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}
