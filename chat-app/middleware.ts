import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher(["/", "/sign-in(.*)"]);
const isApi = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;
  const { userId, redirectToSignIn } = await auth();
  if (userId) return;
  if (isApi(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return redirectToSignIn({ returnBackUrl: req.url });
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
