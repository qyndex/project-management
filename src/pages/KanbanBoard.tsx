import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { useState } from 'react';
import Column from '../components/Column';
import TaskCard from '../components/TaskCard';

interface Task { id: string; title: string; column: string }

const initialTasks: Task[] = [
  { id: '1', title: 'Design landing page', column: 'todo' },
  { id: '2', title: 'Implement auth', column: 'in-progress' },
  { id: '3', title: 'Write tests', column: 'done' },
];

const columns = ['todo', 'in-progress', 'done'];

export default function KanbanBoard() {
  const [tasks, setTasks] = useState(initialTasks);

  const handleDragEnd = (event: DragEndEvent): void => {
    const { active, over } = event;
    if (over) {
      setTasks((prev) =>
        prev.map((t) => (t.id === active.id ? { ...t, column: String(over.id) } : t))
      );
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-6">
        {columns.map((col) => (
          <Column key={col} id={col} title={col}>
            {tasks.filter((t) => t.column === col).map((t) => (
              <TaskCard key={t.id} id={t.id} title={t.title} />
            ))}
          </Column>
        ))}
      </div>
    </DndContext>
  );
}
