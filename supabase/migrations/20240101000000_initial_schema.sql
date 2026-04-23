-- Initial schema for Project Management app
-- Tables: profiles, projects, project_members, tasks, calendar_events

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles — extends auth.users with display info
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view all profiles"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- projects
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- ============================================================
-- project_members — join table for project access
-- ============================================================
create table if not exists public.project_members (
  project_id uuid not null references public.projects on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

alter table public.project_members enable row level security;

-- Project policies: members can see & manage their projects
create policy "Members can view their projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = projects.id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Owners can update their projects"
  on public.projects for update
  using (owner_id = auth.uid());

create policy "Authenticated users can create projects"
  on public.projects for insert
  with check (auth.uid() is not null);

create policy "Owners can delete their projects"
  on public.projects for delete
  using (owner_id = auth.uid());

-- project_members policies
create policy "Members can view project membership"
  on public.project_members for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
    )
  );

create policy "Project owners can manage members"
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = project_members.project_id
        and projects.owner_id = auth.uid()
    )
  );

create policy "Project owners can remove members"
  on public.project_members for delete
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_members.project_id
        and projects.owner_id = auth.uid()
    )
  );

-- ============================================================
-- tasks
-- ============================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references auth.users on delete set null,
  due_date date,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Project members can view tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = tasks.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can create tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.project_members
      where project_members.project_id = tasks.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can update tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = tasks.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = tasks.project_id
        and project_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- calendar_events
-- ============================================================
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  title text not null,
  description text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  all_day boolean not null default false,
  color text,
  task_id uuid references public.tasks on delete set null,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

create policy "Project members can view events"
  on public.calendar_events for select
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = calendar_events.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can create events"
  on public.calendar_events for insert
  with check (
    exists (
      select 1 from public.project_members
      where project_members.project_id = calendar_events.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can update events"
  on public.calendar_events for update
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = calendar_events.project_id
        and project_members.user_id = auth.uid()
    )
  );

create policy "Project members can delete events"
  on public.calendar_events for delete
  using (
    exists (
      select 1 from public.project_members
      where project_members.project_id = calendar_events.project_id
        and project_members.user_id = auth.uid()
    )
  );

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.update_updated_at();

create trigger calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.update_updated_at();

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_tasks_project_status on public.tasks (project_id, status);
create index if not exists idx_tasks_assignee on public.tasks (assignee_id);
create index if not exists idx_tasks_due_date on public.tasks (due_date);
create index if not exists idx_calendar_events_project on public.calendar_events (project_id);
create index if not exists idx_calendar_events_dates on public.calendar_events (start_date, end_date);
create index if not exists idx_project_members_user on public.project_members (user_id);
