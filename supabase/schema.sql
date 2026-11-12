-- DevTrack database schema (PostgreSQL / Supabase)
-- Run this once in the Supabase SQL Editor.
--
-- Design rule that keeps the To-Do list and the Calendar in sync:
-- there is NO calendar table. A calendar event is just a row in `tasks`
-- (or a project's due_date) drawn on a grid. Both views read and write
-- the same rows, so they cannot disagree.

-- ---------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------
create type project_status as enum ('planning', 'in_progress', 'testing', 'completed');
create type priority_level as enum ('low', 'medium', 'high');

-- ---------------------------------------------------------------
-- profiles: app-level user data, 1:1 with Supabase's auth.users
-- ---------------------------------------------------------------
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------
create table projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  description text,
  repo_url    text check (repo_url is null or repo_url ~* '^https?://'),
  status      project_status not null default 'planning',
  priority    priority_level not null default 'medium',
  color       text not null default '#EFBDBD' check (color ~ '^#[0-9a-fA-F]{6}$'),
  due_date    date,                 -- project deadline, shown on the calendar
  archived_at timestamptz,          -- null = active; a timestamp = archived (soft delete)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- tags + project_tags: tech stack labels (many-to-many)
-- A tag such as "React" is stored once per user and linked to any
-- number of projects, instead of repeating text inside projects.
-- ---------------------------------------------------------------
create table tags (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name    text not null check (char_length(name) between 1 and 40)
);
create unique index tags_user_name_key on tags (user_id, lower(name));

create table project_tags (
  project_id uuid not null references projects (id) on delete cascade,
  tag_id     uuid not null references tags (id) on delete cascade,
  primary key (project_id, tag_id)
);

-- ---------------------------------------------------------------
-- tasks
-- project_id is nullable: null = standalone daily task.
-- completed_at stores both "is it done?" and "when?", so there is
-- no separate boolean that could contradict it.
-- ---------------------------------------------------------------
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  project_id   uuid references projects (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  notes        text,
  due_date     date not null,
  priority     priority_level not null default 'medium',
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Indexes for the queries the app actually runs
create index projects_user_idx    on projects (user_id) where archived_at is null;
create index tasks_user_due_idx   on tasks (user_id, due_date);   -- calendar range queries
create index tasks_project_idx    on tasks (project_id);
create index project_tags_tag_idx on project_tags (tag_id);

-- ---------------------------------------------------------------
-- Keep updated_at current
-- ---------------------------------------------------------------
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at before update on projects
  for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------
-- Create a profile row automatically when someone signs up
-- ---------------------------------------------------------------
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------
-- Row Level Security: each user can only see and change their own rows
-- ---------------------------------------------------------------
alter table profiles     enable row level security;
alter table projects     enable row level security;
alter table tags         enable row level security;
alter table project_tags enable row level security;
alter table tasks        enable row level security;

create policy "own profile" on profiles for all
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "own projects" on projects for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own tags" on tags for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "own tasks" on tasks for all
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- project_tags has no user_id column; ownership comes from the project.
create policy "own project tags" on project_tags for all
  using (exists (select 1 from projects p where p.id = project_id and p.user_id = (select auth.uid())))
  with check (exists (select 1 from projects p where p.id = project_id and p.user_id = (select auth.uid())));

-- ---------------------------------------------------------------
-- Realtime: broadcast changes so other open tabs/devices update
-- ---------------------------------------------------------------
alter publication supabase_realtime add table projects, tasks;
