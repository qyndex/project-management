# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Management — Full-featured Kanban board with drag-and-drop, calendar with event management, Supabase auth, and real-time data persistence.

Built with Vite, React 19, TypeScript 5.9, Tailwind CSS, and Supabase (PostgreSQL + Auth + Realtime).

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build (tsc + vite build)
npm run preview          # Preview production build
npm run typecheck        # Type check (tsc --noEmit)
npm run lint             # ESLint
npm test                 # Unit tests (vitest run)
npm run test:watch       # Unit tests in watch mode
npm run test:coverage    # Unit tests with v8 coverage report
npm run test:e2e         # Playwright E2E tests (requires dev server or webServer auto-start)
npx playwright install   # Install Playwright browsers (first time)
npx supabase start       # Start local Supabase (PostgreSQL, Auth, Realtime)
npx supabase db reset    # Reset DB and re-run migrations + seed
npx supabase stop        # Stop local Supabase
```

## Architecture

- `src/` — Application source code
- `src/components/` — Reusable React components (`Column`, `TaskCard`, `TaskModal`, `EventModal`)
- `src/pages/` — Page-level components (`KanbanBoard`, `Calendar`, `Login`, `Signup`)
- `src/hooks/` — Custom React hooks (`useTasks`, `useCalendarEvents`, `useProject`)
- `src/lib/` — Utilities (`supabase.ts`, `AuthProvider.tsx`, `i18n.ts`)
- `src/types/` — TypeScript type definitions (`database.ts`)
- `src/locales/` — Translation JSON files
- `src/test/` — Vitest unit test files + `setup.ts`
- `e2e/` — Playwright end-to-end specs
- `supabase/migrations/` — Database schema migrations
- `supabase/seed.sql` — Sample data for local development
- `public/` — Static assets

## Database Schema

Tables (all in `public` schema with RLS enabled):

- `profiles` — User display info (auto-created on signup via trigger)
- `projects` — Project containers
- `project_members` — Join table for project access control (owner/admin/member)
- `tasks` — Kanban tasks with status (todo/in_progress/done), priority (low/medium/high), sort_order
- `calendar_events` — Calendar events with start/end dates, color, optional task link

RLS policies enforce that only project members can read/write tasks and events within their projects.

## Auth Flow

- Supabase Auth handles signup, login, and session management
- `AuthProvider` wraps the app and provides `useAuth()` hook
- Unauthenticated users are redirected to `/login`
- On first login, a default project is auto-created and user is added as owner
- Profile is auto-created via database trigger on `auth.users` insert

## Data Flow

- `useTasks(projectId)` — CRUD + realtime subscription for tasks
- `useCalendarEvents(projectId)` — CRUD + realtime subscription for calendar events
- Drag-and-drop on Kanban board triggers optimistic status + sort_order updates
- All data persists to Supabase PostgreSQL (survives page refresh)
- Realtime subscriptions keep data in sync across browser tabs

## Testing

Unit tests live in `src/test/` and are co-located by feature name:
- `TaskCard.test.tsx` — draggable card rendering
- `Column.test.tsx` — droppable column rendering and children
- `KanbanBoard.test.tsx` — full board with seed tasks and column layout

`@dnd-kit/core` hooks (`useDraggable`, `useDroppable`, `DndContext`) are vi.mock'd in unit
tests to avoid pointer-event requirements. Real drag behaviour is covered by E2E.

E2E specs in `e2e/home.spec.ts` cover navigation, column rendering, seed tasks, and the
calendar page. They run against the Vite dev server (auto-started by `playwright.config.ts`).

## Rules

- TypeScript strict mode — no `any` types
- Tailwind CSS utility classes — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
- Unit test coverage >=80% on new components
- All dnd-kit hooks mocked in unit tests; real drag tested in E2E
- SQL migrations use `IF NOT EXISTS` for idempotency
- RLS policies required on every table
- Supabase client accessed via `src/lib/supabase.ts` singleton only
