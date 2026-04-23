import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}

const COLUMN_HEADER_COLORS: Record<string, string> = {
  todo: 'bg-blue-50 text-blue-700',
  in_progress: 'bg-amber-50 text-amber-700',
  done: 'bg-green-50 text-green-700',
};

const COLUMN_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

export default function Column({ id, title, count, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 rounded-xl p-4 min-h-[400px] transition-colors ${
        isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            COLUMN_HEADER_COLORS[id] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {COLUMN_LABELS[id] ?? title}
        </span>
        <span className="text-xs text-gray-400 font-medium">{count}</span>
      </div>
      <div className="space-y-0">{children}</div>
    </div>
  );
}
