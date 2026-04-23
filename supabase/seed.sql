-- Seed data for Project Management app
-- Note: In local dev with Supabase, seed runs after migrations.
-- The demo user must be created via the Supabase auth UI or signup flow.
-- This seed uses a fixed UUID so tasks/events can reference a known project.

-- Demo project
insert into public.projects (id, name, description)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Website Redesign',
  'Complete redesign of the company website with modern UI/UX'
) on conflict (id) do nothing;

-- Sample tasks across all three statuses
insert into public.tasks (project_id, title, description, status, priority, sort_order, due_date)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Design new homepage layout', 'Create wireframes and mockups for the homepage redesign', 'todo', 'high', 0, current_date + interval '7 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'todo', 'medium', 1, current_date + interval '5 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Write API documentation', 'Document all REST endpoints with request/response examples', 'todo', 'low', 2, current_date + interval '14 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Implement user authentication', 'Add login, signup, and password reset flows', 'in_progress', 'high', 0, current_date + interval '3 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Build dashboard components', 'Create reusable chart and stats card components', 'in_progress', 'medium', 1, current_date + interval '4 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Optimize database queries', 'Add indexes and optimize slow queries identified in profiling', 'in_progress', 'high', 2, current_date + interval '2 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Set up project repository', 'Initialize repo with linting, formatting, and test config', 'done', 'medium', 0, current_date - interval '3 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Create design system', 'Define color palette, typography, and component library', 'done', 'high', 1, current_date - interval '5 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Deploy staging environment', 'Set up staging server with Docker and reverse proxy', 'done', 'medium', 2, current_date - interval '1 day'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Conduct user research', 'Interview 10 users and compile feedback report', 'done', 'low', 3, current_date - interval '7 days')
on conflict do nothing;

-- Sample calendar events
insert into public.calendar_events (project_id, title, description, start_date, end_date, all_day, color)
values
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Sprint Planning', 'Plan tasks for the next two-week sprint', current_date + interval '1 day' + interval '10 hours', current_date + interval '1 day' + interval '11 hours', false, '#6366f1'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Design Review', 'Review homepage mockups with the team', current_date + interval '3 days' + interval '14 hours', current_date + interval '3 days' + interval '15 hours', false, '#8b5cf6'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Release v2.0', 'Deploy redesigned website to production', current_date + interval '10 days', current_date + interval '10 days', true, '#10b981'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Team Standup', 'Daily 15-min sync on progress and blockers', current_date + interval '9 hours', current_date + interval '9 hours 15 minutes', false, '#f59e0b')
on conflict do nothing;
