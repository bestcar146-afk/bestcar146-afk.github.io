create table if not exists public.saved_vehicles (
 user_id uuid not null references auth.users(id) on delete cascade,
 vehicle_id text not null check(length(vehicle_id)<=120),
 saved_at timestamptz not null default now(),
 summary jsonb not null check(jsonb_typeof(summary)='object' and octet_length(summary::text)<=12000),
 snapshot jsonb not null check(jsonb_typeof(snapshot)='object' and octet_length(snapshot::text)<=500000),
 primary key(user_id,vehicle_id)
);
create index if not exists saved_vehicles_user_date on public.saved_vehicles(user_id,saved_at desc,vehicle_id);
alter table public.saved_vehicles enable row level security;
grant select,insert,update,delete on public.saved_vehicles to authenticated;
create policy saved_vehicles_owner on public.saved_vehicles for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('saved-vehicle-previews','saved-vehicle-previews',false,2097152,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy saved_preview_read on storage.objects for select to authenticated using(bucket_id='saved-vehicle-previews' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy saved_preview_insert on storage.objects for insert to authenticated with check(bucket_id='saved-vehicle-previews' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy saved_preview_update on storage.objects for update to authenticated using(bucket_id='saved-vehicle-previews' and (storage.foldername(name))[1]=(select auth.uid())::text) with check(bucket_id='saved-vehicle-previews' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy saved_preview_delete on storage.objects for delete to authenticated using(bucket_id='saved-vehicle-previews' and (storage.foldername(name))[1]=(select auth.uid())::text);
