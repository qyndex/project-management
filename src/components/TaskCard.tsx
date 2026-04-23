import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types/database';

interface Props {
  task: Task;
  onClick: (task: Task) => void;
}

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-2 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
      onClick={(e) => {
        // Only open modal if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onClick(task);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(task);
        }
      }}
    >
      <p className="text-sm font-medium text-gray-900 mb-2">{task.title}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.due_date && (
          <span className="text-xs text-gray-500">
            {new Date(task.due_date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
      )}
    </div>
  );
}
