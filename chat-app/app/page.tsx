import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Landing() {
  const { userId } = await auth();
  if (userId) redirect("/chat");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Chat</h1>
      <p className="max-w-md text-neutral-600">Sign in with Google to start a conversation.</p>
      <Link
        href="/sign-in"
        className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-700"
      >
        Continue with Google
      </Link>
    </main>
  );
}
