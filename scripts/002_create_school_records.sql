-- Create school_records table for 생기부 data
create table if not exists public.school_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  category text not null check (category in ('자율활동', '동아리활동', '봉사활동', '진로활동', '교과세특', '행동특성')),
  grade integer check (grade >= 1 and grade <= 3),
  semester integer check (semester >= 1 and semester <= 2),
  subject text,
  image_url text,
  ocr_text text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.school_records enable row level security;

-- RLS Policies
create policy "school_records_select_own"
  on public.school_records for select
  using (auth.uid() = user_id);

create policy "school_records_insert_own"
  on public.school_records for insert
  with check (auth.uid() = user_id);

create policy "school_records_update_own"
  on public.school_records for update
  using (auth.uid() = user_id);

create policy "school_records_delete_own"
  on public.school_records for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index school_records_user_id_idx on public.school_records(user_id);
create index school_records_category_idx on public.school_records(category);

-- Updated at trigger
create trigger school_records_updated_at
  before update on public.school_records
  for each row
  execute function public.handle_updated_at();
