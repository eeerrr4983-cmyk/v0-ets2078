-- Create storage buckets for file uploads
insert into storage.buckets (id, name, public)
values 
  ('profile-images', 'profile-images', true),
  ('school-record-images', 'school-record-images', false),
  ('activity-images', 'activity-images', false)
on conflict (id) do nothing;

-- Storage policies for profile-images (public)
create policy "profile_images_select_all"
  on storage.objects for select
  using (bucket_id = 'profile-images');

create policy "profile_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_images_update_own"
  on storage.objects for update
  using (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "profile_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'profile-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for school-record-images (private)
create policy "school_record_images_select_own"
  on storage.objects for select
  using (
    bucket_id = 'school-record-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "school_record_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'school-record-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "school_record_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'school-record-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for activity-images (private)
create policy "activity_images_select_own"
  on storage.objects for select
  using (
    bucket_id = 'activity-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "activity_images_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'activity-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "activity_images_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'activity-images' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );
