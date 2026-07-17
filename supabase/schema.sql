-- Water Debt Tracker schema
-- Run this in the Supabase SQL editor for your project (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  client_id text unique, -- set by the client when created offline, used to avoid duplicate sync
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null check (type in ('sale', 'payment')),
  amount numeric(12, 2) not null check (amount >= 0),
  quantity numeric(12, 2), -- liters/bottles sold, sale entries only
  recorded_by text not null,
  note text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists entries_customer_id_idx on entries(customer_id);
create index if not exists entries_entry_date_idx on entries(entry_date);

-- No login in this app, so the anon key is used directly by the browser.
-- Row Level Security is enabled with a permissive policy (open to anyone with
-- the anon key / project URL) rather than disabled outright, matching the
-- "anyone with the link can see/edit everything" design decision.
alter table family_members enable row level security;
alter table customers enable row level security;
alter table entries enable row level security;

create policy "public full access" on family_members for all using (true) with check (true);
create policy "public full access" on customers for all using (true) with check (true);
create policy "public full access" on entries for all using (true) with check (true);

-- Seed a couple of family member names so the "recorded by" dropdown isn't empty.
-- Edit these to match your family, or add more later from the Settings page.
insert into family_members (name) values ('Dad'), ('Me')
  on conflict (name) do nothing;
