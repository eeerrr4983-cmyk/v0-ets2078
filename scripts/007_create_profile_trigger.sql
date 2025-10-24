-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  -- Create welcome notification
  insert into public.notifications (user_id, title, message, type)
  values (
    new.id,
    '환영합니다! 🎉',
    'Huntfire에 오신 것을 환영합니다. 생기부 분석을 시작해보세요!',
    'success'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
