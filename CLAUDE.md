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
npx tsc --noEmit         # Type check
npm run lint             # ESLint
```

## Architecture

- `src/` — Application source code
- `src/components/` — Reusable React components
- `src/pages/` or `src/routes/` — Page components
- `src/lib/` — Utilities and helpers
- `public/` — Static assets

## Rules

- TypeScript strict mode — no `any` types
- Radix UI + Tailwind CSS for styling — no custom CSS files
- ARIA labels on all interactive elements
- Error + loading states on all data-fetching components
