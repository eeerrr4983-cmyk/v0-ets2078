-- Create activities table for portfolio management
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  activity_type text not null check (activity_type in ('교내활동', '수상', '독서', '자격증', '대외활동', '프로젝트')),
  start_date date not null,
  end_date date,
  organization text,
  role text,
  achievements text[],
  skills text[],
  related_subjects text[],
  image_urls text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.activities enable row level security;

-- RLS Policies
create policy "activities_select_own"
  on public.activities for select
  using (auth.uid() = user_id);

create policy "activities_insert_own"
  on public.activities for insert
  with check (auth.uid() = user_id);

create policy "activities_update_own"
  on public.activities for update
  using (auth.uid() = user_id);

create policy "activities_delete_own"
  on public.activities for delete
  using (auth.uid() = user_id);

-- Create indexes
create index activities_user_id_idx on public.activities(user_id);
create index activities_type_idx on public.activities(activity_type);
create index activities_date_idx on public.activities(start_date desc);

-- Updated at trigger
create trigger activities_updated_at
  before update on public.activities
  for each row
  execute function public.handle_updated_at();
