import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Column from '../components/Column';

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    useDroppable: () => ({
      setNodeRef: () => undefined,
      isOver: false,
      over: null,
    }),
  };
});

describe('Column', () => {
  it('renders the column title badge', () => {
    render(<Column id="todo" title="To Do" count={3}><span /></Column>);
    expect(screen.getByText('To Do')).toBeInTheDocument();
  });

  it('renders the task count', () => {
    render(<Column id="todo" title="To Do" count={5}><span /></Column>);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders children inside the column', () => {
    render(
      <Column id="in_progress" title="In Progress" count={1}>
        <span data-testid="child-task">Task A</span>
      </Column>,
    );
    expect(screen.getByTestId('child-task')).toBeInTheDocument();
    expect(screen.getByText('Task A')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Column id="todo" title="To Do" count={2}>
        <span data-testid="t1">T1</span>
        <span data-testid="t2">T2</span>
      </Column>,
    );
    expect(screen.getByTestId('t1')).toBeInTheDocument();
    expect(screen.getByTestId('t2')).toBeInTheDocument();
  });

  it('shows column label from COLUMN_LABELS map', () => {
    render(<Column id="in_progress" title="In Progress" count={0}><span /></Column>);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
