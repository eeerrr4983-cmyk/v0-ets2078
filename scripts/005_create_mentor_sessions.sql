-- Create mentor_sessions table for AI mentoring history
create table if not exists public.mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  context jsonb,
  helpful boolean,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.mentor_sessions enable row level security;

-- RLS Policies
create policy "mentor_sessions_select_own"
  on public.mentor_sessions for select
  using (auth.uid() = user_id);

create policy "mentor_sessions_insert_own"
  on public.mentor_sessions for insert
  with check (auth.uid() = user_id);

create policy "mentor_sessions_update_own"
  on public.mentor_sessions for update
  using (auth.uid() = user_id);

-- Create indexes
create index mentor_sessions_user_id_idx on public.mentor_sessions(user_id);
create index mentor_sessions_created_at_idx on public.mentor_sessions(created_at desc);
