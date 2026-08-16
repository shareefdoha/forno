-- ═══════════════════════════════════════════════════════════════════════
-- FORNO — schema
-- Run this FIRST in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ───────────────────────────── categories ─────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- 'pasta', 'pizza' … used in the URL/tabs
  name_en     text not null,
  name_ar     text not null default '',
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ───────────────────────────── menu_items ─────────────────────────────
create table if not exists public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.categories (id) on delete cascade,
  name_en         text not null,
  name_ar         text not null default '',
  description_en  text not null default '',
  description_ar  text not null default '',
  price           numeric(10, 2) not null default 0 check (price >= 0),
  image_url       text,          -- public URL rendered by the site
  image_path      text,          -- object path inside the Storage bucket (so we can delete it)
  is_enabled      boolean not null default true,   -- Enabled / Disabled toggle in the CMS
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists menu_items_category_idx on public.menu_items (category_id);
create index if not exists menu_items_sort_idx     on public.menu_items (category_id, sort_order);
create index if not exists categories_sort_idx     on public.categories (sort_order);

-- keep updated_at honest
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists menu_items_touch_updated_at on public.menu_items;
create trigger menu_items_touch_updated_at
  before update on public.menu_items
  for each row execute function public.touch_updated_at();

-- ═══════════════════════════ Row Level Security ═══════════════════════
-- Anyone (the anon key used by the public site) may READ.
-- Only a signed-in user (the owner, created in Auth) may WRITE.

alter table public.categories enable row level security;
alter table public.menu_items enable row level security;

drop policy if exists "categories are public readable" on public.categories;
create policy "categories are public readable"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "categories writable by authenticated" on public.categories;
create policy "categories writable by authenticated"
  on public.categories for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "menu items are public readable" on public.menu_items;
create policy "menu items are public readable"
  on public.menu_items for select
  to anon, authenticated
  using (true);

drop policy if exists "menu items writable by authenticated" on public.menu_items;
create policy "menu items writable by authenticated"
  on public.menu_items for all
  to authenticated
  using (true)
  with check (true);
