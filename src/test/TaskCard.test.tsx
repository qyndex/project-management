import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../components/TaskCard';
import type { Task } from '../types/database';

// @dnd-kit/core requires a DndContext — provide a minimal stub so TaskCard
// can be rendered in isolation without real pointer-event infrastructure.
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    useDraggable: () => ({
      attributes: { role: 'button', tabIndex: 0 },
      listeners: {},
      setNodeRef: () => undefined,
      transform: null,
      isDragging: false,
    }),
  };
});

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  project_id: 'proj-1',
  title: 'Design landing page',
  description: null,
  status: 'todo',
  priority: 'medium',
  assignee_id: null,
  due_date: null,
  sort_order: 0,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

describe('TaskCard', () => {
  it('renders the task title', () => {
    const task = makeTask();
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('Design landing page')).toBeInTheDocument();
  });

  it('shows priority badge', () => {
    const task = makeTask({ priority: 'high' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('high')).toBeInTheDocument();
  });

  it('shows due date when present', () => {
    const task = makeTask({ due_date: '2024-03-15' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('Mar 15')).toBeInTheDocument();
  });

  it('shows description when present', () => {
    const task = makeTask({ description: 'Some details here' });
    render(<TaskCard task={task} onClick={() => {}} />);
    expect(screen.getByText('Some details here')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const task = makeTask();
    render(<TaskCard task={task} onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: /Task: Design landing page/i }));
    expect(onClick).toHaveBeenCalledWith(task);
  });

  it('has cursor-grab class for drag affordance', () => {
    const task = makeTask();
    const { container } = render(<TaskCard task={task} onClick={() => {}} />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('cursor-grab');
  });

  it('applies no inline transform when transform is null', () => {
    const task = makeTask();
    const { container } = render(<TaskCard task={task} onClick={() => {}} />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toBe('');
  });
});
