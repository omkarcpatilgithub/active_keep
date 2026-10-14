import { redirect } from "next/navigation";
import { getOrCreateUser, requireUserId } from "@/lib/auth";
import OnboardingForm from "./onboarding-form";

export default async function OnboardingPage() {
  const userId = await requireUserId();
  if (!userId) redirect("/sign-in");
  const user = await getOrCreateUser(userId);
  if (user.mobile_number) redirect("/chat");

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <OnboardingForm />
    </main>
  );
}
