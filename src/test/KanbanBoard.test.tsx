import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanBoard from '../pages/KanbanBoard';
import type { Task } from '../types/database';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockTasks, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: () => {},
  },
}));

// Mock useProject
vi.mock('../hooks/useProject', () => ({
  useProject: () => ({
    project: { id: 'proj-1', name: 'Test', description: null, owner_id: null, created_at: '' },
    projectId: 'proj-1',
    loading: false,
    error: null,
  }),
  ProjectContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
}));

// Stub dnd-kit so column droppables and task draggables render without
// requiring real pointer events or a DndContext in the test environment.
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useDraggable: () => ({
      attributes: { role: 'button', tabIndex: 0 },
      listeners: {},
      setNodeRef: () => undefined,
      transform: null,
      isDragging: false,
    }),
    useDroppable: () => ({
      setNodeRef: () => undefined,
      isOver: false,
      over: null,
    }),
    closestCenter: actual.closestCenter,
  };
});

const mockTasks: Task[] = [
  {
    id: '1', project_id: 'proj-1', title: 'Design landing page', description: null,
    status: 'todo', priority: 'high', assignee_id: null, due_date: null,
    sort_order: 0, created_at: '', updated_at: '',
  },
  {
    id: '2', project_id: 'proj-1', title: 'Implement auth', description: null,
    status: 'in_progress', priority: 'medium', assignee_id: null, due_date: null,
    sort_order: 0, created_at: '', updated_at: '',
  },
  {
    id: '3', project_id: 'proj-1', title: 'Write tests', description: null,
    status: 'done', priority: 'low', assignee_id: null, due_date: null,
    sort_order: 0, created_at: '', updated_at: '',
  },
];

describe('KanbanBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three column headings', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('renders the tasks from Supabase', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByText('Design landing page')).toBeInTheDocument();
      expect(screen.getByText('Implement auth')).toBeInTheDocument();
      expect(screen.getByText('Write tests')).toBeInTheDocument();
    });
  });

  it('renders exactly three columns', async () => {
    const { container } = render(<KanbanBoard />);
    await waitFor(() => {
      const flexRow = container.querySelector('.flex.gap-6');
      expect(flexRow?.children).toHaveLength(3);
    });
  });

  it('shows the New Task button', async () => {
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New task/i })).toBeInTheDocument();
    });
  });

  it('opens task modal when New Task is clicked', async () => {
    const user = userEvent.setup();
    render(<KanbanBoard />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /New task/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /New task/i }));
    expect(screen.getByRole('dialog', { name: /New task/i })).toBeInTheDocument();
  });
});
