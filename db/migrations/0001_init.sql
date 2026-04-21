-- Products Description Creator — initial schema
-- Run via Supabase SQL editor or `supabase db push` after linking the project.

create extension if not exists pgcrypto;

create table if not exists sessions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  ip_hash       text,
  ua_hash       text,
  email         text,
  free_used     int  not null default 0,
  paid_credits  int  not null default 0,
  flags         jsonb not null default '{}'::jsonb
);
create index if not exists sessions_email_idx   on sessions (email);
create index if not exists sessions_ip_hash_idx on sessions (ip_hash);

create table if not exists credit_logs (
  id         bigserial primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  kind       text not null check (kind in ('grant_free','grant_paid','consume','refund','adjust')),
  delta      int  not null,
  reason     text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists credit_logs_session_idx on credit_logs (session_id, created_at desc);

create table if not exists generations (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references sessions(id) on delete cascade,
  platform      text not null,
  category      text,
  template_id   text not null,
  input_photos  jsonb not null,
  input_text    text,
  output_json   jsonb not null,
  edited_json   jsonb,
  image_slots   jsonb not null default '[]'::jsonb,
  claude_usage  jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists generations_session_idx on generations (session_id, created_at desc);

-- unsplash_images: hotlinked per Unsplash TOS — never re-hosted.
-- category/slot_hint CHECK constraints mirror lib/unsplash/categories.ts.
create table if not exists unsplash_images (
  id               uuid primary key default gen_random_uuid(),
  unsplash_id      text unique not null,
  url_regular      text not null,
  url_small        text not null,
  photographer     text not null,
  photographer_url text not null,
  category         text not null check (category in (
    'food','beverage','beauty','fashion','home','kitchen',
    'electronics','outdoor','health','pet','baby','stationery','other'
  )),
  tags             text[] not null default '{}',
  slot_hint        text check (slot_hint in ('hero','feature','spec','any')),
  active           boolean not null default true,
  created_at       timestamptz not null default now()
);
create index if not exists unsplash_images_category_idx on unsplash_images (category, active);

create table if not exists payments (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  order_id    text unique not null,
  payment_key text,
  amount_krw  int not null,
  credits     int not null,
  status      text not null check (status in ('pending','paid','failed','canceled')),
  email       text,
  raw         jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists payments_session_idx on payments (session_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists generations_set_updated_at on generations;
create trigger generations_set_updated_at
  before update on generations
  for each row execute function set_updated_at();

drop trigger if exists payments_set_updated_at on payments;
create trigger payments_set_updated_at
  before update on payments
  for each row execute function set_updated_at();

-- All access goes through the service-role client on the server, so RLS stays
-- off. If anon reads of unsplash_images are ever needed from the browser,
-- enable RLS here and add a select-only policy.
alter table sessions        disable row level security;
alter table credit_logs     disable row level security;
alter table generations     disable row level security;
alter table unsplash_images disable row level security;
alter table payments        disable row level security;
