import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/supabase";

export interface AppUser {
  clerk_user_id: string;
  email: string | null;
  name: string | null;
  mobile_number: string | null;
}

/** Returns the Clerk user id from the verified session, or null. Never reads ids from the request. */
export async function requireUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/** Loads the user's row, creating it from Clerk profile data on first login. */
export async function getOrCreateUser(clerkUserId: string): Promise<AppUser> {
  const supabase = db();
  const cols = "clerk_user_id,email,name,mobile_number";
  const { data: existing, error } = await supabase
    .from("users")
    .select(cols)
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle<AppUser>();
  if (error) throw error;
  if (existing) return existing;

  const cu = await currentUser();
  const { data, error: insertError } = await supabase
    .from("users")
    .upsert(
      {
        clerk_user_id: clerkUserId,
        email: cu?.primaryEmailAddress?.emailAddress ?? null,
        name: [cu?.firstName, cu?.lastName].filter(Boolean).join(" ") || null,
      },
      { onConflict: "clerk_user_id", ignoreDuplicates: false },
    )
    .select(cols)
    .single<AppUser>();
  if (insertError) throw insertError;
  return data;
}
