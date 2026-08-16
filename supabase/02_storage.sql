-- ═══════════════════════════════════════════════════════════════════════
-- FORNO — Storage bucket for food photography
-- Run this SECOND, after 01_schema.sql.
--
-- If your project rejects the policy statements with "must be owner of table
-- objects", do it through the dashboard instead:
--   Storage → New bucket → name `menu-images`, tick "Public bucket"
--   Storage → Policies → New policy on `objects`:
--     • SELECT for `anon, authenticated`  → bucket_id = 'menu-images'
--     • INSERT / UPDATE / DELETE for `authenticated` → bucket_id = 'menu-images'
-- ═══════════════════════════════════════════════════════════════════════

-- Public bucket: images are readable by anyone, uploadable only when signed in.
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "menu images are public readable" on storage.objects;
create policy "menu images are public readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "menu images uploadable by authenticated" on storage.objects;
create policy "menu images uploadable by authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'menu-images');

drop policy if exists "menu images updatable by authenticated" on storage.objects;
create policy "menu images updatable by authenticated"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'menu-images')
  with check (bucket_id = 'menu-images');

drop policy if exists "menu images deletable by authenticated" on storage.objects;
create policy "menu images deletable by authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'menu-images');
