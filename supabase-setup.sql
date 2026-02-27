-- Spray Wall Tracker — Supabase Setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- 1. Wall Photos table
create table wall_photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  uploaded_at timestamptz not null default now(),
  is_active boolean not null default false
);

-- 2. Problems table
create table problems (
  id uuid primary key default gen_random_uuid(),
  wall_photo_id uuid not null references wall_photos(id),
  name text not null,
  grade text not null,
  move_count integer,
  holds jsonb not null default '[]',
  feet_rules text not null default 'selected_feet_only',
  start_type text not null default 'stand',
  status text not null default 'project',
  rating integer,
  is_saved boolean not null default false,
  tags jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Sends table
create table sends (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references problems(id),
  sent_at timestamptz not null default now()
);

-- 4. Indexes
create index idx_problems_wall_photo_id on problems(wall_photo_id);
create index idx_problems_status on problems(status);
create index idx_sends_problem_id on sends(problem_id);

-- 5. RLS policies (public access, no auth)
alter table wall_photos enable row level security;
alter table problems enable row level security;
alter table sends enable row level security;

create policy "Allow all access to wall_photos"
  on wall_photos for all
  using (true)
  with check (true);

create policy "Allow all access to problems"
  on problems for all
  using (true)
  with check (true);

create policy "Allow all access to sends"
  on sends for all
  using (true)
  with check (true);

-- 6. Storage bucket for wall photos
-- Run this in the SQL Editor too:
insert into storage.buckets (id, name, public)
values ('wall-photos', 'wall-photos', true);

create policy "Allow public read access on wall-photos"
  on storage.objects for select
  using (bucket_id = 'wall-photos');

create policy "Allow public insert access on wall-photos"
  on storage.objects for insert
  with check (bucket_id = 'wall-photos');

create policy "Allow public update access on wall-photos"
  on storage.objects for update
  using (bucket_id = 'wall-photos');

create policy "Allow public delete access on wall-photos"
  on storage.objects for delete
  using (bucket_id = 'wall-photos');
