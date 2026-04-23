import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import KanbanBoard from '../pages/KanbanBoard';

// Stub dnd-kit so column droppables and task draggables render without
// requiring real pointer events or a DndContext in the test environment.
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useDraggable: () => ({
      attributes: { role: 'button', tabIndex: 0 },
      listeners: {},
      setNodeRef: () => undefined,
      transform: null,
    }),
    useDroppable: () => ({
      setNodeRef: () => undefined,
      isOver: false,
      over: null,
    }),
    closestCenter: actual.closestCenter,
  };
});

describe('KanbanBoard', () => {
  it('renders all three column headings', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('todo')).toBeInTheDocument();
    expect(screen.getByText('in-progress')).toBeInTheDocument();
    expect(screen.getByText('done')).toBeInTheDocument();
  });

  it('renders the initial seed tasks', () => {
    render(<KanbanBoard />);
    expect(screen.getByText('Design landing page')).toBeInTheDocument();
    expect(screen.getByText('Implement auth')).toBeInTheDocument();
    expect(screen.getByText('Write tests')).toBeInTheDocument();
  });

  it('places tasks in the correct initial columns', () => {
    render(<KanbanBoard />);
    // Each column is a flex child; verify task text is present
    const todoCol = screen.getByText('todo').closest('div');
    const doneCol = screen.getByText('done').closest('div');
    expect(todoCol).toBeTruthy();
    expect(doneCol).toBeTruthy();
  });

  it('renders exactly three columns', () => {
    const { container } = render(<KanbanBoard />);
    // The outer flex wrapper contains exactly 3 direct column children
    const flexRow = container.querySelector('.flex.gap-6');
    expect(flexRow?.children).toHaveLength(3);
  });
});
