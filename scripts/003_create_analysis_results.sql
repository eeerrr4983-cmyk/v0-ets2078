-- Create analysis_results table for AI analysis
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  school_record_id uuid references public.school_records(id) on delete cascade,
  analysis_type text not null check (analysis_type in ('full_analysis', 'ai_killer', 'university_prediction', 'project_recommendation')),
  input_text text not null,
  result jsonb not null,
  score integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analysis_results enable row level security;

-- RLS Policies
create policy "analysis_results_select_own"
  on public.analysis_results for select
  using (auth.uid() = user_id);

create policy "analysis_results_insert_own"
  on public.analysis_results for insert
  with check (auth.uid() = user_id);

create policy "analysis_results_delete_own"
  on public.analysis_results for delete
  using (auth.uid() = user_id);

-- Create indexes
create index analysis_results_user_id_idx on public.analysis_results(user_id);
create index analysis_results_type_idx on public.analysis_results(analysis_type);
create index analysis_results_created_at_idx on public.analysis_results(created_at desc);
