import { redirect } from "next/navigation";
import { getOrCreateUser, requireUserId } from "@/lib/auth";
import ChatApp from "./chat-app";

export default async function ChatPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/sign-in");
  const user = await getOrCreateUser(userId);
  if (!user.mobile_number) redirect("/onboarding");

  return <ChatApp />;
}
