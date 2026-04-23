import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface Props { id: string; title: string; children: ReactNode }

export default function Column({ id, title, children }: Props) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="flex-1 bg-gray-100 rounded-lg p-4 min-h-[400px]">
      <h3 className="font-semibold text-sm uppercase text-gray-500 mb-3">{title}</h3>
      {children}
    </div>
  );
}
