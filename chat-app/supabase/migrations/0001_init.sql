create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  email text,
  name text,
  mobile_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_mobile_e164 check (mobile_number is null or mobile_number ~ '^\+[1-9][0-9]{7,14}$')
);

create trigger users_set_updated_at before update on public.users
  for each row execute function public.set_updated_at();

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null references public.users (clerk_user_id) on delete cascade,
  title text not null default 'New chat' check (char_length(title) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index conversations_user_updated_idx on public.conversations (clerk_user_id, updated_at desc);

create trigger conversations_set_updated_at before update on public.conversations
  for each row execute function public.set_updated_at();

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null check (char_length(content) between 1 and 20000),
  created_at timestamptz not null default now()
);

create index messages_conversation_created_idx on public.messages (conversation_id, created_at);

-- The app talks to Postgres only from the server with the service role key,
-- which bypasses RLS. Enabling RLS with no policies blocks anon/authenticated
-- access through the public API entirely.
alter table public.users enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
