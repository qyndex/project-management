# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Project Management — Kanban board with drag-and-drop, calendar view, team management, and notifications.

Built with Vite, React 19, TypeScript 5.9, and Tailwind CSS.

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
```

## Architecture

- `src/` — Application source code
- `src/components/` — Reusable React components (`Column`, `TaskCard`)
- `src/pages/` — Page-level components (`KanbanBoard`, `Calendar`)
- `src/lib/` — Utilities and helpers (`i18n.ts`)
- `src/locales/` — Translation JSON files
- `src/test/` — Vitest unit test files + `setup.ts`
- `e2e/` — Playwright end-to-end specs
- `public/` — Static assets

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
- Unit test coverage ≥80% on new components
- All dnd-kit hooks mocked in unit tests; real drag tested in E2E
