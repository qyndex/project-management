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
  it('renders the column title', () => {
    render(<Column id="todo" title="todo"><span /></Column>);
    expect(screen.getByText('todo')).toBeInTheDocument();
  });

  it('renders children inside the column', () => {
    render(
      <Column id="in-progress" title="in-progress">
        <span data-testid="child-task">Task A</span>
      </Column>,
    );
    expect(screen.getByTestId('child-task')).toBeInTheDocument();
    expect(screen.getByText('Task A')).toBeInTheDocument();
  });

  it('renders title as an h3 element', () => {
    render(<Column id="done" title="done"><span /></Column>);
    const heading = screen.getByText('done');
    expect(heading.tagName).toBe('H3');
  });

  it('renders multiple children', () => {
    render(
      <Column id="todo" title="todo">
        <span data-testid="t1">T1</span>
        <span data-testid="t2">T2</span>
      </Column>,
    );
    expect(screen.getByTestId('t1')).toBeInTheDocument();
    expect(screen.getByTestId('t2')).toBeInTheDocument();
  });
});
