import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TaskCard from '../components/TaskCard';

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
    }),
  };
});

describe('TaskCard', () => {
  it('renders the task title', () => {
    render(<TaskCard id="1" title="Design landing page" />);
    expect(screen.getByText('Design landing page')).toBeInTheDocument();
  });

  it('applies no inline transform when transform is null', () => {
    const { container } = render(<TaskCard id="2" title="Write tests" />);
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toBe('');
  });

  it('has cursor-grab class for drag affordance', () => {
    const { container } = render(<TaskCard id="3" title="Implement auth" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('cursor-grab');
  });

  it('renders task title inside a paragraph element', () => {
    render(<TaskCard id="4" title="Deploy to production" />);
    const p = screen.getByText('Deploy to production');
    expect(p.tagName).toBe('P');
  });
});
