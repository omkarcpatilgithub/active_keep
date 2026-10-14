# Chat app

Next.js (App Router) + TypeScript + Tailwind + Clerk (Google SSO) + Supabase Postgres.
The chatbot itself is a separate service; this app only talks to it through `lib/chat-api.ts`.

## Local setup

1. Install Node.js 20+ and run:
   ```bash
   cd chat-app
   npm install
   cp .env.example .env.local   # then fill in values
   npm run dev
   ```
2. Checks: `npm run typecheck`, `npm run lint`, `npm run build`.

## Clerk

1. Create an application at https://dashboard.clerk.com.
2. User & Authentication -> Social connections -> enable **Google** (use Clerk's dev credentials for development; add your own Google OAuth client for production).
3. API Keys: copy the publishable key to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and the secret key to `CLERK_SECRET_KEY`.
4. Paths: sign-in URL `/sign-in`. For production, add your Vercel domain under Domains.

## Supabase

1. Create a project at https://supabase.com.
2. SQL Editor -> run `supabase/migrations/0001_init.sql`.
3. Project Settings -> API: copy the URL to `NEXT_PUBLIC_SUPABASE_URL` and the **service_role** key to `SUPABASE_SERVICE_ROLE_KEY`.
   The key is used only in server code (`lib/supabase.ts`, marked `server-only`). RLS is enabled with no policies, so the public API cannot read the tables.

## Vercel

1. Push the repo and import it in Vercel (set Root Directory to `chat-app` if nested).
2. Add all variables from `.env.example` in Project Settings -> Environment Variables.
3. Deploy, then add the Vercel domain in Clerk.

## Connecting the external chatbot API

Only `lib/chat-api.ts` changes. Set `CHAT_API_URL` (and optionally `CHAT_API_KEY`); when empty, the mock is used.
Contract:

- `POST CHAT_API_URL` with JSON `{ user: {id,email,name,mobileNumber}, conversationId, messages: [{role,content}] }`
- Respond with a streamed text body, or JSON `{ "reply": "..." }`.

Flow: browser -> `/api/chat` (Clerk session verified, history saved to Supabase) -> `sendMessage()` -> chatbot API.

## Security notes

- `clerk_user_id` always comes from the verified Clerk session, never from the request.
- Every query on conversations/messages is scoped to that id.
- Input is validated with zod; the mobile number is validated server-side (E.164) and stored only in Supabase.
